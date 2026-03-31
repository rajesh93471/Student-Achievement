"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

/* ─── Category + status colors (shared system) ───────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  academic:      "#f59e0b",
  hackathon:     "#10b981",
  competition:   "#3b82f6",
  olympiad:      "#8b5cf6",
  certification: "#f43f5e",
  internship:    "#06b6d4",
  project:       "#84cc16",
  sports:        "#fb923c",
  cultural:      "#e879f9",
  club:          "#a78bfa",
  research:      "#34d399",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  approved: { bg: "rgba(16,185,129,0.12)",  color: "#10b981" },
  pending:  { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  rejected: { bg: "rgba(244,63,94,0.12)",   color: "#f43f5e" },
};

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function DashStatCard({
  label,
  value,
  helper,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  helper: string;
  accent: string;
  delay: number;
}) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 14,
      padding: "22px 24px",
      animation: "fadeUp 0.4s ease both",
      animationDelay: `${delay}ms`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle glow spot */}
      <div style={{
        position: "absolute",
        top: -20, right: -20,
        width: 80, height: 80,
        borderRadius: "50%",
        background: `${accent}18`,
        filter: "blur(20px)",
        pointerEvents: "none",
      }} />
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#64748b",
        margin: "0 0 10px",
        fontWeight: 600,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: 36,
        color: accent,
        margin: "0 0 6px",
        lineHeight: 1,
        fontWeight: 600,
      }}>
        {value}
      </p>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        color: "#64748b",
        margin: 0,
        letterSpacing: "0.03em",
      }}>
        {helper}
      </p>
    </div>
  );
}

/* ─── Profile snapshot field ─────────────────────────────────────────────── */
function SnapField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{
      borderBottom: "1px solid #e2e8f0",
      paddingBottom: 12,
    }}>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#64748b",
        margin: "0 0 3px",
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: value ? "#0f172a" : "#94a3b8",
        margin: 0,
      }}>
        {value || "-"}
      </p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function StudentDashboardPage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () =>
      api<{ student: any; achievements: any[]; documents: any[] }>("/students/me", { token }),
    enabled: !!token,
  });

  const student      = data?.student;
  const achievements = data?.achievements || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dash-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          animation: fadeUp 0.4s ease both;
          box-shadow: 0 18px 40px rgba(15,23,42,0.08);
        }

        .ach-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ach-table thead tr {
          border-bottom: 1px solid #e2e8f0;
        }
        .ach-table th {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 600;
          padding: 0 16px 12px 0;
          text-align: left;
        }
        .ach-table td {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #0f172a;
          padding: 14px 16px 14px 0;
          border-bottom: 1px solid #edf2f7;
          vertical-align: middle;
        }
        .ach-table tbody tr:last-child td {
          border-bottom: none;
        }
        .ach-table tbody tr {
          transition: background 0.15s;
        }
        .ach-table tbody tr:hover td {
          background: rgba(37,99,235,0.04);
        }

        .highlight-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .highlight-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .highlight-item:first-child {
          padding-top: 0;
        }
      `}</style>

      <DashboardShell
        title="Student dashboard"
        subtitle="Track profile strength, documents, and achievements in one place."
        nav={[
          { label: "Overview",     href: "/student" },
          { label: "Profile",      href: "/student/profile" },
          { label: "Achievements", href: "/student/achievements" },
          { label: "Documents",    href: "/student/documents" },
        ]}
      >
        {/* ── Stat cards ── */}
        <section style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        }}>
          <DashStatCard label="CGPA"         value={student?.cgpa ?? "-"}               helper="Latest cumulative GPA"       accent="#f59e0b" delay={0}   />
          <DashStatCard label="Semester"     value={student?.semester ?? "-"}           helper="Current academic term"       accent="#3b82f6" delay={60}  />
          <DashStatCard label="Achievements" value={student?.achievementsCount ?? 0}    helper="Approved + pending entries"  accent="#10b981" delay={120} />
          <DashStatCard label="Documents"    value={student?.documentsCount ?? 0}       helper="Stored academic records"     accent="#8b5cf6" delay={180} />
        </section>

        {/* ── Profile snapshot + highlights ── */}
        <section style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "1.2fr 0.8fr",
        }}
        // simple responsive fallback via inline is limited; Tailwind lg: handles this in the real app
        >
          {/* Profile snapshot */}
          <div className="dash-card" style={{ animationDelay: "200ms" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{ width: 3, height: 18, borderRadius: 99, background: "#f59e0b" }} />
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#64748b",
                margin: 0,
                fontWeight: 600,
              }}>
                Profile snapshot
              </h2>
            </div>

            {/* Monogram + name row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <div style={{
                width: 48, height: 48,
                borderRadius: "50%",
                background: "#e2e8f0",
                border: "1px solid #cbd5e1",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 20,
                  color: "#1e3a8a",
                }}>
                  {student?.fullName?.charAt(0) ?? "?"}
                </span>
              </div>
              <div>
                <p style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 18,
                  color: "#0f172a",
                  margin: "0 0 2px",
                  fontWeight: 600,
                }}>
                  {student?.fullName ?? "-"}
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#64748b",
                  margin: 0,
                  letterSpacing: "0.03em",
                }}>
                  {student?.studentId ?? ""}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <SnapField label="Department"         value={student?.department} />
              <SnapField label="Program"            value={student?.program} />
              <SnapField label="Admission category" value={student?.admissionCategory} />
              <SnapField label="Email"              value={student?.email} />
              <SnapField label="Phone"              value={student?.phone} />
            </div>
          </div>

          {/* Resume-ready highlights */}
          <div className="dash-card" style={{ animationDelay: "260ms" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{ width: 3, height: 18, borderRadius: 99, background: "#10b981" }} />
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#64748b",
                margin: 0,
                fontWeight: 600,
              }}>
                Resume-ready highlights
              </h2>
            </div>

            <div>
              {[
                { icon: "-", text: "Portfolio package can be generated from verified profile data." },
                { icon: "-", text: "Achievement approvals drive leaderboard and recommendation visibility." },
                { icon: "-", text: "Uploaded documents support certificates, mark sheets, awards, and publications." },
              ].map(({ icon, text }, i) => (
                <div key={i} className="highlight-item">
                  <span style={{
                    color: "#10b981",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    marginTop: 1,
                    flexShrink: 0,
                  }}>
                    {icon}
                  </span>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: "#475569",
                    margin: 0,
                    lineHeight: 1.65,
                    letterSpacing: "0.01em",
                  }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recent achievements table ── */}
        <section className="dash-card" style={{ animationDelay: "320ms" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 18, borderRadius: 99, background: "#8b5cf6" }} />
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#64748b",
                margin: 0,
                fontWeight: 600,
              }}>
                Recent achievements
              </h2>
            </div>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: "#64748b",
            }}>
              {achievements.length} entr{achievements.length === 1 ? "y" : "ies"}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="ach-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((item) => {
                  const accent      = CATEGORY_COLORS[item.category] ?? "#666";
                  const statusStyle = STATUS_STYLE[item.status] ?? { bg: "#e2e8f0", color: "#64748b" };
                  return (
                    <tr key={item._id}>
                      <td style={{ color: "#0f172a", fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600 }}>
                        {item.title}
                      </td>
                      <td>
                        <span style={{
                          background: `${accent}15`,
                          color: accent,
                          border: `1px solid ${accent}30`,
                          borderRadius: 4,
                          padding: "2px 9px",
                          fontSize: 11,
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "0.04em",
                          textTransform: "capitalize",
                          display: "inline-block",
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td>{formatDate(item.date)}</td>
                      <td>
                        <span style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderRadius: 4,
                          padding: "2px 9px",
                          fontSize: 11,
                          fontFamily: "'Inter', sans-serif",
                          textTransform: "capitalize",
                          display: "inline-block",
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {achievements.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{
                      textAlign: "center",
                      padding: "32px 0",
                      color: "#64748b",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 15,
                    }}>
                      No achievements recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </DashboardShell>
    </>
  );
}
