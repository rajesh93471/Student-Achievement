"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

const ACHIEVEMENT_GROUPS = {
  technical: [
    { value: "hackathon", label: "Hackathon" },
    { value: "competition", label: "Technical Competition" },
    { value: "olympiad", label: "Olympiad" },
    { value: "certification", label: "Certification" },
    { value: "internship", label: "Internship" },
    { value: "project", label: "Project" },
    { value: "research", label: "Research" },
    { value: "academic", label: "Academic" },
  ],
  "non-technical": [
    { value: "sports", label: "Sports" },
    { value: "cultural", label: "Cultural" },
    { value: "club", label: "Club" },
  ],
} as const;

type AchievementGroup = keyof typeof ACHIEVEMENT_GROUPS;

export default function AdminStudentAchievementsPage() {
  const { token } = useAuth();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<AchievementGroup>("technical");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [downloadState, setDownloadState] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-student-achievements"],
    queryFn: () => api<{ achievements: any[] }>("/achievements?status=approved", { token }),
    enabled: !!token,
  });

  const achievements = data?.achievements || [];
  const yearOptions = useMemo(() => {
    const years = achievements
      .map((item) =>
        item.student?.graduationYear != null && item.student?.graduationYear !== ""
          ? String(item.student.graduationYear)
          : null
      )
      .filter((year): year is string => Boolean(year));

    return Array.from(new Set(years)).sort((left, right) => Number(right) - Number(left));
  }, [achievements]);

  const categoryOptions = ACHIEVEMENT_GROUPS[selectedGroup];
  const filteredAchievements = achievements.filter((item) => {
    const graduationYear =
      item.student?.graduationYear != null && item.student?.graduationYear !== ""
        ? String(item.student.graduationYear)
        : "";
    const matchesYear = selectedYear === "all" || graduationYear === selectedYear;
    const matchesGroup = ACHIEVEMENT_GROUPS[selectedGroup].some((option) => option.value === item.category);
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesYear && matchesGroup && matchesCategory;
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const downloadPdf = async () => {
    if (!token) return;
    setDownloadState("Preparing PDF download...");
    const params = new URLSearchParams({
      report: "student-achievements",
      format: "pdf",
      year: selectedYear,
      group: selectedGroup,
      category: selectedCategory,
    });
    const response = await fetch(`${apiUrl}/admin/reports/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-achievements.pdf";
    link.click();
    window.URL.revokeObjectURL(url);
    setDownloadState("Downloaded student achievements PDF.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .sa-wrap {
          --ink: #0d1117;
          --slate: #57606a;
          --slate-light: #8b949e;
          --brand: #1a56db;
          --brand-light: #eef2ff;
          --surface: #f6f8fa;
          --white: #ffffff;
          --border: #d0d7de;
          --border-light: #eaeef2;
          --green: #16a34a;
          --green-light: #dcfce7;
          --radius-lg: 18px;
          --radius-xl: 24px;
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body: 'Geist', system-ui, sans-serif;
          font-family: var(--font-body);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .sa-page-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 28px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .sa-breadcrumb {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--slate-light);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .sa-page-title {
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 400;
          line-height: 1.1;
        }
        .sa-page-title em {
          font-style: italic;
          color: var(--brand);
        }
        .sa-page-sub {
          font-size: 14px;
          color: var(--slate);
          margin-top: 5px;
        }

        .sa-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .sa-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 24px 14px;
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap;
        }
        .sa-card-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sa-card-title-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brand);
        }
        .sa-card-body {
          padding: 20px 24px 24px;
        }
        .sa-filter-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }
        .sa-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--slate-light);
          margin-bottom: 6px;
          display: block;
        }
        .sa-select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
        }
        .sa-toolbar {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .sa-summary {
          font-size: 13px;
          color: var(--slate);
        }
        .sa-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-body);
        }
        .sa-btn-download {
          background: var(--brand-light);
          color: var(--brand);
        }
        .sa-download-state {
          font-size: 12px;
          color: var(--slate);
        }
        .sa-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border-light);
          border-radius: 16px;
        }
        .sa-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .sa-table thead th {
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--slate-light);
          padding: 14px 16px;
          background: var(--surface);
          border-bottom: 1px solid var(--border-light);
          white-space: nowrap;
        }
        .sa-table tbody td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-light);
          vertical-align: top;
        }
        .sa-table tbody tr:last-child td {
          border-bottom: none;
        }
        .sa-student-name {
          font-weight: 600;
          color: var(--ink);
        }
        .sa-student-sub {
          margin-top: 3px;
          font-size: 12px;
          color: var(--slate);
        }
        .sa-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--brand);
          background: var(--brand-light);
        }
        .sa-actions {
          display: flex;
          justify-content: flex-end;
        }
        .sa-view-btn {
          border: 1px solid var(--border-light);
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-body);
          background: var(--brand-light);
          color: var(--brand);
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s;
        }
        .sa-view-btn:hover {
          background: #dbeafe;
          border-color: #bfdbfe;
        }
        .sa-view-btn:disabled {
          cursor: not-allowed;
          opacity: 0.45;
          background: var(--surface);
          color: var(--slate-light);
        }
        .sa-empty {
          text-align: center;
          padding: 52px 20px;
          color: var(--slate);
          font-size: 14px;
          border: 1px dashed var(--border);
          border-radius: 16px;
          background: var(--surface);
        }

        @media (max-width: 900px) {
          .sa-filter-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="sa-wrap">
        <DashboardShell
          title="Admin dashboard"
          subtitle="Browse and download student achievements by year and category."
          nav={[
            { label: "Overview", href: "/admin" },
            { label: "Students", href: "/admin/students" },
            { label: "Student achievements", href: "/admin/student-achievements" },
            { label: "Approvals", href: "/admin/approvals" },
            { label: "Analytics", href: "/admin/analytics" },
            { label: "Reports", href: "/admin/reports" },
          ]}
        >
          <div className="sa-page-header">
            <div>
              <div className="sa-breadcrumb">
                <span>Admin</span>
                <span>{">"}</span>
                <span style={{ color: "var(--ink)" }}>Student achievements</span>
              </div>
              <h1 className="sa-page-title">
                Student <em>achievements</em>
              </h1>
              <p className="sa-page-sub">
                Filter achievement records by graduation year, stream, and category, then export the result.
              </p>
            </div>
          </div>

          <div className="sa-card">
            <div className="sa-card-header">
              <span className="sa-card-title">
                <span className="sa-card-title-dot" />
                Achievement explorer
              </span>
            </div>
            <div className="sa-card-body">
              <div className="sa-filter-row">
                <div>
                  <label className="sa-label">Graduation year</label>
                  <select
                    className="sa-select"
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                  >
                    <option value="all">All graduation years</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="sa-label">Achievement stream</label>
                  <select
                    className="sa-select"
                    value={selectedGroup}
                    onChange={(event) => {
                      const nextGroup = event.target.value as AchievementGroup;
                      setSelectedGroup(nextGroup);
                      setSelectedCategory("all");
                    }}
                  >
                    <option value="technical">Technical</option>
                    <option value="non-technical">Non-technical</option>
                  </select>
                </div>

                <div>
                  <label className="sa-label">
                    {selectedGroup === "technical" ? "Technical achievement" : "Non-technical achievement"}
                  </label>
                  <select
                    className="sa-select"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                  >
                    <option value="all">
                      {selectedGroup === "technical" ? "All technical achievements" : "All non-technical achievements"}
                    </option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sa-toolbar">
                <div>
                  <div className="sa-summary">
                    {isLoading ? "Loading achievements..." : `Showing ${filteredAchievements.length} achievement records`}
                  </div>
                  {downloadState ? <div className="sa-download-state">{downloadState}</div> : null}
                </div>
                <button
                  type="button"
                  className="sa-btn sa-btn-download"
                  onClick={downloadPdf}
                  disabled={filteredAchievements.length === 0}
                >
                  Download PDF
                </button>
              </div>

              {filteredAchievements.length === 0 ? (
                <div className="sa-empty">
                  No student achievements match the selected filters.
                </div>
              ) : (
                <div className="sa-table-wrap">
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Registration Number</th>
                        <th>Achievement</th>
                        <th>Category</th>
                        <th>Graduation Year</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAchievements.map((item) => {
                        return (
                          <tr key={item._id}>
                            <td>
                              <div className="sa-student-name">{item.student?.fullName || "Student"}</div>
                              <div className="sa-student-sub">{item.student?.department || "Department"}</div>
                            </td>
                            <td>{item.student?.studentId || "-"}</td>
                            <td>
                              <div className="sa-student-name">{item.title || "-"}</div>
                              <div className="sa-student-sub">{item.description || "-"}</div>
                            </td>
                            <td>
                              <span className="sa-pill">{item.category || "-"}</span>
                            </td>
                            <td>{item.student?.graduationYear ?? "-"}</td>
                            <td>
                              <div className="sa-actions">
                                <button
                                  type="button"
                                  className="sa-view-btn"
                                  disabled={!item.certificateUrl}
                                  onClick={() => {
                                    if (item.certificateUrl) {
                                      window.open(item.certificateUrl, "_blank", "noopener,noreferrer");
                                    }
                                  }}
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </DashboardShell>
      </div>
    </>
  );
}
