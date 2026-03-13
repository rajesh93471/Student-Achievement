"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminApprovalsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({});
  const { data } = useQuery({
    queryKey: ["admin-approvals"],
    queryFn: () => api<{ achievements: any[] }>("/achievements?status=pending", { token }),
    enabled: !!token,
  });

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
      await queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Approve, reject, and comment on student achievements."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Approvals", href: "/admin/approvals" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      <div className="card p-6">
        <h2 className="text-lg font-semibold">Pending achievement approvals</h2>
        <div className="mt-4 space-y-4">
          {(data?.achievements || []).map((item) => (
            <div key={item._id} className="rounded-2xl border border-slate-100 p-5 transition hover:-translate-y-0.5 hover:shadow-panel">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate">
                {item.student?.fullName} | {item.student?.studentId} | {item.student?.department}
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
                placeholder="Feedback for the student"
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
                  Approve
                </button>
                <button className="btn-secondary" type="button" onClick={() => reviewMutation.mutate({ id: item._id, status: "approved", recommendedForAward: true })}>
                  Approve + Recommend
                </button>
                <button className="btn-secondary" type="button" onClick={() => reviewMutation.mutate({ id: item._id, status: "rejected", recommendedForAward: false })}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
