"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DepartmentBarChart, GrowthLineChart } from "@/components/charts/overview-chart";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<any>("/admin/dashboard", { token }),
    enabled: !!token,
  });

  const mergedDepartmentData = (data?.departmentData || []).map((item: any) => ({
    _id: item._id,
    totalStudents: item.totalStudents,
    totalAchievements: item.totalAchievements ?? 0,
  }));

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Institutional analytics for leadership and accreditation workflows."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Approvals", href: "/admin/approvals" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DepartmentBarChart data={mergedDepartmentData} />
        <GrowthLineChart data={data?.yearlyGrowth || []} />
      </div>
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Analytic interpretation</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-sky/40 p-4 text-sm text-slate">Number of achievements per department helps identify high-engagement programs.</div>
          <div className="rounded-2xl bg-mint/40 p-4 text-sm text-slate">Top student ranking blends academic performance with verified participation.</div>
          <div className="rounded-2xl bg-white p-4 text-sm text-slate">Year-wise trendlines support annual review, NAAC-style reporting, and department benchmarking.</div>
        </div>
      </section>
    </DashboardShell>
  );
}
