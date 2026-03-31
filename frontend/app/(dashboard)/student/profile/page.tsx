"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { StudentProfile } from "@/lib/types";
import { Modal } from "@/components/ui/modal";

/* ─── Field groups ───────────────────────────────────────────────────────── */
const SECTIONS = [
  {
    heading: "Identity",
    accent: "#f59e0b",
    fields: [
      { label: "Full name",    key: "fullName" },
      { label: "Student ID",   key: "studentId" },
      { label: "Email",        key: "email" },
      { label: "Phone",        key: "phone" },
      { label: "Address",      key: "address", wide: true },
    ],
  },
  {
    heading: "Academic",
    accent: "#3b82f6",
    fields: [
      { label: "Department",         key: "department" },
      { label: "Program",            key: "program" },
      { label: "Admission category", key: "admissionCategory" },
      { label: "Year",               key: "year" },
      { label: "Semester",           key: "semester" },
      { label: "Graduation year",    key: "graduationYear" },
      { label: "CGPA",               key: "cgpa" },
      { label: "Backlogs",           key: "backlogs" },
    ],
  },
];

/* ─── Single field tile ──────────────────────────────────────────────────── */
function ProfileField({
  label,
  value,
  wide,
  delay,
}: {
  label: string;
  value: string | number | undefined | null;
  wide?: boolean;
  delay: number;
}) {
  return (
    <div
      style={{
        gridColumn: wide ? "1 / -1" : undefined,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "14px 16px",
        animation: "fadeUp 0.4s ease both",
        animationDelay: `${delay}ms`,
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#94a3b8")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0")}
    >
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#64748b",
        margin: "0 0 5px",
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 15,
        color: value !== undefined && value !== null && value !== "" && value !== "-"
          ? "#0f172a"
          : "#64748b",
        margin: 0,
      }}>
        {value ?? "-"}
      </p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function StudentProfilePage() {
  const { token } = useAuth();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<string>("");
  const { data } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => api<{ student: StudentProfile }>("/students/me", { token }),
    enabled: !!token,
  });

  const student = data?.student;

  const contactMutation = useMutation({
    mutationFn: (message: string) =>
      api("/notifications", {
        method: "POST",
        token,
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => {
      setContactStatus("Request sent to admin.");
      setContactMessage("");
    },
    onError: () => {
      setContactStatus("Unable to send request. Try again.");
    },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .profile-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          animation: fadeUp 0.4s ease both;
        }

        .notice-bar {
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.22);
          border-radius: 10px;
          padding: 14px 18px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #1e3a8a;
          letter-spacing: 0.03em;
          line-height: 1.6;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
      `}</style>

      <DashboardShell
        title="Student dashboard"
        subtitle="Profile details are managed by administrators."
        nav={[
          { label: "Overview",     href: "/student" },
          { label: "Profile",      href: "/student/profile" },
          { label: "Achievements", href: "/student/achievements" },
          { label: "Documents",    href: "/student/documents" },
        ]}
      >
        {student ? (
          <div style={{ display: "grid", gap: 20 }}>

            {/* ── Avatar / name hero ── */}
            <div className="profile-section" style={{ animationDelay: "0ms" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                {/* Monogram avatar */}
                <div style={{
                  width: 64, height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1a1a1a 0%, #222 100%)",
                  border: "1px solid #2a2a2a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 24,
                    color: "#f59e0b",
                    lineHeight: 1,
                  }}>
                    {student.fullName?.charAt(0) ?? "?"}
                  </span>
                </div>

                <div>
                  <h2 style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 26,
                    color: "#e8e2d9",
                    fontWeight: 400,
                    margin: "0 0 4px",
                  }}>
                    {student.fullName}
                  </h2>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      color: "#666",
                      letterSpacing: "0.05em",
                    }}>
                      {student.studentId}
                    </span>
                    <span style={{ color: "#2a2a2a" }}>·</span>
                    <span style={{
                      background: "rgba(245,158,11,0.12)",
                      color: "#f59e0b",
                      border: "1px solid rgba(245,158,11,0.25)",
                      borderRadius: 5,
                      padding: "2px 10px",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      letterSpacing: "0.06em",
                    }}>
                      {student.program || "Student"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Field sections ── */}
            {SECTIONS.map((section, si) => (
              <div
                key={section.heading}
                className="profile-section"
                style={{ animationDelay: `${(si + 1) * 80}ms` }}
              >
                {/* Section header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 3, height: 18, borderRadius: 99,
                    background: section.accent,
                    flexShrink: 0,
                  }} />
                  <h3 style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#666",
                    margin: 0,
                    fontWeight: 500,
                  }}>
                    {section.heading}
                  </h3>
                </div>

                {/* Fields grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 10,
                }}>
                  {section.fields.map((field, fi) => (
                    <ProfileField
                      key={field.key}
                      label={field.label}
                      value={(student as any)[field.key]}
                      wide={field.wide}
                      delay={(si + 1) * 80 + fi * 40}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* ── Admin notice ── */}
            <div className="notice-bar" style={{ animationDelay: "240ms", animation: "fadeUp 0.4s ease both" }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>ℹ</span>
              <span>
                If any details are incorrect, please contact the admin office to update your profile.
              </span>
            </div>

            {/* Support */}
            <div className="profile-section" style={{ animationDelay: "280ms" }}>
              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                color: "#0f172a",
                margin: "0 0 8px",
                fontWeight: 600,
              }}>
                Support
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#64748b",
                margin: "0 0 16px",
                lineHeight: 1.6,
              }}>
                Need help updating your profile or documents? Contact the admin office to request changes.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  style={{
                    background: "#1e3a8a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 16px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setContactStatus("");
                    setIsContactOpen(true);
                  }}
                >
                  Contact admin
                </button>
                <button
                  type="button"
                  style={{
                    background: "#ffffff",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "10px 16px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  View help center
                </button>
              </div>
            </div>

          </div>
        ) : null}

        <Modal open={isContactOpen} onClose={() => setIsContactOpen(false)} title="Contact admin">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setContactStatus("");
              const payload = contactMessage.trim();
              if (payload.length < 10) {
                setContactStatus("Please enter at least 10 characters.");
                return;
              }
              contactMutation.mutate(payload);
            }}
          >
            <p className="text-sm text-slate">
              Explain what you need changed in your profile or documents. The admin team will review and respond.
            </p>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink"
              rows={5}
              placeholder="e.g. Please update my department to CSE and correct my phone number."
              value={contactMessage}
              onChange={(event) => setContactMessage(event.target.value)}
              required
            />
            {contactStatus ? (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate">
                {contactStatus}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" type="submit" disabled={contactMutation.isPending}>
                {contactMutation.isPending ? "Sending..." : "Send request"}
              </button>
              <button className="btn-secondary" type="button" onClick={() => setIsContactOpen(false)}>
                Close
              </button>
            </div>
          </form>
        </Modal>
      </DashboardShell>
    </>
  );
}
