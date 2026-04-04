"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/layout/providers";
import { UniversityWordmark } from "@/components/layout/university-wordmark";
import { AuthUser } from "@/lib/types";

type SignUpValues = {
  name: string;
  email: string;
  password: string;
  studentId: string;
  department: string;
  program: string;
  year: number;
  semester: number;
  graduationYear: number;
  phone?: string;
  admissionCategory?: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const graduationYears = Array.from({ length: 10 }, (_, index) => new Date().getFullYear() + index);
  const { register, handleSubmit } = useForm<SignUpValues>({
    defaultValues: { year: 1, semester: 1, graduationYear: new Date().getFullYear() + 3 },
  });

  const onSubmit = async (values: SignUpValues) => {
    try {
      setError(null);
      const response = await api<{ token: string; user: AuthUser }>("/auth/register/student", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSession(response);
      router.push("/student");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .su-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          background: #f6f8fa;
          font-family: 'Geist', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .su-blob-1 {
          position: absolute; top: -160px; right: -160px;
          width: 540px; height: 540px; border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .su-blob-2 {
          position: absolute; bottom: -120px; left: -120px;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .su-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(26,86,219,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,86,219,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* CARD */
        .su-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 660px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(31,35,40,0.10), 0 2px 8px rgba(31,35,40,0.06);
          overflow: hidden;
        }
        .su-accent-bar {
          height: 4px;
          background: linear-gradient(90deg, #1a56db 0%, #3b82f6 100%);
        }

        /* HEADER */
        .su-card-header {
          padding: 28px 36px 24px;
          border-bottom: 1px solid #eaeef2;
        }
        .su-back {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 13px; font-weight: 500; color: #1a56db;
          text-decoration: none; margin-bottom: 20px;
          transition: opacity 0.15s;
        }
        .su-back:hover { opacity: 0.7; }
        .su-brand-lockup {
          display: grid;
          gap: 14px;
          margin-bottom: 20px;
        }
        .su-logo-panel {
          width: min(100%, 380px);
          height: 100px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 18px;
          box-shadow: 0 12px 28px rgba(31,35,40,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px;
        }
        .su-logo-panel img { width: 100%; height: 100%; object-fit: contain; }

        /* FORM HEADER */
        .su-form-header { padding: 24px 36px 0; }
        .su-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #1a56db; background: #eef2ff;
          border-radius: 100px; padding: 4px 12px;
          margin-bottom: 12px;
        }
        .su-eyebrow-dot { width: 5px; height: 5px; background: #1a56db; border-radius: 50%; }
        .su-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 27px; font-weight: 400;
          color: #0d1117; line-height: 1.1;
        }
        .su-title em { font-style: italic; color: #1a56db; }
        .su-subtitle { font-size: 14px; color: #57606a; margin-top: 6px; line-height: 1.6; }

        /* FORM BODY */
        .su-form-body { padding: 24px 36px 32px; }
        .su-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }
        .su-col-2 { grid-column: span 2; }

        .su-field { display: flex; flex-direction: column; gap: 6px; }
        .su-label {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #57606a;
        }
        .su-input {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 14px; color: #0d1117;
          background: #f6f8fa;
          border: 1.5px solid #d0d7de;
          border-radius: 10px;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          width: 100%;
        }
        .su-input::placeholder { color: #8b949e; }
        .su-input:focus {
          border-color: #1a56db;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(26,86,219,0.10);
        }
        .su-password-wrap {
          position: relative;
        }
        .su-password-toggle {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.12);
          color: #57606a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background 0.18s, color 0.18s;
        }
        .su-password-toggle:hover {
          background: rgba(26, 86, 219, 0.12);
          color: #1a56db;
        }

        .su-error {
          font-size: 13px; color: #b91c1c;
          background: #fee2e2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 10px 14px;
          margin-bottom: 4px;
        }

        .su-submit {
          width: 100%;
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 15px; font-weight: 600;
          color: #ffffff; background: #1a56db;
          border: none; border-radius: 12px;
          padding: 13px 24px; cursor: pointer;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(26,86,219,0.25);
        }
        .su-submit:hover {
          background: #1140b8;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(26,86,219,0.3);
        }
        .su-submit:active { transform: translateY(0); }

        /* FOOTER */
        .su-footer {
          padding: 0 36px 28px;
          font-size: 13px; color: #57606a;
        }
        .su-footer a {
          font-weight: 600; color: #0d1117;
          text-decoration: none; transition: color 0.15s;
        }
        .su-footer a:hover { color: #1a56db; }

        @media (max-width: 580px) {
          .su-grid { grid-template-columns: 1fr; }
          .su-col-2 { grid-column: span 1; }
          .su-card-header, .su-form-header, .su-form-body, .su-footer {
            padding-left: 20px; padding-right: 20px;
          }
        }
      `}</style>

      <main className="su-root">
        <div className="su-blob-1" />
        <div className="su-blob-2" />
        <div className="su-grid-overlay" />

        <div className="su-card">
          <div className="su-accent-bar" />

          {/* HEADER — back link */}
          <div className="su-card-header">
            <Link href="/" className="su-back">← Back to home</Link>
            <div className="su-brand-lockup">
              <div className="su-logo-panel">
                <UniversityWordmark />
              </div>
            </div>
          </div>

          <div className="su-form-header">
            <div className="su-eyebrow"><span className="su-eyebrow-dot" />Student onboarding</div>
            <h1 className="su-title">Create your <em>student</em> account</h1>
            <p className="su-subtitle">
              Set up your academic profile and start building your verified achievement portfolio.
            </p>
          </div>
          <div className="su-form-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="su-grid">
                <div className="su-field">
                  <label className="su-label">Full name</label>
                  <input className="su-input" placeholder="e.g. Konda Rajesh" {...register("name", { required: true })} />
                </div>
                <div className="su-field">
                  <label className="su-label">Email</label>
                  <input className="su-input" type="email" placeholder="e.g. rajesh@gmail.com" {...register("email", { required: true })} />
                </div>
                <div className="su-field">
                  <label className="su-label">Password</label>
                  <div className="su-password-wrap">
                    <input
                      className="su-input"
                      type={showStudentPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      style={{ paddingRight: 50 }}
                      {...register("password", { required: true })}
                    />
                    <button
                      type="button"
                      className="su-password-toggle"
                      aria-label={showStudentPassword ? "Hide password" : "Show password"}
                      aria-pressed={showStudentPassword}
                      onClick={() => setShowStudentPassword((current) => !current)}
                    >
                      {showStudentPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
                <div className="su-field">
                  <label className="su-label">Registration number</label>
                  <input className="su-input" placeholder="e.g. 231FA04023" {...register("studentId", { required: true })} />
                </div>
                <div className="su-field">
                  <label className="su-label">Department</label>
                  <input className="su-input" placeholder="e.g. CSE" {...register("department", { required: true })} />
                </div>
                <div className="su-field">
                  <label className="su-label">Program</label>
                  <input className="su-input" placeholder="e.g. B.Tech" {...register("program", { required: true })} />
                </div>
                <div className="su-field">
                  <label className="su-label">Admission category</label>
                  <input className="su-input" placeholder="e.g. EAMCET / JEE / VSAT" {...register("admissionCategory")} />
                </div>
                <div className="su-field">
                  <label className="su-label">Academic year</label>
                  <select className="su-input" {...register("year", { valueAsNumber: true, required: true })}>
                    {[
                      { value: 1, label: "I" },
                      { value: 2, label: "II" },
                      { value: 3, label: "III" },
                      { value: 4, label: "IV" },
                    ].map((year) => (
                      <option key={year.value} value={year.value}>{year.label}</option>
                    ))}
                  </select>
                </div>
                <div className="su-field">
                  <label className="su-label">Semester</label>
                  <select className="su-input" {...register("semester", { valueAsNumber: true, required: true })}>
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>
                <div className="su-field">
                  <label className="su-label">Year of graduation</label>
                  <select className="su-input" {...register("graduationYear", { valueAsNumber: true, required: true })}>
                    {graduationYears.map((graduationYear) => (
                      <option key={graduationYear} value={graduationYear}>
                        {graduationYear}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="su-field su-col-2">
                  <label className="su-label">Phone number</label>
                  <input className="su-input" placeholder="e.g. 9876543210" {...register("phone")} />
                </div>
              </div>
              {error ? <p className="su-error">{error}</p> : null}
              <button className="su-submit" type="submit">Create student account →</button>
            </form>
          </div>

          <div className="su-footer">
            Already have an account?{" "}
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
      </main>
    </>
  );
}
