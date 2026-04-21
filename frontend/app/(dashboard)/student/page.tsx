"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Award, FileText, Calendar, GraduationCap, Plus, User, ArrowRight, BookOpen } from "lucide-react";

/* ─── Category + status colors (shared system) ───────────────────────────── */
const CATEGORY_STYLES: Record<string, string> = {
  academic:      "bg-amber-100 text-amber-700 border-amber-200",
  hackathon:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  competition:   "bg-blue-100 text-blue-700 border-blue-200",
  olympiad:      "bg-purple-100 text-purple-700 border-purple-200",
  certification: "bg-rose-100 text-rose-700 border-rose-200",
  internship:    "bg-cyan-100 text-cyan-700 border-cyan-200",
  project:       "bg-lime-100 text-lime-700 border-lime-200",
  sports:        "bg-orange-100 text-orange-700 border-orange-200",
  cultural:      "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  club:          "bg-indigo-100 text-indigo-700 border-indigo-200",
  research:      "bg-teal-100 text-teal-700 border-teal-200",
};

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function DashStatCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: any;
  accent: "amber" | "blue" | "emerald" | "purple";
  delay: number;
}) {
  const accentColors = {
    amber:   "text-amber-500   bg-amber-50   border-amber-100   shadow-amber-100/20",
    blue:    "text-brand-500   bg-brand-50   border-brand-100   shadow-brand-100/20",
    emerald: "text-emerald-500 bg-emerald-50 border-emerald-100 shadow-emerald-100/20",
    purple:  "text-purple-500  bg-purple-50  border-purple-100  shadow-purple-100/20"
  };

  return (
    <div 
      className={`bg-white/70 backdrop-blur-md border border-surface-200 rounded-3xl p-5 relative overflow-hidden animate-fade-up hover:border-brand-300 hover:shadow-panel transition-all shadow-sm group`} 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[30px] ${accentColors[accent].split(' ')[1]} opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-2xl ${accentColors[accent].split(' ')[1]} ${accentColors[accent].split(' ')[0]} border ${accentColors[accent].split(' ')[2]} group-hover:scale-110 transition-transform`}>
           <Icon size={20} />
        </div>
        <p className={`font-display text-2xl font-bold leading-none ${accentColors[accent].split(' ')[0]}`}>{value}</p>
      </div>
      
      <div>
        <p className="font-sans text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5 group-hover:text-brand-600 transition-colors">{label}</p>
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-tight leading-tight">{helper}</p>
      </div>
    </div>
  );
}

/* ─── Profile snapshot field ─────────────────────────────────────────────── */
function SnapField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-b border-surface-50 pb-2 h-full">
      <p className="font-sans text-[8px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">{label}</p>
      <p className={`text-xs font-semibold tracking-tight ${value ? "text-ink" : "text-slate-300"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function StudentDashboardPage() {
  const { token, user } = useAuth();
  const { data } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () =>
      api<{ student: any; achievements: any[]; documents: any[] }>("/students/me", { token }),
    enabled: !!token && !!user?.id,
  });

  const student      = data?.student;
  const achievements = data?.achievements || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <DashboardShell
      title="Overview"
      subtitle="Track your academic record, documents, and campus achievements."
      nav={[
        { label: "Overview",     href: "/student" },
        { label: "Profile",      href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents",    href: "/student/documents" },
      ]}
    >
      {/* ── Welcome Hero ── */}
      <section className="relative overflow-hidden rounded-[32px] bg-brand-900 p-8 sm:p-10 shadow-2xl animate-fade-up">
         {/* Background Orbs */}
         <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 rounded-full blur-[80px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
               <p className="text-brand-300 font-bold uppercase tracking-[0.2em] text-[10px] mb-3">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
               <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
                  {greeting}, <em className="not-italic text-accent-400">{student?.fullName?.split(' ')[0] || "Student"}</em>!
               </h1>
               <p className="text-brand-100/80 text-sm leading-relaxed max-w-md">
                  Your academic record is up to date. You have <span className="text-white font-bold">{achievements.length} verified achievements</span> and <span className="text-white font-bold">{student?.documentsCount || 0} documents</span> in your vault.
               </p>
            </div>
            <div className="flex flex-wrap gap-3">
               <Link 
                  href="/student/achievements" 
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white text-brand-900 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
               >
                  <Plus size={16} />
                  New Achievement
               </Link>
               <Link 
                  href="/student/documents" 
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-white/20 active:scale-95 transition-all"
               >
                  <FileText size={16} />
                  Vault
               </Link>
            </div>
         </div>
      </section>

      {/* ── Stat cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashStatCard label="CGPA"         value={student?.cgpa ?? "-"}               helper="Cumulative Grade Pt"       icon={GraduationCap} accent="amber" delay={100}   />
        <DashStatCard label="Semester"     value={student?.semester ?? "-"}           helper="Current term progress"    icon={Calendar} accent="blue" delay={160}  />
        <DashStatCard label="Achievements" value={student?.achievementsCount ?? 0}    helper="Total verified entries"  icon={Award} accent="emerald" delay={220} />
        <DashStatCard label="Documents"    value={student?.documentsCount ?? 0}       helper="Academic file storage"    icon={FileText} accent="purple" delay={280} />
      </section>

      {/* ── Profile snapshot + highlights ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        
        {/* Profile snapshot */}
        <div className="bg-white border border-surface-200 rounded-3xl p-5 sm:p-6 shadow-sm animate-fade-up hover:border-brand-100 transition-colors" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-3.5 rounded-full bg-brand-500"></div>
            <h2 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Profile snapshot</h2>
          </div>

          <div className="flex items-center gap-3 mb-6 p-3 bg-surface-50 border border-surface-50 rounded-2xl">
            <div className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="font-display text-xl font-semibold">
                {student?.fullName?.charAt(0) ?? "?"}
              </span>
            </div>
            <div>
              <p className="font-display text-base font-semibold text-ink leading-tight">{student?.fullName ?? "-"}</p>
              <p className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-flex tracking-tighter mt-0.5 uppercase">{student?.studentId ?? "No ID"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <SnapField label="Dept"         value={student?.department} />
            <SnapField label="Prog"            value={student?.program} />
            <SnapField label="Study"       value={student?.year ? `Year ${student.year}` : "-"} />
            <SnapField label="Grad"    value={student?.graduationYear ? String(student.graduationYear) : "-"} />
            <SnapField label="Admn" value={student?.admissionCategory} />
            <SnapField label="Mail"              value={student?.email} />
            <SnapField label="Phn"              value={student?.phone} />
          </div>
        </div>

        {/* Resume-ready highlights */}
        <div className="bg-white border border-surface-200 rounded-3xl p-5 sm:p-6 shadow-sm animate-fade-up" style={{ animationDelay: "260ms" }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-3.5 rounded-full bg-emerald-500"></div>
            <h2 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Highlights</h2>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: "📄", text: "Portfolio package generation." },
              { icon: "🏆", text: "Leaderboard & recognition ready." },
              { icon: "📁", text: "Verified academic records storage." },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
                <span className="text-lg shrink-0 mt-0.5">{icon}</span>
                <p className="text-[11px] text-emerald-800 font-semibold tracking-tight leading-relaxed uppercase">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent achievements cards format ── */}
      <section className="bg-white border border-surface-200 rounded-3xl p-5 sm:p-6 shadow-sm animate-fade-up" style={{ animationDelay: "320ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 rounded-full bg-purple-500"></div>
            <h2 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Recent entries</h2>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 bg-surface-50 rounded-full text-slate-400 border border-surface-100 uppercase">
            {achievements.length} ITEMS
          </span>
        </div>

        {achievements.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-surface-200 rounded-3xl text-slate-500">
            <span className="text-4xl block mb-4">📭</span>
            <p className="font-semibold text-lg text-ink mb-1">No achievements recorded yet</p>
            <p className="text-sm">Head over to the achievements tab to add your first entry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.slice(0, 6).map((item) => {
                const bgClass = CATEGORY_STYLES[item.category] || "bg-slate-50 text-slate-500 border-slate-100";

              return (
                <div key={item._id} className="group relative flex flex-col bg-white border border-surface-200 rounded-[24px] overflow-hidden hover:border-brand-400 hover:shadow-panel transition-all duration-300">
                  
                  {/* Category Badge Floating */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${bgClass} uppercase tracking-[0.1em] shadow-sm`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col pt-10">
                    <h3 className="font-display font-bold text-ink leading-tight mb-3 text-base line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="mt-auto flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(item.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link overlay-ish */}
                  <Link 
                    href="/student/achievements"
                    className="px-6 py-4 bg-surface-50 border-t border-surface-100 flex items-center justify-between text-[10px] font-bold text-brand-600 uppercase tracking-widest group-hover:bg-brand-50 transition-colors"
                  >
                       Details
                       <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                </div>
              );
            })}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
