"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useAuth } from "@/components/layout/providers";
import { AuthUser } from "@/lib/types";

type ParentSignUpValues = {
  name: string;
  email: string;
  password: string;
  studentId: string;
  relation: string;
  phone?: string;
};

export default function ParentSignUpPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<ParentSignUpValues>({
    defaultValues: {
      relation: "Parent",
    },
  });

  const onSubmit = async (values: ParentSignUpValues) => {
    try {
      setError(null);
      const response = await api<{ token: string; user: AuthUser }>("/auth/register/parent", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSession(response);
      router.push("/parent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parent sign up failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .psu-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          background: #f6f8fa;
          font-family: 'Geist', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .psu-bg-blob-1 {
          position: absolute;
          top: -140px; right: -140px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .psu-bg-blob-2 {
          position: absolute;
          bottom: -100px; left: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .psu-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 640px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(31,35,40,0.10), 0 2px 8px rgba(31,35,40,0.06);
          overflow: hidden;
        }

        .psu-accent-bar {
          height: 4px;
          background: linear-gradient(90deg, #1a56db 0%, #3b82f6 100%);
        }

        .psu-card-header {
          padding: 28px 36px 24px;
          border-bottom: 1px solid #eaeef2;
        }

        .psu-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 500;
          color: #1a56db;
          text-decoration: none;
          margin-bottom: 20px;
          transition: opacity 0.15s;
        }
        .psu-back:hover { opacity: 0.7; }

        .psu-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #1a56db;
          background: #eef2ff;
          border-radius: 100px;
          padding: 4px 12px;
          margin-bottom: 12px;
        }
        .psu-eyebrow-dot {
          width: 5px; height: 5px;
          background: #1a56db;
          border-radius: 50%;
        }

        .psu-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          color: #0d1117;
          line-height: 1.1;
        }
        .psu-title em { font-style: italic; color: #1a56db; }

        .psu-subtitle {
          font-size: 14px;
          color: #57606a;
          margin-top: 6px;
          line-height: 1.6;
        }

        /* FORM */
        .psu-form-body {
          padding: 28px 36px 32px;
        }

        .psu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .psu-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .psu-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #57606a;
        }

        .psu-input {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 14px;
          color: #0d1117;
          background: #f6f8fa;
          border: 1.5px solid #d0d7de;
          border-radius: 10px;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          width: 100%;
        }
        .psu-input::placeholder { color: #8b949e; }
        .psu-input:focus {
          border-color: #1a56db;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(26,86,219,0.10);
        }

        .psu-error {
          font-size: 13px;
          color: #b91c1c;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 4px;
        }

        .psu-submit {
          width: 100%;
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          background: #1a56db;
          border: none;
          border-radius: 12px;
          padding: 13px 24px;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(26,86,219,0.25);
        }
        .psu-submit:hover {
          background: #1140b8;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(26,86,219,0.3);
        }
        .psu-submit:active { transform: translateY(0); }

        .psu-footer {
          padding: 0 36px 28px;
          font-size: 13px;
          color: #57606a;
        }
        .psu-footer a {
          font-weight: 600;
          color: #0d1117;
          text-decoration: none;
          transition: color 0.15s;
        }
        .psu-footer a:hover { color: #1a56db; }

        @media (max-width: 560px) {
          .psu-grid { grid-template-columns: 1fr; }
          .psu-card-header, .psu-form-body, .psu-footer { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      <main className="psu-root">
        <div className="psu-bg-blob-1" />
        <div className="psu-bg-blob-2" />

        <div className="psu-card">
          <div className="psu-accent-bar" />

          <div className="psu-card-header">
            <Link href="/" className="psu-back">← Back to home</Link>
            <div className="psu-eyebrow">
              <span className="psu-eyebrow-dot" />
              Parent onboarding
            </div>
            <h1 className="psu-title">
              Create <em>parent</em> account
            </h1>
            <p className="psu-subtitle">
              A parent account can connect to a child only by using that child&apos;s registration number.
            </p>
          </div>

          <div className="psu-form-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="psu-grid">
                <div className="psu-field">
                  <label className="psu-label">Full name</label>
                  <input className="psu-input" placeholder="e.g. Priya Sharma" {...register("name", { required: true })} />
                </div>
                <div className="psu-field">
                  <label className="psu-label">Email</label>
                  <input className="psu-input" type="email" placeholder="e.g. priya@example.com" {...register("email", { required: true })} />
                </div>
                <div className="psu-field">
                  <label className="psu-label">Password</label>
                  <input className="psu-input" type="password" placeholder="Create a strong password" {...register("password", { required: true })} />
                </div>
                <div className="psu-field">
                  <label className="psu-label">Child registration number</label>
                  <input className="psu-input" placeholder="e.g. 231FA04023" {...register("studentId", { required: true })} />
                </div>
                <div className="psu-field">
                  <label className="psu-label">Relation</label>
                  <input className="psu-input" placeholder="e.g. Father / Mother / Guardian" {...register("relation", { required: true })} />
                </div>
                <div className="psu-field">
                  <label className="psu-label">Phone number</label>
                  <input className="psu-input" placeholder="e.g. 9876543210" {...register("phone")} />
                </div>
              </div>

              {error ? <p className="psu-error">{error}</p> : null}

              <button className="psu-submit" type="submit">
                Create parent account →
              </button>
            </form>
          </div>

          <div className="psu-footer">
            Already have an account?{" "}
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
      </main>
    </>
  );
}
