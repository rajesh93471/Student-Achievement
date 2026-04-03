"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

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
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  helper: string;
  accent: "amber" | "blue" | "emerald" | "purple";
  delay: number;
}) {
  const accentColors = {
    amber: "text-amber-500 bg-amber-50",
    blue: "text-brand-500 bg-brand-50",
    emerald: "text-emerald-500 bg-emerald-50",
    purple: "text-purple-500 bg-purple-50"
  };

  return (
    <div className={`bg-white border border-surface-200 rounded-2xl p-4 relative overflow-hidden animate-fade-up hover:border-brand-200 hover:shadow-panel transition-all shadow-sm group`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full blur-[20px] ${accentColors[accent].split(' ')[1]} opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity`}></div>
      <p className="font-sans text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-1">{label}</p>
      <p className={`font-display text-2xl font-semibold leading-none mb-1 ${accentColors[accent].split(' ')[0]}`}>{value}</p>
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">{helper}</p>
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
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () =>
      api<{ student: any; achievements: any[]; documents: any[] }>("/students/me", { token }),
    enabled: !!token,
  });

  const student      = data?.student;
  const achievements = data?.achievements || [];

  return (
    <DashboardShell
      title="Student dashboard"
      subtitle="Track profile strength, documents, and achievements in one place."
      nav={[
        { label: "Overview",     href: "/student" },
        { label: "Profile",      href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents",    href: "/student/documents" },
      ]}
    >
      {/* ── Stat cards ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashStatCard label="CGPA"         value={student?.cgpa ?? "-"}               helper="Latest cumulative GPA"       accent="amber" delay={0}   />
        <DashStatCard label="Semester"     value={student?.semester ?? "-"}           helper="Current academic term"       accent="blue" delay={60}  />
        <DashStatCard label="Achievements" value={student?.achievementsCount ?? 0}    helper="Total registered entries"  accent="emerald" delay={120} />
        <DashStatCard label="Documents"    value={student?.documentsCount ?? 0}       helper="Stored academic records"     accent="purple" delay={180} />
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
              {achievements.map((item) => {
                const bgClass = CATEGORY_STYLES[item.category] || "bg-slate-50 text-slate-500 border-slate-100";

              return (
                <div key={item._id} className="flex flex-col bg-white border border-surface-100 rounded-2xl overflow-hidden hover:border-brand-200 hover:shadow-panel transition-all group">
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-surface-50 flex items-start justify-between gap-2 bg-surface-50 group-hover:bg-brand-50/30 transition-colors">
                    <h3 className="font-display font-semibold text-ink leading-tight line-clamp-1 text-sm tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Body (details grid) */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Type</p>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${bgClass} uppercase tracking-tighter`}>
                          {item.category?.slice(0, 10)}
                        </span>
                      </div>
                    
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Date</p>
                      <p className="text-[11px] font-semibold text-ink">{formatDate(item.date)}</p>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <Link 
                    href="/student/achievements"
                    className="px-4 py-2 border-t border-surface-50 bg-surface-50/30 flex items-center justify-end gap-2 text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:text-brand-700 transition-colors"
                  >
                       VIEW DETAILS →
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
