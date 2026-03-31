"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DepartmentBarChart, GrowthLineChart } from "@/components/charts/overview-chart";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<any>("/admin/dashboard", { token }),
    enabled: !!token,
  });
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<string>("");

  const insightsMutation = useMutation({
    mutationFn: () => api<{ insights: string }>("/admin/insights", { token }),
    onSuccess: (payload) => {
      setAiInsights(payload.insights || "");
      setAiStatus("");
    },
    onError: () => {
      setAiStatus("Unable to generate insights right now.");
    },
  });

  const mergedDepartmentData = (data?.departmentData || []).map((item: any) => ({
    _id: item._id,
    totalStudents: item.totalStudents,
    totalAchievements: item.totalAchievements ?? 0,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .an-wrap {
          --ink: #0d1117;
          --slate: #57606a;
          --slate-light: #8b949e;
          --brand: #1a56db;
          --brand-light: #eef2ff;
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
        .an-page-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 28px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .an-breadcrumb {
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--slate-light);
          margin-bottom: 8px;
          display: flex; align-items: center; gap: 5px;
        }
        .an-page-title {
          font-family: var(--font-display);
          font-size: 30px; font-weight: 400;
          color: var(--ink); line-height: 1.1;
        }
        .an-page-title em { font-style: italic; color: var(--brand); }
        .an-page-sub { font-size: 14px; color: var(--slate); margin-top: 5px; }
        .an-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--slate-light);
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 100px; padding: 6px 14px;
          white-space: nowrap; margin-top: 4px;
        }
        .an-badge-dot {
          width: 6px; height: 6px;
          background: #22c55e; border-radius: 50%;
        }

        /* CHARTS GRID */
        .an-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .an-chart-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .an-chart-card:hover { box-shadow: var(--shadow); }
        .an-chart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px 14px;
          border-bottom: 1px solid var(--border-light);
        }
        .an-chart-title {
          font-size: 14px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }
        .an-chart-title-dot {
          width: 7px; height: 7px;
          border-radius: 50%; background: var(--brand);
        }
        .an-chart-tag {
          font-size: 11px; font-weight: 500;
          color: var(--slate-light);
          background: var(--surface);
          border-radius: 100px; padding: 3px 10px;
        }
        .an-chart-body { padding: 20px 22px; }

        /* INSIGHTS SECTION */
        .an-insights-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .an-insights-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px 14px;
          border-bottom: 1px solid var(--border-light);
          gap: 12px;
        }
        .an-insights-title {
          font-size: 14px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }
        .an-insights-body {
          padding: 20px 22px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .an-insight-item {
          border-radius: var(--radius-lg);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .an-insight-item:nth-child(1) { background: var(--brand-light); border: 1px solid rgba(26,86,219,0.15); }
        .an-insight-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .an-insight-item:nth-child(1) .an-insight-icon { background: rgba(26,86,219,0.12); }
        .an-insight-item:nth-child(2) .an-insight-icon { background: rgba(34,197,94,0.12); }
        .an-insight-item:nth-child(3) .an-insight-icon { background: var(--border-light); }
        .an-insight-label {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--slate-light);
        }
        .an-insight-text { font-size: 13px; color: var(--slate); line-height: 1.6; }
        .an-insight-btn {
          font-size: 12px;
          font-weight: 600;
          border-radius: 10px;
          padding: 8px 12px;
          border: 1px solid var(--border);
          background: var(--white);
          color: var(--ink);
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .an-insight-btn:hover { background: var(--surface); border-color: #cbd5e1; }
        .an-insight-output {
          white-space: pre-wrap;
          font-size: 13px;
          color: var(--slate);
          line-height: 1.7;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 14px;
          padding: 16px;
        }

        @media (max-width: 900px) {
          .an-charts-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="an-wrap">
        <DashboardShell
          title="Admin dashboard"
          subtitle="Institutional analytics for leadership and accreditation workflows."
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
          <div className="an-page-header">
            <div>
              <div className="an-breadcrumb">
                <span>Admin</span>
                <span>›</span>
                <span style={{ color: "var(--ink)" }}>Analytics</span>
              </div>
              <h1 className="an-page-title">
                Institutional <em>analytics</em>
              </h1>
              <p className="an-page-sub">
                Leadership and accreditation workflow insights.
              </p>
            </div>
            <div className="an-badge">
              <span className="an-badge-dot" />
              Live data
            </div>
          </div>

          {/* CHARTS */}
          <div className="an-charts-grid">
            <div className="an-chart-card">
              <div className="an-chart-header">
                <span className="an-chart-title">
                  <span className="an-chart-title-dot" />
                  Department breakdown
                </span>
                <span className="an-chart-tag">Bar chart</span>
              </div>
              <div className="an-chart-body">
                <DepartmentBarChart data={mergedDepartmentData} />
              </div>
            </div>
            <div className="an-chart-card">
              <div className="an-chart-header">
                <span className="an-chart-title">
                  <span className="an-chart-title-dot" />
                  Year-on-year growth
                </span>
                <span className="an-chart-tag">Line chart</span>
              </div>
              <div className="an-chart-body">
                <GrowthLineChart data={data?.yearlyGrowth || []} />
              </div>
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="an-insights-card">
            <div className="an-insights-header">
              <span className="an-insights-title">
                <span className="an-chart-title-dot" />
                AI analytic interpretation
              </span>
              <button
                className="an-insight-btn"
                type="button"
                onClick={() => {
                  setAiStatus("Generating insights...");
                  insightsMutation.mutate();
                }}
              >
                {insightsMutation.isPending ? "Generating..." : "Generate insights"}
              </button>
            </div>
            <div className="an-insights-body">
              <div className="an-insight-item">
                <div className="an-insight-label">Insights</div>
                {aiStatus && <p className="an-insight-text">{aiStatus}</p>}
                {aiInsights && <div className="an-insight-output">{aiInsights}</div>}
                {!aiStatus && !aiInsights && (
                  <p className="an-insight-text">
                    Click "Generate insights" to get an AI summary of your dashboard trends.
                  </p>
                )}
              </div>
            </div>
          </div>
        </DashboardShell>
      </div>
    </>
  );
}
