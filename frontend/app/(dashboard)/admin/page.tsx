"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DepartmentBarChart, GrowthLineChart } from "@/components/charts/overview-chart";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<any>("/admin/dashboard", { token }),
    enabled: !!token,
  });

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Manage students, approvals, analytics, and institutional reporting."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Approvals", href: "/admin/approvals" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Students" value={data?.metrics.totalStudents ?? 0} helper="Total active profiles" />
        <StatCard label="Achievements" value={data?.metrics.totalAchievements ?? 0} helper="System-wide entries" />
        <StatCard label="Pending approvals" value={data?.metrics.pendingApprovals ?? 0} helper="Need admin or faculty action" />
        <StatCard label="Documents" value={data?.metrics.totalDocuments ?? 0} helper="Securely registered files" />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <DepartmentBarChart data={data?.departmentData || []} />
        <GrowthLineChart data={data?.yearlyGrowth || []} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Top performing students</h2>
            <Link className="btn-secondary" href="/admin/reports">
              Open reports
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Achievements</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topStudents || []).map((student: any) => (
                  <tr key={student._id}>
                    <td>{student.fullName}</td>
                    <td>{student.studentId}</td>
                    <td>{student.department}</td>
                    <td>{student.cgpa ?? "-"}</td>
                    <td>{student.achievementsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Category-wise achievements</h2>
          <div className="mt-4 space-y-3">
            {(data?.categoryData || []).map((item: any) => (
              <div key={item._id} className="flex items-center justify-between rounded-2xl bg-sky/40 px-4 py-3 text-sm">
                <span className="capitalize">{item._id}</span>
                <span className="font-semibold">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
