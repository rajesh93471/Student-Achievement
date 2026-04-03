"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { FileText, FileSpreadsheet, Trophy, BookOpen, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { token } = useAuth();
  const [downloadState, setDownloadState] = useState<string>("");
  const [topLimit, setTopLimit] = useState<number>(10);
  
  const { data } = useQuery({
    queryKey: ["admin-reports", topLimit],
    queryFn: () => api<any>(`/admin/reports?limit=${encodeURIComponent(String(topLimit))}`, { token }),
    enabled: !!token,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const downloadReport = async (format: "pdf" | "excel") => {
    if (!token) return;
    setDownloadState(`Preparing ${format.toUpperCase()} export...`);
    try {
      const response = await fetch(
        `${apiUrl}/admin/reports/export?report=top-achievers&format=${format}&limit=${encodeURIComponent(
          String(topLimit)
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `top-achievers.${format === "pdf" ? "pdf" : "xlsx"}`;
      link.click();
      window.URL.revokeObjectURL(url);
      setDownloadState(``);
    } catch (err) {
      setDownloadState("Export failed.");
    }
  };

  return (
    <DashboardShell
      title="Performance Reports"
      subtitle="Export top-achiever data and participation analytics for accreditation and institutional review."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Student achievements", href: "/admin/student-achievements" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      {/* ── Status Banner ── */}
      <div className="flex items-center gap-3 mb-2 animate-fade-up">
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-100 border border-surface-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <ShieldCheck size={12} />
          Verified Institutional Data
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6 animate-fade-up" style={{ animationDelay: "50ms" }}>
        
        {/* TOP ACHIEVERS CARD */}
        <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-brand-100 transition-colors">
          <div className="px-6 py-4 border-b border-surface-50 bg-surface-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 rounded-full bg-brand-500"></div>
              <h3 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Top performers</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top</span>
              <input
                className="w-16 bg-white border border-surface-200 rounded-lg px-2 py-1 text-xs font-semibold text-ink outline-none focus:ring-2 focus:ring-brand-100 transition-shadow"
                type="number"
                min={1}
                max={200}
                value={topLimit}
                onChange={(e) => setTopLimit(Math.min(200, Math.max(1, Number(e.target.value))))}
              />
              <div className="flex items-center gap-1.5 ml-2 border-l border-surface-100 pl-3">
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 text-slate-600 border border-surface-200 rounded-xl text-[10px] font-bold hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-sm"
                  onClick={() => downloadReport("pdf")}
                >
                  <FileText size={14} />
                  PDF
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-bold hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                  onClick={() => downloadReport("excel")}
                >
                  <FileSpreadsheet size={14} />
                  EXCEL
                </button>
              </div>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {downloadState && (
              <div className="px-6 py-2 bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border-b border-brand-100 animate-pulse">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
                {downloadState}
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/10">
                  <th className="px-6 py-3 font-sans text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-50">Student</th>
                  <th className="px-6 py-3 font-sans text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-50">Department</th>
                  <th className="px-6 py-3 font-sans text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-50 text-center">CGPA</th>
                  <th className="px-6 py-3 font-sans text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-50 text-right">Achievements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {(data?.topAchievers || []).map((student: any, idx: number) => (
                  <tr key={student._id || `${student.studentId || "student"}-${idx}`} className="hover:bg-brand-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-display font-semibold text-ink text-sm leading-tight tracking-tight">{student.fullName}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{student.studentId}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-semibold text-slate-500">{student.department}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="inline-flex px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-full text-[10px] font-bold">
                         {student.cgpa}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">
                         {student.achievementsCount}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CATALOG / EXPLANATION CARD */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm hover:border-brand-100 transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-3.5 rounded-full bg-amber-500"></div>
              <h3 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Reporting Engine</h3>
            </div>
            
            <div className="space-y-4">
                {[
                  { 
                    icon: <Trophy className="text-brand-600" size={18} />, 
                    title: "Top Achievers", 
                    desc: "Comprehensive ranking based on academic CGPA and total verified achievements.",
                    color: "bg-brand-50"
                  },
                  { 
                    icon: <BookOpen className="text-emerald-600" size={18} />, 
                    title: "Departmental Stats", 
                    desc: "Comparative participation intensity across different academic programs.",
                    color: "bg-emerald-50"
                  },
                  { 
                    icon: <Layers className="text-amber-600" size={18} />, 
                    title: "Category Segmentation", 
                    desc: "Analytics on technical vs non-technical student contributions.",
                    color: "bg-amber-50"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-surface-50 hover:bg-surface-50 transition-colors group">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-sm", item.color)}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-ink text-sm leading-tight mb-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
             <h3 className="font-display font-semibold text-xl mb-2 relative z-10">Export Summary</h3>
             <p className="text-white/60 text-xs font-medium leading-relaxed mb-6 relative z-10">
               All generated reports adhere to NIRF and NAAC accreditation standards, providing verified data points for institutional review.
             </p>
             <div className="flex items-center gap-3 relative z-10">
                <div className="px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                   v2.4 Ready
                </div>
             </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
