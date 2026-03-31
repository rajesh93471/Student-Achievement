"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AchievementForm } from "@/components/forms/achievement-form";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

/* ─── Category accent map ────────────────────────────────────────────────── */
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

const CATEGORIES = [
  "academic","hackathon","competition","olympiad","certification",
  "internship","project","sports","cultural","club","research",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 16 }, (_, index) => String(CURRENT_YEAR - index));

const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  approved: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
  pending:  { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  rejected: { bg: "rgba(244,63,94,0.15)",  color: "#f43f5e" },
};

/* ─── Shared micro-component: labelled field ─────────────────────────────── */
function Field({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <p style={{ margin: 0 }}>
      <span style={{
        display: "block",
        fontSize: "12px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#64748b",
        fontFamily: "'Inter', sans-serif",
        marginBottom: 2,
      }}>{label}</span>
      <span style={{
        fontSize: "14px",
        color: "#0f172a",
        fontFamily: "'Inter', sans-serif",
      }}>{value}</span>
    </p>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function StudentAchievementsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "hackathon",
    date: "",
    academicYear: "",
    semester: "",
    activityType: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => api<{ achievements: any[] }>("/achievements", { token }),
    enabled: !!token,
  });
  const { data: profileData } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => api<{ student: any }>("/students/me", { token }),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) =>
      api("/achievements", { method: "POST", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/achievements/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      api(`/achievements/${id}`, { method: "PUT", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const achievements = data?.achievements || [];
  const achievementYears = Array.from(
    new Set(
      achievements
        .map((item) => {
          if (!item.date) return "";
          const parsed = new Date(item.date);
          return Number.isNaN(parsed.getTime()) ? "" : String(parsed.getFullYear());
        })
        .filter(Boolean),
    ),
  ).sort((left, right) => Number(right) - Number(left));
  const availableYears = Array.from(new Set([...achievementYears, ...YEAR_OPTIONS]));
  const filteredAchievements =
    selectedYear === "All"
      ? achievements
      : achievements.filter((item) => {
          if (!item.date) return false;
          const parsed = new Date(item.date);
          return !Number.isNaN(parsed.getTime()) && String(parsed.getFullYear()) === selectedYear;
        });
  const studentProfile = profileData?.student;
  const defaultAcademicYear = studentProfile?.year ? `Year ${studentProfile.year}` : undefined;
  const defaultSemester = studentProfile?.semester ?? undefined;

  return (
    <>
      {/* ── Font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');

        .ach-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          animation: cardIn 0.4s ease both;
        }
        .ach-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 35px rgba(15,23,42,0.12);
          border-color: #cbd5e1;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ach-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 14px;
          color: #0f172a;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
          box-sizing: border-box;
        }
        .ach-input:focus {
          border-color: #2563eb;
          background: #ffffff;
        }
        .ach-input::placeholder {
          color: #94a3b8;
        }

        .btn-gold {
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.18s, transform 0.15s;
        }
        .btn-gold:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .btn-ghost {
          background: #f8fafc;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
        }
        .btn-ghost:hover {
          border-color: #94a3b8;
          color: #1e3a8a;
          background: #eff6ff;
        }

        .btn-danger {
          background: transparent;
          color: #f43f5e;
          border: 1px solid rgba(244,63,94,0.25);
          border-radius: 8px;
          padding: 10px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s;
        }
        .btn-danger:hover {
          background: rgba(244,63,94,0.08);
          border-color: rgba(244,63,94,0.5);
        }

        .divider {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 22px 0;
        }

        .cert-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #1e3a8a;
          text-decoration: none;
          border: 1px solid rgba(37,99,235,0.3);
          border-radius: 6px;
          padding: 6px 14px;
          transition: background 0.18s, border-color 0.18s;
        }
        .cert-link:hover {
          background: rgba(37,99,235,0.1);
          border-color: rgba(37,99,235,0.6);
        }
      `}</style>

      <DashboardShell
        title="Student dashboard"
        subtitle="Submit achievements for administrative review."
        nav={[
          { label: "Overview",      href: "/student" },
          { label: "Profile",       href: "/student/profile" },
          { label: "Achievements",  href: "/student/achievements" },
          { label: "Documents",     href: "/student/documents" },
        ]}
      >
        {/* ── Header bar ── */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "22px 28px",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 24,
              color: "#0f172a",
              margin: 0,
              fontWeight: 600,
            }}>
              Achievements
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "#64748b",
              margin: "4px 0 0",
              letterSpacing: "0.02em",
            }}>
              Track and manage verified achievements.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <select
              className="ach-input"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              style={{ minWidth: 180 }}
            >
              <option value="All">All years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button className="btn-gold" type="button" onClick={() => setIsModalOpen(true)}>
              + Add achievement
            </button>
          </div>
        </div>

        {/* ── Achievement cards grid ── */}
        <div style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        }}>
          {filteredAchievements.map((item, idx) => {
            const accentColor = CATEGORY_COLORS[item.category] ?? "#f59e0b";
            const statusStyle = STATUS_PILL[item.status] ?? { bg: "rgba(255,255,255,0.08)", color: "#aaa" };
            const isEditing = editingId === item._id;
            const achievementYear = item.date ? new Date(item.date).getFullYear() : "";

            return (
              <div
                key={item._id}
                className="ach-card"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Category accent line */}
                <div style={{
                  height: 3,
                  width: 40,
                  borderRadius: 99,
                  background: accentColor,
                  marginBottom: 18,
                }} />

                {/* Title + category badge */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <h3 style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 19,
                    color: "#0f172a",
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.3,
                    flex: 1,
                  }}>
                    {item.title}
                  </h3>
                  <span style={{
                    background: `${accentColor}18`,
                    color: accentColor,
                    border: `1px solid ${accentColor}40`,
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    textTransform: "capitalize",
                  }}>
                    {item.category}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: "#64748b",
                  margin: "10px 0 0",
                  lineHeight: 1.6,
                }}>
                  {item.description}
                </p>

                <hr className="divider" />

                {/* Meta grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                  <Field label="Achievement year" value={achievementYear} />
                  <div>
                    <span style={{
                      display: "block",
                      fontSize: "12px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#64748b",
                      fontFamily: "'Inter', sans-serif",
                      marginBottom: 4,
                    }}>Status</span>
                    <span style={{
                      display: "inline-block",
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      borderRadius: 4,
                      padding: "2px 10px",
                      fontSize: 13,
                      fontFamily: "'Inter', sans-serif",
                      textTransform: "capitalize",
                    }}>
                      {item.status}
                    </span>
                  </div>
                  {item.academicYear && <Field label="Academic year" value={item.academicYear} />}
                  {item.semester != null && item.semester !== "" && <Field label="Semester" value={item.semester} />}
                  {item.activityType && (
                    <div style={{ gridColumn: "1/-1" }}>
                      <Field label="Activity type" value={item.activityType} />
                    </div>
                  )}
                </div>

                {/* Certificate link */}
                {item.certificateUrl && (
                  <div style={{ marginTop: 18 }}>
                    <a className="cert-link" href={item.certificateUrl} target="_blank" rel="noreferrer">
                      View certificate
                    </a>
                  </div>
                )}

                {/* Edit form */}
                {isEditing ? (
                  <form
                    style={{ marginTop: 22, display: "grid", gap: 12 }}
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const payload = {
                        ...editForm,
                        semester: editForm.semester ? Number(editForm.semester) : undefined,
                      };
                      await updateMutation.mutateAsync({ id: item._id, values: payload });
                    }}
                  >
                    <input
                      className="ach-input"
                      value={editForm.title}
                      placeholder="e.g. National Hackathon Finalist"
                      onChange={(e) => setEditForm((c) => ({ ...c, title: e.target.value }))}
                    />
                    <textarea
                      className="ach-input"
                      style={{ minHeight: 88, resize: "vertical" }}
                      value={editForm.description}
                      placeholder="Describe the achievement in 1-2 sentences"
                      onChange={(e) => setEditForm((c) => ({ ...c, description: e.target.value }))}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <select
                        className="ach-input"
                        value={editForm.date ? editForm.date.slice(0, 4) : ""}
                        onChange={(e) => setEditForm((c) => ({ ...c, date: `${e.target.value}-01-01` }))}
                      >
                        <option value="">Achievement year</option>
                        {YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <select
                        className="ach-input"
                        value={editForm.category}
                        onChange={(e) => setEditForm((c) => ({ ...c, category: e.target.value }))}
                      >
                        {CATEGORIES.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <select
                        className="ach-input"
                        value={editForm.academicYear}
                        onChange={(e) => setEditForm((c) => ({ ...c, academicYear: e.target.value }))}
                      >
                        <option value="">Academic year</option>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                      </select>
                      <input
                        className="ach-input"
                        type="text"
                        placeholder="Semester"
                        value={editForm.semester}
                        style={{ display: "none" }}
                        onChange={(e) => setEditForm((c) => ({ ...c, semester: e.target.value }))}
                      />
                      <select
                        className="ach-input"
                        value={editForm.semester}
                        onChange={(e) => setEditForm((c) => ({ ...c, semester: e.target.value }))}
                      >
                        <option value="">Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                      <input
                        className="ach-input"
                        placeholder="Activity type"
                        value={editForm.activityType}
                        onChange={(e) => setEditForm((c) => ({ ...c, activityType: e.target.value }))}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn-gold" type="submit">Save changes</button>
                      <button className="btn-ghost" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="btn-ghost"
                      type="button"
                      onClick={() => {
                        setEditingId(item._id);
                        setEditForm({
                          title:        item.title,
                          description:  item.description,
                          category:     item.category,
                          date:         item.date?.slice(0, 10) || "",
                          academicYear: item.academicYear || "",
                          semester:     item.semester ? String(item.semester) : "",
                          activityType: item.activityType || "",
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      type="button"
                      onClick={() => deleteMutation.mutate(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Empty state ── */}
        {filteredAchievements.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "#ffffff",
            border: "1px dashed #cbd5e1",
            borderRadius: 16,
          }}>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 21,
              color: "#475569",
              margin: "0 0 8px",
            }}>
              {selectedYear === "All" ? "No achievements yet" : `No achievements found for ${selectedYear}`}
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "#64748b",
              margin: 0,
            }}>
              {selectedYear === "All"
                ? "Add your first achievement to get started."
                : "Choose another year or add a new achievement for this year."}
            </p>
          </div>
        )}

        {/* ── Modal ── */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add achievement">
          <AchievementForm
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsModalOpen(false);
            }}
            token={token}
            defaultAcademicYear={defaultAcademicYear}
            defaultSemester={defaultSemester}
          />
        </Modal>
      </DashboardShell>
    </>
  );
}
