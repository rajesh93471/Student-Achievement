"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const passwordMutation = useMutation({
    mutationFn: (payload: typeof passwordForm) =>
      api<{ message: string }>("/users/me/change-password", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setPasswordMessage("Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: () => {
      setPasswordMessage("Unable to update password. Check your current password.");
    },
  });

  return (
    <DashboardShell
      title="Settings"
      subtitle="Manage your profile metadata and account security."
      nav={[
        { label: "Dashboard", href: user?.role === "admin" ? "/admin" : "/student" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Left Side: Profile Overview (Read-Only) */}
        <section className="space-y-6">
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm animate-fade-up">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-3.5 rounded-full bg-brand-500"></div>
              <h2 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Account overview</h2>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg transform rotate-3">
                <span className="font-display text-2xl font-bold">
                  {user?.name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-ink leading-tight truncate">
                  {user?.name || "User Name"}
                </h3>
                <p className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full inline-flex uppercase tracking-widest mt-1.5 border border-brand-100">
                  {user?.role || "Member"}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100/50">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email address</p>
                <p className="text-sm font-semibold text-ink break-all">{user?.email || "No email"}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100/50">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-sm font-semibold text-emerald-700">Active Account</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Security & Forms */}
        <section className="space-y-8 min-w-0">
          
          {/* Security Card */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 rounded-full bg-emerald-500"></div>
                <h2 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Security & Privacy</h2>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-surface-50/50 border border-surface-100 group transition-all hover:bg-surface-50">
               <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white border border-surface-200 flex items-center justify-center shadow-sm text-lg text-slate-400 group-hover:text-emerald-600 transition-colors">
                   🔑
                 </div>
                 <div>
                   <p className="font-display text-base font-bold text-ink leading-tight">Master Password</p>
                   <p className="text-[11px] font-medium text-slate-500 mt-1 opacity-80">Protect your account and verified achievements.</p>
                 </div>
               </div>
               <button
                  className="bg-brand-600 text-white font-bold text-[10px] py-3 px-8 rounded-2xl hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg transition-all uppercase tracking-widest"
                  type="button"
                  onClick={() => {
                    setShowPasswordForm((prev) => !prev);
                    setPasswordMessage("");
                  }}
                >
                  {showPasswordForm ? "CANCEL CHANGE" : "CHANGE PASSWORD"}
                </button>
            </div>

            {/* Change Password Form */}
            {showPasswordForm && (
              <div className="mt-8 pt-8 border-t border-surface-100 animate-fade-in">
                <div className="max-w-xl">
                  <h3 className="font-display text-xl font-bold text-ink mb-2">Update Password</h3>
                  <p className="text-[12px] font-medium text-slate-500 mb-6 opacity-80">Ensure your new password contains at least 8 characters including numbers and symbols.</p>
                  
                  {passwordMessage && (
                    <div className={`mb-6 p-4 rounded-2xl border text-[12px] font-bold uppercase tracking-tight flex items-center gap-3 ${passwordMessage.includes("successfully") ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"}`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {passwordMessage}
                    </div>
                  )}

                  <form
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setPasswordMessage("");
                      passwordMutation.mutate(passwordForm);
                    }}
                  >
                    <div className="sm:col-span-2">
                       <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Current Password</label>
                       <input
                        className="w-full bg-white border border-surface-200 rounded-2xl px-5 py-3.5 text-ink outline-none focus:border-brand-500 transition-colors shadow-sm"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                        required
                      />
                    </div>
                    <div>
                       <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">New Password</label>
                       <input
                        className="w-full bg-white border border-surface-200 rounded-2xl px-5 py-3.5 text-ink outline-none focus:border-brand-500 transition-colors shadow-sm"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                        required
                      />
                    </div>
                    <div>
                       <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Retype Password</label>
                       <input
                        className="w-full bg-white border border-surface-200 rounded-2xl px-5 py-3.5 text-ink outline-none focus:border-brand-500 transition-colors shadow-sm"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2 mt-2">
                      <button 
                        className="w-full sm:w-auto bg-brand-600 text-white font-bold text-[10px] py-4 px-10 rounded-2xl hover:bg-brand-700 transition-colors shadow-md uppercase tracking-[0.2em]"
                        type="submit"
                        disabled={passwordMutation.isPending}
                      >
                        {passwordMutation.isPending ? "VERIFYING..." : "COMMIT CHANGES"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
