"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useAuth } from "@/components/layout/providers";
import { AuthUser, Role } from "@/lib/types";

type LoginValues = {
  identifier: string;
  password: string;
  role: Role;
};

const ROLES: { value: Role; label: string; icon: string }[] = [
  { value: "student", label: "Student",  icon: "ST" },
  { value: "admin",   label: "Admin",    icon: "AD" },
  { value: "parent",  label: "Parent",   icon: "PA" },
];

export function SignInForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError]               = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("student");

  const { register, handleSubmit, setValue } = useForm<LoginValues>({
    defaultValues: { role: "student" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      setError(null);
      const response = await api<{ token: string; user: AuthUser & { role: Role } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSession(response);
      const actualRole  = response.user.role;
      const roleToUse   = values.role === actualRole ? values.role : actualRole;
      router.push(
        roleToUse === "admin"  ? "/admin"  :
        roleToUse === "parent" ? "/parent" : "/student"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    background: "#ffffff",
    border: `1px solid ${focusedField === name ? "#2563eb" : "#cbd5e1"}`,
    borderRadius: 10,
    padding: "11px 14px",
    color: "#0f172a",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
  });

  const fp = (name: string) => ({
    onFocus: () => setFocusedField(name),
    onBlur:  () => setFocusedField(null),
  });

  const identifierLabel = selectedRole === "student" ? "Registration number" : "Email";
  const identifierPlaceholder =
    selectedRole === "student" ? "e.g. 231FA04023" : "you@university.edu";
  const identifierType = selectedRole === "student" ? "text" : "email";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
        @keyframes siFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .si-input::placeholder { color: #94a3b8; }
        .si-link {
          color: #475569;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          transition: color 0.18s;
        }
        .si-link:hover { color: #0f172a; }
        .si-link-amber {
          color: #2563eb;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          transition: color 0.18s;
        }
        .si-link-amber:hover { color: #1d4ed8; }
        .role-pill {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
          flex: 1;
          justify-content: center;
        }
        .role-pill:hover { border-color: #94a3b8; color: #0f172a; }
        .role-pill.active {
          border-color: #2563eb;
          color: #1e3a8a;
          background: rgba(37,99,235,0.08);
        }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: "36px 36px 32px",
        animation: "siFadeUp 0.45s ease both",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(37,99,235,0.12)", filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        {/* Back link */}
        <Link href="/" className="si-link" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          &lt;- Back to home
        </Link>

        {/* Heading */}
        <div style={{ marginTop: 20, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 3, height: 22, borderRadius: 99, background: "#1e3a8a" }} />
            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 28, fontWeight: 600,
              color: "#0f172a", margin: 0,
            }}>
              Sign in
            </h1>
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13, color: "#64748b",
            margin: 0, lineHeight: 1.7,
            letterSpacing: "0.02em",
          }}>
            Students, admins, and parents can access their role-specific workspace here.
          </p>
        </div>

        <form style={{ display: "grid", gap: 14 }} onSubmit={handleSubmit(onSubmit)}>

          {/* Role selector */}
          <div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#64748b", marginBottom: 8,
            }}>
              Sign in as
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ROLES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`role-pill${selectedRole === value ? " active" : ""}`}
                  onClick={() => {
                    setSelectedRole(value);
                    setValue("role", value);
                  }}
                >
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            {/* Hidden select keeps react-hook-form in sync */}
            <select style={{ display: "none" }} {...register("role", { required: true })}>
              {ROLES.map(({ value }) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #e2e8f0", margin: "2px 0" }} />

          {/* Identifier */}
          <div>
            <label style={{
              display: "block",
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#64748b", marginBottom: 7,
            }}>
              {identifierLabel}
            </label>
            <input
              className="si-input"
              type={identifierType}
              placeholder={identifierPlaceholder}
              style={inputStyle("identifier")}
              {...fp("identifier")}
              {...register("identifier", { required: true })}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: "block",
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#64748b", marginBottom: 7,
            }}>
              Password
            </label>
            <input
              className="si-input"
              type="password"
              placeholder="********"
              style={inputStyle("password")}
              {...fp("password")}
              {...register("password", { required: true })}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.25)",
              borderRadius: 8, padding: "10px 14px",
              fontFamily: "'Inter', sans-serif",
              fontSize: 12, color: "#e11d48",
              letterSpacing: "0.02em",
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{
              marginTop: 4,
              background: "#1e3a8a", color: "#ffffff",
              border: "none", borderRadius: 8,
              padding: "12px 24px",
              fontFamily: "'Inter', sans-serif",
              fontSize: 14, fontWeight: 600,
              letterSpacing: "0.04em",
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
            Sign in -&gt;
          </button>
        </form>

        {/* Footer links */}
        <div style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748b" }}>
            New here?
          </span>
          <Link href="/signup" className="si-link-amber">Student sign up</Link>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94a3b8" }}>or</span>
          <Link href="/parent-signup" className="si-link-amber">Parent sign up</Link>
        </div>
      </div>
    </>
  );
}
