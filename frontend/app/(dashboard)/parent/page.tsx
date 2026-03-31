"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const statusStyle = (s: string) =>
  s === "Approved" || s === "approved"
    ? { bg: "#dcfce7", color: "#15803d", dot: "#22c55e" }
    : s === "Pending" || s === "pending"
    ? { bg: "#fef9c3", color: "#a16207", dot: "#eab308" }
    : { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444" };

export default function ParentDashboardPage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: () => api<any>("/parents/me", { token }),
    enabled: !!token,
  });

  const student = data?.student;
  const achievements = data?.achievements || [];
  const documents = data?.documents || [];

  const downloadMutation = useMutation({
    mutationFn: (id: string) => api<{ downloadUrl: string }>(`/documents/${id}/download-url`, { token }),
    onSuccess: (payload) => {
      if (payload?.downloadUrl) {
        window.open(payload.downloadUrl, "_blank", "noopener,noreferrer");
      }
    },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .pd-wrap {
          --ink: #0d1117;
          --slate: #57606a;
          --slate-light: #8b949e;
          --brand: #1a56db;
          --brand-light: #eef2ff;
          --surface: #f6f8fa;
          --white: #ffffff;
          --border: #d0d7de;
          --border-light: #eaeef2;
          --radius: 10px;
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
        .pd-page-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 28px;
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .pd-breadcrumb {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--slate-light); margin-bottom: 8px;
          display: flex; align-items: center; gap: 5px;
        }
        .pd-page-title {
          font-family: var(--font-display);
          font-size: 30px; font-weight: 400; color: var(--ink); line-height: 1.1;
        }
        .pd-page-title em { font-style: italic; color: var(--brand); }
        .pd-page-sub { font-size: 14px; color: var(--slate); margin-top: 5px; }
        .pd-live-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--slate-light);
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: 100px; padding: 6px 14px;
          white-space: nowrap; margin-top: 4px;
        }
        .pd-live-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; }

        /* STATS ROW */
        .pd-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        /* MAIN GRID */
        .pd-main-grid {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        /* SHARED CARD */
        .pd-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .pd-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px 14px;
          border-bottom: 1px solid var(--border-light);
        }
        .pd-card-title {
          font-size: 14px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }
        .pd-card-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); }
        .pd-card-count {
          font-size: 11px; font-weight: 500; color: var(--slate-light);
          background: var(--surface); border-radius: 100px; padding: 3px 10px;
        }
        .pd-card-body { padding: 18px 22px; }

        /* STUDENT PROFILE */
        .pd-student-hero {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 22px;
          border-bottom: 1px solid var(--border-light);
          background: linear-gradient(135deg, var(--brand-light) 0%, var(--white) 60%);
        }
        .pd-avatar {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--brand); color: white; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 20px;
          box-shadow: 0 2px 8px rgba(26,86,219,0.2);
        }
        .pd-student-name { font-size: 16px; font-weight: 600; color: var(--ink); }
        .pd-student-sub { font-size: 12px; color: var(--slate); margin-top: 2px; }
        .pd-verified {
          margin-left: auto;
          font-size: 11px; font-weight: 600; color: #15803d;
          background: #dcfce7; border-radius: 100px; padding: 4px 10px;
          white-space: nowrap;
        }

        .pd-fields { display: grid; grid-template-columns: 1fr 1fr; }
        .pd-field {
          padding: 13px 22px;
          border-bottom: 1px solid var(--border-light);
          border-right: 1px solid var(--border-light);
        }
        .pd-field:nth-child(even) { border-right: none; }
        .pd-field:nth-last-child(-n+2) { border-bottom: none; }
        .pd-field-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--slate-light); margin-bottom: 3px;
        }
        .pd-field-value { font-size: 13px; font-weight: 500; color: var(--ink); }

        /* DOCUMENTS */
        .pd-doc-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid var(--border-light);
        }
        .pd-doc-item:last-child { border-bottom: none; }
        .pd-doc-icon {
          width: 36px; height: 36px; border-radius: 8px;
          background: var(--surface); border: 1px solid var(--border-light);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .pd-doc-info { flex: 1; min-width: 0; }
        .pd-doc-title {
          font-size: 13px; font-weight: 600; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pd-doc-type { font-size: 11px; color: var(--slate-light); margin-top: 1px; }
        .pd-doc-btn {
          font-size: 12px; font-weight: 600; color: var(--brand);
          background: var(--brand-light); border: none;
          border-radius: 8px; padding: 6px 12px; cursor: pointer;
          transition: background 0.15s; flex-shrink: 0;
        }
        .pd-doc-btn:hover { background: rgba(26,86,219,0.15); }

        /* ACHIEVEMENT TABLE */
        .pd-table-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .pd-table-wrap { overflow-x: auto; }
        .pd-table {
          width: 100%; border-collapse: collapse; font-size: 13px;
        }
        .pd-table thead th {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--slate-light);
          padding: 0 16px 12px; text-align: left; white-space: nowrap;
          border-bottom: 1px solid var(--border-light);
        }
        .pd-table thead th:first-child { padding-left: 22px; }
        .pd-table thead th:last-child { padding-right: 22px; }
        .pd-table tbody tr {
          border-bottom: 1px solid var(--border-light);
          transition: background 0.1s;
        }
        .pd-table tbody tr:last-child { border-bottom: none; }
        .pd-table tbody tr:hover { background: var(--surface); }
        .pd-table tbody td { padding: 13px 16px; color: var(--ink); vertical-align: middle; }
        .pd-table tbody td:first-child { padding-left: 22px; font-weight: 500; }
        .pd-table tbody td:last-child { padding-right: 22px; }

        .pd-cat-badge {
          display: inline-block; font-size: 11px; font-weight: 500;
          border-radius: 100px; padding: 3px 10px;
          background: var(--surface); color: var(--slate);
          border: 1px solid var(--border-light);
        }
        .pd-status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600;
          border-radius: 100px; padding: 4px 10px;
        }
        .pd-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        .pd-empty { padding: 32px; text-align: center; font-size: 13px; color: var(--slate-light); }

        @media (max-width: 1024px) {
          .pd-main-grid { grid-template-columns: 1fr; }
          .pd-stats-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .pd-stats-row { grid-template-columns: 1fr 1fr; }
          .pd-fields { grid-template-columns: 1fr; }
          .pd-field { border-right: none; }
          .pd-field:nth-last-child(-n+2) { border-bottom: 1px solid var(--border-light); }
          .pd-field:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="pd-wrap">
        <DashboardShell
          title="Parent dashboard"
          subtitle="View your connected child's academic profile, achievements, and documents."
          nav={[{ label: "Overview", href: "/parent" }]}
        >
          {/* PAGE HEADER */}
          <div className="pd-page-header">
            <div>
              <div className="pd-breadcrumb">
                <span>Portal</span><span>›</span>
                <span>Parent</span><span>›</span>
                <span style={{ color: "var(--ink)" }}>Dashboard</span>
              </div>
              <h1 className="pd-page-title">Academic <em>overview</em></h1>
              <p className="pd-page-sub">
                Read-only view of your child's profile, documents, and achievement records.
              </p>
            </div>
            <div className="pd-live-badge">
              <span className="pd-live-dot" />
              Live · Synced now
            </div>
          </div>

          {/* STATS */}
          <section className="pd-stats-row">
            <StatCard label="Child ID" value={student?.studentId ?? "-"} helper="Connected through verified student ID" />
            <StatCard label="Department" value={student?.department ?? "-"} helper="Current academic department" />
            <StatCard label="CGPA" value={student?.cgpa ?? "-"} helper="Latest cumulative GPA" />
            <StatCard label="Achievements" value={achievements.length} helper="Recorded student achievements" />
          </section>

          {/* PROFILE + DOCUMENTS */}
          <section className="pd-main-grid">
            {/* STUDENT PROFILE */}
            <div className="pd-card">
              <div className="pd-student-hero">
                <div className="pd-avatar">{student?.fullName?.[0] ?? "S"}</div>
                <div>
                  <div className="pd-student-name">{student?.fullName}</div>
                  <div className="pd-student-sub">{student?.program} · {student?.department}</div>
                </div>
                <div className="pd-verified">✓ Verified</div>
              </div>
              <div className="pd-fields">
                {[
                  ["Program",   student?.program],
                  ["Admission", student?.admissionCategory || "—"],
                  ["Year",      student?.year],
                  ["Semester",  student?.semester],
                  ["Graduation", student?.graduationYear ?? "—"],
                  ["Backlogs",  student?.backlogs ?? 0],
                  ["CGPA",      student?.cgpa ?? "—"],
                ].map(([label, value]) => (
                  <div className="pd-field" key={String(label)}>
                    <div className="pd-field-label">{label}</div>
                    <div className="pd-field-value">{String(value ?? "—")}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DOCUMENTS */}
            <div className="pd-card">
              <div className="pd-card-header">
                <span className="pd-card-title">
                  <span className="pd-card-dot" />
                  Recent documents
                </span>
                <span className="pd-card-count">{documents.length} files</span>
              </div>
              <div className="pd-card-body">
                {documents.length === 0 ? (
                  <div className="pd-empty">No documents uploaded yet.</div>
                ) : (
                  documents.map((item: any) => (
                    <div className="pd-doc-item" key={item._id}>
                      <div className="pd-doc-icon">📄</div>
                      <div className="pd-doc-info">
                        <div className="pd-doc-title">{item.title}</div>
                        <div className="pd-doc-type">{item.type}</div>
                      </div>
                      <button
                        className="pd-doc-btn"
                        type="button"
                        onClick={() => downloadMutation.mutate(item._id)}
                      >
                        View →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ACHIEVEMENT TIMELINE */}
          <section className="pd-table-card">
            <div className="pd-card-header">
              <span className="pd-card-title">
                <span className="pd-card-dot" />
                Achievement timeline
              </span>
              <span className="pd-card-count">{achievements.length} records</span>
            </div>
            {achievements.length === 0 ? (
              <div className="pd-empty">No achievements recorded yet.</div>
            ) : (
              <div className="pd-table-wrap">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.map((item: any) => {
                      const ss = statusStyle(item.status);
                      return (
                        <tr key={item._id}>
                          <td>{item.title}</td>
                          <td><span className="pd-cat-badge">{item.category}</span></td>
                          <td style={{ color: "var(--slate)", whiteSpace: "nowrap" }}>
                            {formatDate(item.date)}
                          </td>
                          <td>
                            <span className="pd-status-pill" style={{ background: ss.bg, color: ss.color }}>
                              <span className="pd-status-dot" style={{ background: ss.dot }} />
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </DashboardShell>
      </div>
    </>
  );
}
