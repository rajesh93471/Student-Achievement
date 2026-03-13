"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function FacultyDashboardPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({});
  const { data: studentsData } = useQuery({
    queryKey: ["faculty-students"],
    queryFn: () => api<{ students: any[] }>("/faculty/students", { token }),
    enabled: !!token,
  });
  const { data: queueData } = useQuery({
    queryKey: ["faculty-queue"],
    queryFn: () => api<{ achievements: any[] }>("/faculty/queue", { token }),
    enabled: !!token,
  });

  const students = studentsData?.students || [];
  const queue = queueData?.achievements || [];

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, recommendedForAward }: { id: string; status: "approved" | "rejected"; recommendedForAward: boolean }) =>
      api(`/achievements/${id}/review`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          status,
          feedback: feedbackById[id] || "",
          recommendedForAward,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["faculty-queue"] });
    },
  });

  return (
    <DashboardShell
      title="Faculty dashboard"
      subtitle="Review department achievements and monitor student participation."
      nav={[{ label: "Overview", href: "/faculty" }]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Department students" value={students.length} helper="Profiles in your department" />
        <StatCard label="Pending reviews" value={queue.length} helper="Achievements awaiting verification" />
        <StatCard
          label="Recommendations"
          value={queue.filter((item) => item.recommendedForAward).length}
          helper="Award-ready entries"
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Department students</h2>
          <div className="mt-4 space-y-3">
            {students.map((student) => (
              <div key={student._id} className="rounded-2xl bg-sky/40 p-4 text-sm">
                <p className="font-semibold">{student.fullName}</p>
                <p className="mt-1 text-slate">
                  {student.studentId} | {student.program}
                </p>
                <p className="mt-1 text-slate">
                  Semester {student.semester} | CGPA {student.cgpa ?? "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Verification queue</h2>
          <div className="mt-4 space-y-4">
            {queue.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-100 p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate">
                  {item.student?.fullName} | {item.student?.studentId}
                </p>
                <p className="mt-2 text-sm text-slate">{item.description}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate">
                  {item.category} | {formatDate(item.date)} | {item.status}
                </p>
                {item.certificateUrl ? (
                  <a className="mt-3 inline-flex text-sm font-medium text-coral" href={item.certificateUrl} target="_blank" rel="noreferrer">
                    View certificate
                  </a>
                ) : null}
                <textarea
                  className="input mt-4 min-h-24"
                  placeholder="Verification feedback"
                  value={feedbackById[item._id] || ""}
                  onChange={(event) =>
                    setFeedbackById((current) => ({
                      ...current,
                      [item._id]: event.target.value,
                    }))
                  }
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="btn-primary" type="button" onClick={() => reviewMutation.mutate({ id: item._id, status: "approved", recommendedForAward: false })}>
                    Verify
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => reviewMutation.mutate({ id: item._id, status: "approved", recommendedForAward: true })}>
                    Recommend
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => reviewMutation.mutate({ id: item._id, status: "rejected", recommendedForAward: false })}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
