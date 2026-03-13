"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ParentDashboardPage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: () => api<any>("/parents/me", { token }),
    enabled: !!token,
  });

  const student = data?.student;
  const achievements = data?.achievements || [];
  const documents = data?.documents || [];

  const downloadMutation = useMutation({
    mutationFn: (id: string) => api<{ downloadUrl: string }>(`/documents/${id}/download-url`, { token }),
    onSuccess: (payload) => {
      if (payload?.downloadUrl) {
        window.open(payload.downloadUrl, "_blank", "noopener,noreferrer");
      }
    },
  });

  return (
    <DashboardShell
      title="Parent dashboard"
      subtitle="View your connected child&apos;s academic profile, achievements, and documents."
      nav={[{ label: "Overview", href: "/parent" }]}
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Child ID" value={student?.studentId ?? "-"} helper="Connected through verified student ID" />
        <StatCard label="Department" value={student?.department ?? "-"} helper="Current academic department" />
        <StatCard label="CGPA" value={student?.cgpa ?? "-"} helper="Latest cumulative GPA" />
        <StatCard label="Achievements" value={achievements.length} helper="Recorded student achievements" />
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Student profile</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate sm:grid-cols-2">
            <p><span className="font-medium text-ink">Name:</span> {student?.fullName}</p>
            <p><span className="font-medium text-ink">Program:</span> {student?.program}</p>
            <p><span className="font-medium text-ink">Admission category:</span> {student?.admissionCategory || "-"}</p>
            <p><span className="font-medium text-ink">Year:</span> {student?.year}</p>
            <p><span className="font-medium text-ink">Semester:</span> {student?.semester}</p>
            <p><span className="font-medium text-ink">Backlogs:</span> {student?.backlogs ?? 0}</p>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Recent documents</h2>
          <div className="mt-4 space-y-3">
            {documents.map((item: any) => (
              <div key={item._id} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-slate">{item.type}</p>
                <button
                  className="mt-2 inline-flex text-sm font-medium text-coral"
                  type="button"
                  onClick={() => downloadMutation.mutate(item._id)}
                >
                  View file
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Achievement timeline</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate">
              <tr>
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((item: any) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="py-3 pr-4">{item.title}</td>
                  <td className="py-3 pr-4">{item.category}</td>
                  <td className="py-3 pr-4">{formatDate(item.date)}</td>
                  <td className="py-3">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
