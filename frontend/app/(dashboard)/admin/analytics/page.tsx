"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DepartmentBarChart, GrowthLineChart } from "@/components/charts/overview-chart";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { BarChart3, LineChart, Sparkles, Activity, ShieldCheck, RefreshCcw } from "lucide-react";

export default function AnalyticsPage() {
  const { token } = useAuth();
  const { data, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<any>("/admin/dashboard", { token }),
    enabled: !!token,
  });
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<string>("");

  const insightsMutation = useMutation({
    mutationFn: () => api<{ insights: string }>("/admin/insights", { token }),
    onSuccess: (payload) => {
      setAiInsights(payload.insights || "");
      setAiStatus("");
    },
    onError: () => {
      setAiStatus("Unable to generate insights right now.");
    },
  });

  const mergedDepartmentData = (data?.departmentData || []).map((item: any) => ({
    _id: item._id,
    totalStudents: item.totalStudents,
    totalAchievements: item.totalAchievements ?? 0,
  }));

  return (
    <DashboardShell
      title="Institutional Analytics"
      subtitle="Strategic insights and performance trends for administrative leadership."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Student achievements", href: "/admin/student-achievements" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between mb-2 animate-fade-up">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm">
          <Activity size={12} />
          LIVE DATA STREAM
        </div>
        {isFetching && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
            Syncing...
          </div>
        )}
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8 animate-fade-up" style={{ animationDelay: "50ms" }}>
        {/* Department Chart */}
        <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-panel hover:border-brand-200 transition-all group">
          <div className="px-8 py-5 border-b border-surface-50 bg-surface-50/20 flex items-center justify-between">
             <h3 className="font-sans text-[11px] font-semibold text-ink flex items-center gap-2 uppercase tracking-widest">
               <BarChart3 size={16} className="text-brand-500" />
               Departmental Participation
             </h3>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Metric: Counts</span>
          </div>
          <div className="p-8 pb-4">
             <div className="w-full">
                <DepartmentBarChart data={mergedDepartmentData} />
             </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-panel hover:border-brand-200 transition-all group">
          <div className="px-8 py-5 border-b border-surface-50 bg-surface-50/20 flex items-center justify-between">
             <h3 className="font-sans text-[11px] font-semibold text-ink flex items-center gap-2 uppercase tracking-widest">
               <LineChart size={16} className="text-brand-500" />
               Achievement Trajectory
             </h3>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Metric: Year-over-Year</span>
          </div>
          <div className="p-8 pb-6">
             <div className="w-full">
                <GrowthLineChart data={data?.yearlyGrowth || []} />
             </div>
          </div>
        </div>
      </div>

      {/* ── AI Insights Section ── */}
      <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-panel animate-fade-up" style={{ animationDelay: "150ms" }}>
        <div className="p-8 border-b border-surface-50 bg-gradient-to-br from-brand-50/50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-brand-600 border border-brand-50">
                 <Sparkles size={24} />
              </div>
              <div>
                 <h2 className="font-display font-bold text-2xl text-ink leading-tight">Intelligent Insight Generation</h2>
                 <p className="text-sm font-medium text-slate-500 mt-1">Automated analysis of current institutional trends and patterns.</p>
              </div>
           </div>
           <button 
             className={cn(
               "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md active:translate-y-0 disabled:opacity-50",
               insightsMutation.isPending 
                 ? "bg-brand-50 text-brand-400 border border-brand-100" 
                 : "bg-brand-600 text-white hover:bg-brand-700 hover:-translate-y-0.5"
             )}
             disabled={insightsMutation.isPending}
             onClick={() => { setAiStatus("Analyzing datasets..."); insightsMutation.mutate(); }}
           >
             {insightsMutation.isPending ? "COMPUTING..." : "GENERATE INSIGHTS"}
           </button>
        </div>

        <div className="p-8 min-h-[200px]">
           {aiInsights ? (
             <div className="prose prose-slate max-w-none">
                <div className="bg-surface-50 border border-surface-200 rounded-3xl p-8 text-ink text-sm font-medium leading-relaxed shadow-inner animate-fade-in">
                   {aiInsights}
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                   <Sparkles size={32} />
                </div>
                <h4 className="text-ink font-bold mb-1">Ready for analysis</h4>
                <p className="text-slate-400 text-sm max-w-xs">{aiStatus || "Click the button above to synthesize recent data points into actionable insights."}</p>
             </div>
           )}
        </div>
      </div>
    </DashboardShell>
  );
}
