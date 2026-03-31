"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const { token } = useAuth();
  const [downloadState, setDownloadState] = useState<string>("");
  const [topLimit, setTopLimit] = useState<number>(10);
  const { data } = useQuery({
    queryKey: ["admin-reports", topLimit],
    queryFn: () => api<any>(`/admin/reports?limit=${encodeURIComponent(String(topLimit))}`, { token }),
    enabled: !!token,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const downloadReport = async (format: "pdf" | "excel") => {
    if (!token) return;
    setDownloadState(`Preparing ${format.toUpperCase()} export...`);
    const response = await fetch(
      `${apiUrl}/admin/reports/export?report=top-achievers&format=${format}&limit=${encodeURIComponent(
        String(topLimit)
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `top-achievers.${format === "pdf" ? "pdf" : "xlsx"}`;
    link.click();
    window.URL.revokeObjectURL(url);
    setDownloadState(`Downloaded ${format.toUpperCase()} report.`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .rp-wrap {
          --ink: #0d1117;
          --slate: #57606a;
          --slate-light: #8b949e;
          --brand: #1a56db;
          --brand-light: #eef2ff;
          --green: #16a34a;
          --green-light: #dcfce7;
          --surface: #f6f8fa;
          --white: #ffffff;
          --border: #d0d7de;
          --border-light: #eaeef2;
          --radius-lg: 18px;
          --radius-xl: 24px;
          --shadow: 0 3px 12px rgba(31,35,40,0.08), 0 1px 3px rgba(31,35,40,0.04);
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body: 'Geist', system-ui, sans-serif;
          font-family: var(--font-body);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* PAGE HEADER */
        .rp-page-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 28px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .rp-breadcrumb {
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--slate-light); margin-bottom: 8px;
          display: flex; align-items: center; gap: 5px;
        }
        .rp-page-title {
          font-family: var(--font-display);
          font-size: 30px; font-weight: 400;
          color: var(--ink); line-height: 1.1;
        }
        .rp-page-title em { font-style: italic; color: var(--brand); }
        .rp-page-sub { font-size: 14px; color: var(--slate); margin-top: 5px; }
        .rp-live-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--slate-light);
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 100px; padding: 6px 14px;
          white-space: nowrap; margin-top: 4px;
        }
        .rp-live-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; }

        /* MAIN GRID */
        .rp-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 20px;
        }

        /* SHARED CARD */
        .rp-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .rp-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px 14px;
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap; gap: 10px;
        }
        .rp-card-title {
          font-size: 14px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }
        .rp-card-title-dot {
          width: 7px; height: 7px;
          border-radius: 50%; background: var(--brand);
        }
        .rp-card-body { padding: 20px 24px; }

        /* EXPORT BUTTONS */
        .rp-export-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .rp-top-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--slate-light);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .rp-top-input {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 12px; font-weight: 600;
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 6px 10px;
          background: var(--surface);
          color: var(--ink);
          width: 110px;
        }
        .rp-btn {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 13px; font-weight: 600;
          border: none; border-radius: 9px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .rp-btn-pdf {
          background: var(--surface);
          color: var(--ink);
          border: 1.5px solid var(--border);
        }
        .rp-btn-pdf:hover { border-color: var(--ink); background: var(--border-light); }
        .rp-btn-excel {
          background: var(--green-light);
          color: var(--green);
        }
        .rp-btn-excel:hover { background: #bbf7d0; }

        /* DOWNLOAD STATUS */
        .rp-download-status {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--slate);
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 8px 14px;
          margin-bottom: 16px;
        }
        .rp-download-status-dot {
          width: 6px; height: 6px;
          background: var(--brand); border-radius: 50%;
          flex-shrink: 0;
        }

        /* TABLE */
        .rp-table-wrap { overflow-x: auto; }
        .rp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .rp-table thead th {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--slate-light);
          padding: 0 14px 12px;
          text-align: left; white-space: nowrap;
          border-bottom: 1px solid var(--border-light);
        }
        .rp-table thead th:first-child { padding-left: 0; }
        .rp-table tbody tr {
          border-bottom: 1px solid var(--border-light);
          transition: background 0.1s;
        }
        .rp-table tbody tr:last-child { border-bottom: none; }
        .rp-table tbody tr:hover { background: var(--surface); }
        .rp-table tbody td {
          padding: 13px 14px; color: var(--ink); vertical-align: middle;
        }
        .rp-table tbody td:first-child { padding-left: 0; font-weight: 500; }
        .rp-cgpa-badge {
          display: inline-block;
          font-size: 12px; font-weight: 600;
          color: var(--brand);
          background: var(--brand-light);
          border-radius: 100px; padding: 2px 9px;
        }
        .rp-count-badge {
          display: inline-block;
          font-size: 12px; font-weight: 600;
          color: var(--green);
          background: var(--green-light);
          border-radius: 100px; padding: 2px 9px;
        }

        /* CATALOG */
        .rp-catalog-list { display: flex; flex-direction: column; gap: 12px; }
        .rp-catalog-item {
          border-radius: var(--radius-lg);
          padding: 16px 18px;
          display: flex; align-items: flex-start; gap: 12px;
          transition: box-shadow 0.15s;
        }
        .rp-catalog-item:hover { box-shadow: var(--shadow); }
        .rp-catalog-item:nth-child(1) {
          background: var(--brand-light);
          border: 1px solid rgba(26,86,219,0.12);
        }
        .rp-catalog-item:nth-child(2) {
          background: #f0fdf4;
          border: 1px solid rgba(34,197,94,0.12);
        }
        .rp-catalog-item:nth-child(3) {
          background: var(--surface);
          border: 1px solid var(--border-light);
        }
        .rp-catalog-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
        }
        .rp-catalog-item:nth-child(1) .rp-catalog-icon { background: rgba(26,86,219,0.1); }
        .rp-catalog-item:nth-child(2) .rp-catalog-icon { background: rgba(34,197,94,0.1); }
        .rp-catalog-item:nth-child(3) .rp-catalog-icon { background: var(--border-light); }
        .rp-catalog-text { font-size: 13px; color: var(--slate); line-height: 1.6; }

        @media (max-width: 900px) {
          .rp-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="rp-wrap">
        <DashboardShell
          title="Admin dashboard"
          subtitle="Export performance and participation reports in PDF or Excel."
          nav={[
            { label: "Overview", href: "/admin" },
            { label: "Students", href: "/admin/students" },
            { label: "Student achievements", href: "/admin/student-achievements" },
            { label: "Approvals", href: "/admin/approvals" },
            { label: "Analytics", href: "/admin/analytics" },
            { label: "Reports", href: "/admin/reports" },
          ]}
        >
          {/* PAGE HEADER */}
          <div className="rp-page-header">
            <div>
              <div className="rp-breadcrumb">
                <span>Admin</span>
                <span>{">"}</span>
                <span style={{ color: "var(--ink)" }}>Reports</span>
              </div>
              <h1 className="rp-page-title">
                Performance <em>reports</em>
              </h1>
              <p className="rp-page-sub">
                Export top-achiever data and participation reports for accreditation and review.
              </p>
            </div>
            <div className="rp-live-badge">
              <span className="rp-live-dot" />
              Live data
            </div>
          </div>

          <div className="rp-grid">
            {/* TOP ACHIEVERS */}
            <section className="rp-card">
              <div className="rp-card-header">
                <span className="rp-card-title">
                  <span className="rp-card-title-dot" />
                  Top achievers
                </span>
                <div className="rp-export-row">
                  <span className="rp-top-label">Top</span>
                  <input
                    className="rp-top-input"
                    type="number"
                    min={1}
                    max={200}
                    value={topLimit}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      if (Number.isFinite(nextValue) && nextValue > 0) {
                        setTopLimit(Math.min(200, Math.max(1, nextValue)));
                      }
                    }}
                    aria-label="Top students count"
                  />
                  <button className="rp-btn rp-btn-pdf" onClick={() => downloadReport("pdf")}>
                    PDF
                  </button>
                  <button className="rp-btn rp-btn-excel" onClick={() => downloadReport("excel")}>
                    Excel
                  </button>
                </div>
              </div>
              <div className="rp-card-body">
                {downloadState ? (
                  <div className="rp-download-status">
                    <span className="rp-download-status-dot" />
                    {downloadState}
                  </div>
                ) : null}
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>CGPA</th>
                        <th>Achievements</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.topAchievers || []).map((student: any, idx: number) => (
                        <tr key={student._id || `${student.studentId || "student"}-${idx}`}>
                          <td>{student.fullName}</td>
                          <td style={{ color: "var(--slate)" }}>{student.department}</td>
                          <td>
                            <span className="rp-cgpa-badge">{student.cgpa}</span>
                          </td>
                          <td>
                            <span className="rp-count-badge">{student.achievementsCount}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* REPORT CATALOG */}
            <section className="rp-card">
              <div className="rp-card-header">
                <span className="rp-card-title">
                  <span className="rp-card-title-dot" />
                  Report catalog
                </span>
              </div>
              <div className="rp-card-body">
                <div className="rp-catalog-list">
                  <div className="rp-catalog-item">
                    <div className="rp-catalog-icon">Chart</div>
                    <p className="rp-catalog-text">
                      Department achievements for comparing participation intensity across programs.
                    </p>
                  </div>
                  <div className="rp-catalog-item">
                    <div className="rp-catalog-icon">Award</div>
                    <p className="rp-catalog-text">
                      Student participation report for competitions, hackathons, and clubs.
                    </p>
                  </div>
                  <div className="rp-catalog-item">
                    <div className="rp-catalog-icon">Docs</div>
                    <p className="rp-catalog-text">
                      Certification statistics segmented by approval status.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </DashboardShell>
      </div>
    </>
  );
}
