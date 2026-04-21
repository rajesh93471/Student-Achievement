"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { UserCircle2, Mail, Briefcase, Hash, ShieldCheck, Check, Edit3, X as CloseIcon } from "lucide-react";

export default function FacultyProfilePage() {
  const { user, token, setSession } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["faculty-profile-detailed"],
    queryFn: () => api<any>("/faculty/profile", { token }),
    enabled: !!token,
  });

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
      setTimeout(() => setShowPasswordForm(false), 2000);
    },
    onError: () => {
      setPasswordMessage("Unable to update password. Check your current password.");
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 animate-fade-up">
      
      {/* ── Left Side: Identity Card ── */}
      <div className="space-y-6">
        <div className="bg-white border border-surface-200 rounded-[32px] p-8 shadow-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500 opacity-50"></div>
          
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-brand-600 text-white flex items-center justify-center text-4xl font-bold shadow-xl mb-6 transform rotate-3 transition-transform group-hover:rotate-0">
               {user?.name?.charAt(0) || 'F'}
            </div>
            <h2 className="font-display font-black text-2xl text-ink leading-tight mb-1">{user?.name}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Faculty Supervisor</p>
            
            <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2">
              <ShieldCheck size={14} />
              Verified Faculty Account
            </div>
          </div>

          <div className="mt-10 space-y-4">
             <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100/50 flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-slate-400">
                 <Hash size={18} />
               </div>
               <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Employee ID</p>
                 <p className="text-sm font-bold text-ink">{profile?.employeeId || '...'}</p>
               </div>
             </div>
             <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100/50 flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-slate-400">
                 <Briefcase size={18} />
               </div>
               <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Academic Scope</p>
                 <p className="text-sm font-bold text-ink">{profile?.department} &bull; Section {profile?.section}</p>
               </div>
             </div>
             <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100/50 flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-slate-400">
                 <Mail size={18} />
               </div>
               <div className="min-w-0">
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Verified Email</p>
                 <p className="text-sm font-bold text-ink truncate">{user?.email}</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* ── Right Side: Security & Bio ── */}
      <div className="space-y-6">
        <div className="bg-white border border-surface-200 rounded-[32px] p-8 shadow-panel">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-4 rounded-full bg-brand-500"></div>
            <h3 className="font-sans text-[11px] font-black uppercase tracking-widest text-slate-400">Security & Account Access</h3>
          </div>

          <div className="p-6 rounded-3xl bg-surface-50/50 border border-surface-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-50 transition-colors">
             <div className="flex gap-5">
               <div className="w-14 h-14 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl">
                 🔐
               </div>
               <div>
                 <p className="font-display font-bold text-lg text-ink">Account Password</p>
                 <p className="text-xs font-medium text-slate-500 mt-1 opacity-80">Last updated recently. Ensure it remains strong.</p>
               </div>
             </div>
             <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="bg-brand-600 text-white font-black text-[10px] py-3.5 px-8 rounded-2xl hover:bg-brand-700 hover:-translate-y-0.5 transition-all uppercase tracking-widest shadow-md"
              >
                {showPasswordForm ? "CANCEL CHANGE" : "UPDATE PASSWORD"}
              </button>
          </div>

          {showPasswordForm && (
            <div className="mt-8 pt-8 border-t border-surface-100 animate-fade-in">
               <div className="max-w-xl">
                 <h4 className="font-display font-black text-xl text-ink mb-2">Change Password</h4>
                 <p className="text-xs font-medium text-slate-500 mb-8 opacity-80">Update your credentials to maintain supervisor access.</p>
                 
                 {passwordMessage && (
                   <div className={`mb-6 p-4 rounded-2xl border text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 ${passwordMessage.includes("successfully") ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"}`}>
                     <Check size={16} />
                     {passwordMessage}
                   </div>
                 )}

                 <form
                   className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                   onSubmit={(e) => {
                     e.preventDefault();
                     passwordMutation.mutate(passwordForm);
                   }}
                 >
                   <div className="sm:col-span-2">
                     <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Current Password</label>
                     <input
                      type="password"
                      className="w-full bg-white border border-surface-200 rounded-2xl px-6 py-4 text-ink outline-none focus:border-brand-500 transition-colors shadow-sm text-sm"
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                   </div>
                   <div>
                     <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">New Password</label>
                     <input
                      type="password"
                      className="w-full bg-white border border-surface-200 rounded-2xl px-6 py-4 text-ink outline-none focus:border-brand-500 transition-colors shadow-sm text-sm"
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                   </div>
                   <div>
                     <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Confirm Password</label>
                     <input
                      type="password"
                      className="w-full bg-white border border-surface-200 rounded-2xl px-6 py-4 text-ink outline-none focus:border-brand-500 transition-colors shadow-sm text-sm"
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                   </div>
                   <div className="sm:col-span-2 mt-2">
                     <button 
                       type="submit"
                       disabled={passwordMutation.isPending}
                       className="w-full sm:w-auto bg-ink text-white font-black text-[10px] py-4 px-12 rounded-2xl hover:bg-slate-800 transition-all shadow-lg uppercase tracking-[0.25em]"
                     >
                       {passwordMutation.isPending ? "VERIFYING..." : "COMMIT CHANGES"}
                     </button>
                   </div>
                 </form>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
