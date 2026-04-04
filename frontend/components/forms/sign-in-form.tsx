"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/layout/providers";
import { AuthUser, Role } from "@/lib/types";
import { Modal } from "@/components/ui/modal";


type LoginValues = {
  identifier: string;
  password: string;
  role: Role;
};

const ROLES: { value: Role; label: string; icon: string }[] = [
  { value: "student", label: "Student",  icon: "ST" },
  { value: "admin",   label: "Admin",    icon: "AD" },
];

export function SignInForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError]               = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "verify" | "reset">("request");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetEmailHint, setResetEmailHint] = useState("");

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
        roleToUse === "admin"  ? "/admin"  : "/student"
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

  const requestOtpMutation = useMutation({
    mutationFn: (identifier: string) =>
      api<{ message: string; email?: string }>("/auth/forgot-password/request-otp", {
        method: "POST",
        body: JSON.stringify({ identifier }),
      }),
    onSuccess: (response) => {
      setResetEmailHint(response.email || "");
      setResetStatus(response.message);
      setResetStep("verify");
      setResetOtp("");
    },
    onError: (err) => {
      setResetStatus(err instanceof Error ? err.message : "Unable to send OTP");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (payload: { identifier: string; otp: string }) =>
      api<{ message: string; resetToken: string }>("/auth/forgot-password/verify-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (response) => {
      setResetToken(response.resetToken);
      setResetStatus(response.message);
      setResetStep("reset");
      setResetPassword("");
      setConfirmResetPassword("");
    },
    onError: (err) => {
      setResetStatus(err instanceof Error ? err.message : "Unable to verify OTP");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: { identifier: string; resetToken: string; password: string }) =>
      api<{ message: string }>("/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (response) => {
      setResetStatus(response.message);
      setResetStep("request");
      setResetIdentifier("");
      setResetOtp("");
      setResetPassword("");
      setConfirmResetPassword("");
      setResetToken("");
      setResetEmailHint("");
      window.setTimeout(() => setIsForgotPasswordOpen(false), 1200);
    },
    onError: (err) => {
      setResetStatus(err instanceof Error ? err.message : "Unable to reset password");
    },
  });

  const modalInputStyle: React.CSSProperties = {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "12px 14px",
    color: "#0f172a",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const openForgotPassword = () => {
    setResetStatus(null);
    setResetStep("request");
    setResetIdentifier("");
    setResetOtp("");
    setResetPassword("");
    setConfirmResetPassword("");
    setResetToken("");
    setResetEmailHint("");
    setIsForgotPasswordOpen(true);
  };

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
        .si-link-action {
          color: #1d4ed8;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          transition: color 0.18s;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .si-link-action:hover { color: #1e3a8a; }
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
        .password-field {
          position: relative;
        }
        .password-toggle {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.12);
          color: #64748b;
          cursor: pointer;
          padding: 0;
          transition: background 0.18s, color 0.18s;
        }
        .password-toggle:hover {
          background: rgba(37, 99, 235, 0.12);
          color: #1d4ed8;
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
            Students and admins can access their role-specific workspace here.
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 7 }}>
              <label style={{
                display: "block",
                fontFamily: "'Inter', sans-serif",
                fontSize: 11, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#64748b", marginBottom: 0,
              }}>
                Password
              </label>
              {selectedRole === "student" ? (
                <button
                  type="button"
                  className="si-link-action"
                  onClick={openForgotPassword}
                >
                  Forgot password?
                </button>
              ) : null}
            </div>
            <div className="password-field">
              <input
                className="si-input"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                style={{ ...inputStyle("password"), paddingRight: 50 }}
                {...fp("password")}
                {...register("password", { required: true })}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
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
        </div>
      </div>

      <Modal open={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} title="Reset student password">
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "request", label: "1. Identify" },
              { key: "verify", label: "2. Verify OTP" },
              { key: "reset", label: "3. New password" },
            ].map((item) => {
              const isActive = resetStep === item.key;
              return (
                <div
                  key={item.key}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: `1px solid ${isActive ? "#93c5fd" : "#e2e8f0"}`,
                    background: isActive ? "rgba(37,99,235,0.08)" : "#ffffff",
                    color: isActive ? "#1e3a8a" : "#64748b",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </div>
              );
            })}
          </div>

          {resetStep === "request" ? (
            <form
              style={{ display: "grid", gap: 16 }}
              onSubmit={(event) => {
                event.preventDefault();
                setResetStatus(null);
                requestOtpMutation.mutate(resetIdentifier.trim());
              }}
            >
              <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
                Enter your registration number or student email. We will send a one-time OTP to the email saved in your profile.
              </p>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#0f172a", fontSize: 13, fontWeight: 600 }}>
                  Registration number or email
                </label>
                <input
                  type="text"
                  value={resetIdentifier}
                  onChange={(event) => setResetIdentifier(event.target.value)}
                  placeholder="e.g. 231FA04023 or student@vignan.ac.in"
                  style={modalInputStyle}
                  required
                />
              </div>
              {resetStatus ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate">
                  {resetStatus}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" type="submit" disabled={requestOtpMutation.isPending}>
                  {requestOtpMutation.isPending ? "Sending OTP..." : "Continue"}
                </button>
                <button className="btn-secondary" type="button" onClick={() => setIsForgotPasswordOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {resetStep === "verify" ? (
            <form
              style={{ display: "grid", gap: 16 }}
              onSubmit={(event) => {
                event.preventDefault();
                setResetStatus(null);
                verifyOtpMutation.mutate({ identifier: resetIdentifier.trim(), otp: resetOtp.trim() });
              }}
            >
              <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
                Enter the OTP sent to {resetEmailHint || "your registered email"}.
              </p>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#0f172a", fontSize: 13, fontWeight: 600 }}>
                  OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(event) => setResetOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  style={{ ...modalInputStyle, letterSpacing: "0.25em" }}
                  required
                />
              </div>
              {resetStatus ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate">
                  {resetStatus}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" type="submit" disabled={verifyOtpMutation.isPending}>
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => {
                    setResetStatus(null);
                    requestOtpMutation.mutate(resetIdentifier.trim());
                  }}
                  disabled={requestOtpMutation.isPending}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          ) : null}

          {resetStep === "reset" ? (
            <form
              style={{ display: "grid", gap: 16 }}
              onSubmit={(event) => {
                event.preventDefault();
                setResetStatus(null);
                if (resetPassword.length < 6) {
                  setResetStatus("Password must be at least 6 characters.");
                  return;
                }
                if (resetPassword !== confirmResetPassword) {
                  setResetStatus("Passwords do not match.");
                  return;
                }
                resetPasswordMutation.mutate({
                  identifier: resetIdentifier.trim(),
                  resetToken,
                  password: resetPassword,
                });
              }}
            >
              <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
                Set your new password and confirm it to finish the reset.
              </p>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#0f172a", fontSize: 13, fontWeight: 600 }}>
                  New password
                </label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  placeholder="Enter new password"
                  style={modalInputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#0f172a", fontSize: 13, fontWeight: 600 }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmResetPassword}
                  onChange={(event) => setConfirmResetPassword(event.target.value)}
                  placeholder="Confirm new password"
                  style={modalInputStyle}
                  required
                />
              </div>
              {resetStatus ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate">
                  {resetStatus}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" type="submit" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? "Updating..." : "Done"}
                </button>
                <button className="btn-secondary" type="button" onClick={() => setIsForgotPasswordOpen(false)}>
                  Close
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
