"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DepartmentBarChart, GrowthLineChart } from "@/components/charts/overview-chart";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<any>("/admin/dashboard", { token }),
    enabled: !!token,
  });
  const { data: achievementData } = useQuery({
    queryKey: ["admin-achievements", filterCategory, filterDepartment, filterSemester, filterYear],
    queryFn: () =>
      api<{ achievements: any[] }>(
        `/achievements?category=${encodeURIComponent(filterCategory)}&department=${encodeURIComponent(filterDepartment)}&semester=${encodeURIComponent(filterSemester)}&academicYear=${encodeURIComponent(filterYear)}`,
        { token }
      ),
    enabled: !!token,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .ad-wrap {
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
        .ad-page-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 28px;
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .ad-breadcrumb {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--slate-light); margin-bottom: 8px;
          display: flex; align-items: center; gap: 5px;
        }
        .ad-page-title {
          font-family: var(--font-display);
          font-size: 30px; font-weight: 400; color: var(--ink); line-height: 1.1;
        }
        .ad-page-title em { font-style: italic; color: var(--brand); }
        .ad-page-sub { font-size: 14px; color: var(--slate); margin-top: 5px; }
        .ad-live-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--slate-light);
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: 100px; padding: 6px 14px;
          white-space: nowrap; margin-top: 4px;
        }
        .ad-live-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; }

        /* STATS ROW — wraps StatCard components */
        .ad-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        /* CHARTS GRID */
        .ad-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .ad-chart-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .ad-chart-card:hover { box-shadow: var(--shadow); }
        .ad-chart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px 14px;
          border-bottom: 1px solid var(--border-light);
        }
        .ad-chart-title {
          font-size: 14px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }
        .ad-chart-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); }
        .ad-chart-tag {
          font-size: 11px; font-weight: 500; color: var(--slate-light);
          background: var(--surface); border-radius: 100px; padding: 3px 10px;
        }
        .ad-chart-body { padding: 20px 22px; }

        /* BOTTOM GRID */
        .ad-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 0.95fr;
          gap: 20px;
        }
        .ad-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .ad-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px 14px;
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap; gap: 10px;
        }
        .ad-card-title {
          font-size: 14px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }
        .ad-card-body { padding: 20px 22px; }


        .ad-reports-btn {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 12px; font-weight: 600;
          color: var(--brand); background: var(--brand-light);
          border: none; border-radius: 8px; padding: 6px 12px;
          text-decoration: none; transition: background 0.15s;
          white-space: nowrap;
        }
        .ad-reports-btn:hover { background: rgba(26,86,219,0.15); }

        /* TOP STUDENTS TABLE */
        .ad-table-wrap { overflow-x: auto; }
        .ad-table {
          width: 100%; border-collapse: collapse; font-size: 13px;
        }
        .ad-table thead th {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--slate-light);
          padding: 0 12px 12px; text-align: left; white-space: nowrap;
          border-bottom: 1px solid var(--border-light);
        }
        .ad-table thead th:first-child { padding-left: 0; }
        .ad-table tbody tr {
          border-bottom: 1px solid var(--border-light);
          transition: background 0.1s;
        }
        .ad-table tbody tr:last-child { border-bottom: none; }
        .ad-table tbody tr:hover { background: var(--surface); }
        .ad-table tbody td {
          padding: 12px; color: var(--ink); vertical-align: middle;
        }
        .ad-table tbody td:first-child { padding-left: 0; font-weight: 500; }
        .ad-cgpa-badge {
          display: inline-block; font-size: 11px; font-weight: 600;
          color: var(--brand); background: var(--brand-light);
          border-radius: 100px; padding: 2px 8px;
        }
        .ad-count-badge {
          display: inline-block; font-size: 11px; font-weight: 600;
          color: var(--green); background: var(--green-light);
          border-radius: 100px; padding: 2px 8px;
        }

        /* CATEGORY LIST */
        .ad-category-list { display: flex; flex-direction: column; gap: 8px; }
        .ad-category-item {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: 12px; padding: 12px 16px;
          transition: box-shadow 0.15s;
        }
        .ad-category-item:hover { box-shadow: var(--shadow); }
        .ad-category-name {
          font-size: 13px; font-weight: 500; color: var(--ink); text-transform: capitalize;
          display: flex; align-items: center; gap: 8px;
        }
        .ad-category-dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--brand);
          flex-shrink: 0;
        }
        .ad-category-count {
          font-size: 13px; font-weight: 700; color: var(--ink);
          background: var(--white); border: 1px solid var(--border-light);
          border-radius: 8px; padding: 3px 10px;
        }
        .ad-filter-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 14px;
        }
        .ad-filter-select {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 12px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--border-light);
          background: var(--surface);
          color: var(--ink);
        }
        .ad-ach-list { display: grid; gap: 10px; }
        .ad-ach-item {
          border: 1px solid var(--border-light);
          border-radius: 12px;
          padding: 12px 14px;
          background: var(--surface);
          display: grid;
          gap: 4px;
        }
        .ad-ach-title { font-size: 13px; font-weight: 600; color: var(--ink); }
        .ad-ach-meta { font-size: 11px; color: var(--slate-light); }
        .ad-ach-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--slate);
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: 999px;
          padding: 3px 8px;
          margin-right: 6px;
        }
        .ad-ach-count {
          font-size: 12px;
          font-weight: 600;
          color: var(--slate);
          margin-top: 10px;
        }

        @media (max-width: 1024px) {
          .ad-charts-grid, .ad-bottom-grid { grid-template-columns: 1fr; }
          .ad-stats-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .ad-stats-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="ad-wrap">
        <DashboardShell
          title="Admin dashboard"
          subtitle="Manage students, approvals, analytics, and institutional reporting."
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
          <div className="ad-page-header">
            <div>
              <div className="ad-breadcrumb">
                <span>Admin</span><span>›</span>
                <span style={{ color: "var(--ink)" }}>Overview</span>
              </div>
              <h1 className="ad-page-title">
                Admin <em>dashboard</em>
              </h1>
              <p className="ad-page-sub">
                Manage students, approvals, analytics, and institutional reporting.
              </p>
            </div>
            <div className="ad-live-badge">
              <span className="ad-live-dot" />
              Live data
            </div>
          </div>

          {/* STATS */}
          <section className="ad-stats-row">
            <StatCard label="Students" value={data?.metrics.totalStudents ?? 0} helper="Total active profiles" />
            <StatCard label="Achievements" value={data?.metrics.totalAchievements ?? 0} helper="System-wide entries" />
            <StatCard label="Pending approvals" value={data?.metrics.pendingApprovals ?? 0} helper="Need admin or faculty action" />
            <StatCard label="Documents" value={data?.metrics.totalDocuments ?? 0} helper="Securely registered files" />
          </section>

          {/* CHARTS */}
          <section className="ad-charts-grid">
            <div className="ad-chart-card">
              <div className="ad-chart-header">
                <span className="ad-chart-title">
                  <span className="ad-chart-dot" />
                  Department breakdown
                </span>
                <span className="ad-chart-tag">Bar chart</span>
              </div>
              <div className="ad-chart-body">
                <DepartmentBarChart data={data?.departmentData || []} />
              </div>
            </div>
            <div className="ad-chart-card">
              <div className="ad-chart-header">
                <span className="ad-chart-title">
                  <span className="ad-chart-dot" />
                  Year-on-year growth
                </span>
                <span className="ad-chart-tag">Line chart</span>
              </div>
              <div className="ad-chart-body">
                <GrowthLineChart data={data?.yearlyGrowth || []} />
              </div>
            </div>
          </section>

          {/* BOTTOM — TOP STUDENTS + CATEGORIES */}
          <section className="ad-bottom-grid">
            {/* TOP STUDENTS */}
            <div className="ad-card">
              <div className="ad-card-header">
                <span className="ad-card-title">
                  <span className="ad-chart-dot" />
                  Top performing students
                </span>
                <Link className="ad-reports-btn" href="/admin/reports">
                  Open reports →
                </Link>
              </div>
              <div className="ad-card-body">
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>ID</th>
                        <th>Department</th>
                        <th>CGPA</th>
                        <th>Achievements</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.topStudents || []).map((student: any, idx: number) => (
                        <tr key={student._id || `${student.studentId || "student"}-${idx}`}>
                          <td>{student.fullName}</td>
                          <td style={{ color: "var(--slate)" }}>{student.studentId}</td>
                          <td style={{ color: "var(--slate)" }}>{student.department}</td>
                          <td>
                            <span className="ad-cgpa-badge">{student.cgpa ?? "—"}</span>
                          </td>
                          <td>
                            <span className="ad-count-badge">{student.achievementsCount}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* CATEGORY ACHIEVEMENTS */}
            <div className="ad-card">
              <div className="ad-card-header">
                <span className="ad-card-title">
                  <span className="ad-chart-dot" />
                  Filtered achievements
                </span>
              </div>
              <div className="ad-card-body">
                <div className="ad-filter-row">
                  <select
                    className="ad-filter-select"
                    value={filterCategory}
                    onChange={(event) => setFilterCategory(event.target.value)}
                  >
                    <option value="">All categories</option>
                    {(data?.categoryData || []).map((item: any, idx: number) => (
                      <option key={item._id || `category-${idx}`} value={item._id}>
                        {item._id}
                      </option>
                    ))}
                  </select>
                  <select
                    className="ad-filter-select"
                    value={filterDepartment}
                    onChange={(event) => setFilterDepartment(event.target.value)}
                  >
                    <option value="">All departments</option>
                    {(data?.departmentData || []).map((item: any, idx: number) => (
                      <option key={item._id || `dept-${idx}`} value={item._id}>
                        {item._id}
                      </option>
                    ))}
                  </select>
                  <select
                    className="ad-filter-select"
                    value={filterSemester}
                    onChange={(event) => setFilterSemester(event.target.value)}
                  >
                    <option value="">All semesters</option>
                    {[1,2].map((sem) => (
                      <option key={sem} value={String(sem)}>Semester {sem}</option>
                    ))}
                  </select>
                  <select
                    className="ad-filter-select"
                    value={filterYear}
                    onChange={(event) => setFilterYear(event.target.value)}
                  >
                    <option value="">All years</option>
                    {["Year 1", "Year 2", "Year 3", "Year 4"].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="ad-ach-list">
                  {(achievementData?.achievements || []).length === 0 ? (
                    <div className="ad-category-item" style={{ justifyContent: "center" }}>
                      <span className="ad-category-name">No achievements found.</span>
                    </div>
                  ) : (
                    achievementData?.achievements?.slice(0, 6).map((item: any, idx: number) => (
                      <div key={item._id || `${item.title || "ach"}-${idx}`} className="ad-ach-item">
                        <div className="ad-ach-title">{item.title}</div>
                        <div className="ad-ach-meta">
                          {item.student?.fullName || "Student"} • {item.student?.studentId || "Reg ID"} • {item.student?.department || "Dept"}
                        </div>
                        <div>
                          <span className="ad-ach-pill">{item.category}</span>
                          <span className="ad-ach-pill">Sem {item.semester || "-"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="ad-ach-count">
                  Total achievements: {achievementData?.achievements?.length ?? 0}
                </div>
              </div>
            </div>
          </section>

        </DashboardShell>
      </div>
    </>
  );
}
