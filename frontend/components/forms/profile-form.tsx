"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { StudentProfile } from "@/lib/types";

export function ProfileForm({
  profile,
  onSubmit,
}: {
  profile: StudentProfile;
  onSubmit: (values: Partial<StudentProfile>) => Promise<unknown>;
}) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<StudentProfile>({ values: profile });

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    background: "#ffffff",
    border: `1px solid ${focusedField === name ? "#2563eb" : "#cbd5e1"}`,
    borderRadius: 10,
    padding: "10px 14px",
    color: "#0f172a",
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
  });

  const fp = (name: string) => ({
    onFocus: () => setFocusedField(name),
    onBlur:  () => setFocusedField(null),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
        @keyframes pfFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pf-input::placeholder { color: #94a3b8; }
        .pf-input::-webkit-inner-spin-button,
        .pf-input::-webkit-outer-spin-button { opacity: 0.2; }
      `}</style>

      <form style={{ display: "grid", gap: 24 }} onSubmit={handleSubmit(onSubmit)}>

        {/* ── Identity ── */}
        <div style={{
          background: "#ffffff", border: "1px solid #e2e8f0",
          borderRadius: 16, padding: "26px 28px",
          animation: "pfFadeUp 0.4s ease both",
        }}>
          <SectionHeader label="Identity" accent="#2563eb" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>

            <Field label="Full name">
              <input className="pf-input" placeholder="e.g. Priya Sharma"
                style={inputStyle("fullName")} {...fp("fullName")}
                {...register("fullName")} />
            </Field>

            <Field label="Email">
              <input className="pf-input" type="email" placeholder="student@university.edu"
                style={inputStyle("email")} {...fp("email")}
                {...register("email")} />
            </Field>

            <Field label="Phone">
              <input className="pf-input" placeholder="+91 98765 43210"
                style={inputStyle("phone")} {...fp("phone")}
                {...register("phone")} />
            </Field>

            <Field label="Address">
              <input className="pf-input" placeholder="City, State"
                style={inputStyle("address")} {...fp("address")}
                {...register("address")} />
            </Field>

            <Field label="Profile photo URL">
              <input className="pf-input" placeholder="https://example.com/photo.jpg"
                style={inputStyle("profilePhotoUrl")} {...fp("profilePhotoUrl")}
                {...register("profilePhotoUrl")} />
            </Field>

          </div>
        </div>

        {/* ── Academic ── */}
        <div style={{
          background: "#ffffff", border: "1px solid #e2e8f0",
          borderRadius: 16, padding: "26px 28px",
          animation: "pfFadeUp 0.4s ease both", animationDelay: "80ms",
        }}>
          <SectionHeader label="Academic" accent="#1e3a8a" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>

            <Field label="Department">
              <input className="pf-input" placeholder="e.g. Computer Science"
                style={inputStyle("department")} {...fp("department")}
                {...register("department")} />
            </Field>

            <Field label="Program">
              <input className="pf-input" placeholder="e.g. B.Tech"
                style={inputStyle("program")} {...fp("program")}
                {...register("program")} />
            </Field>

            <Field label="Admission category">
              <input className="pf-input" placeholder="e.g. EAMCET"
                style={inputStyle("admissionCategory")} {...fp("admissionCategory")}
                {...register("admissionCategory")} />
            </Field>

            <Field label="Year">
              <select
                className="pf-input"
                style={inputStyle("year")}
                {...fp("year")}
                {...register("year", { valueAsNumber: true })}
              >
                {[1, 2, 3, 4].map((year) => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </Field>

            <Field label="Semester">
              <select
                className="pf-input"
                style={inputStyle("semester")}
                {...fp("semester")}
                {...register("semester", { valueAsNumber: true })}
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            </Field>

            <Field label="Graduation year">
              <input className="pf-input" type="number" placeholder="e.g. 2027"
                style={inputStyle("graduationYear")} {...fp("graduationYear")}
                {...register("graduationYear", { valueAsNumber: true })} />
            </Field>

            <Field label="CGPA">
              <input className="pf-input" type="number" step="0.01" placeholder="e.g. 8.75"
                style={inputStyle("cgpa")} {...fp("cgpa")}
                {...register("cgpa", { valueAsNumber: true })} />
            </Field>

            <Field label="Backlogs">
              <input className="pf-input" type="number" placeholder="e.g. 0"
                style={inputStyle("backlogs")} {...fp("backlogs")}
                {...register("backlogs", { valueAsNumber: true })} />
            </Field>

          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          style={{
            background: "#1e3a8a", color: "#ffffff", border: "none",
            borderRadius: 8, padding: "12px 24px",
            fontFamily: "'Inter', sans-serif", fontSize: 15,
            fontWeight: 600, letterSpacing: "0.02em",
            cursor: "pointer", width: "100%",
            transition: "background 0.18s, transform 0.15s, box-shadow 0.18s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "#1d4ed8";
            el.style.transform = "translateY(-1px)";
            el.style.boxShadow = "0 10px 28px rgba(37,99,235,0.25)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "#1e3a8a";
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
          }}
        >
          Update profile
        </button>
      </form>
    </>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function SectionHeader({ label, accent }: { label: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
      <div style={{ width: 3, height: 18, borderRadius: 99, background: accent, flexShrink: 0 }} />
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 12, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#64748b", fontWeight: 600,
      }}>
        {label}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: "block",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#64748b", marginBottom: 7,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
