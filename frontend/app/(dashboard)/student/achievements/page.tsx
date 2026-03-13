"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AchievementForm } from "@/components/forms/achievement-form";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function StudentAchievementsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "hackathon",
    date: "",
    academicYear: "",
    semester: "",
    activityType: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => api<{ achievements: any[] }>("/achievements", { token }),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => api("/achievements", { method: "POST", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/achievements/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      api(`/achievements/${id}`, { method: "PUT", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  return (
    <DashboardShell
      title="Student dashboard"
      subtitle="Submit achievements for administrative review."
      nav={[
        { label: "Overview", href: "/student" },
        { label: "Profile", href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents", href: "/student/documents" },
      ]}
    >
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-lg font-semibold">Achievements</h2>
          <p className="text-sm text-slate">Track and manage verified achievements.</p>
        </div>
        <button className="btn-primary" type="button" onClick={() => setIsModalOpen(true)}>
          Add achievement
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(data?.achievements || []).map((item) => (
          <div key={item._id} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate">{item.description}</p>
              </div>
              <span className="badge">{item.category}</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate md:grid-cols-2">
              <p>
                <span className="font-semibold text-ink">Date:</span> {formatDate(item.date)}
              </p>
              <p>
                <span className="font-semibold text-ink">Status:</span> {item.status}
              </p>
              <p>
                <span className="font-semibold text-ink">Academic year:</span> {item.academicYear || "-"}
              </p>
              <p>
                <span className="font-semibold text-ink">Semester:</span> {item.semester || "-"}
              </p>
              <p className="md:col-span-2">
                <span className="font-semibold text-ink">Activity type:</span> {item.activityType || "-"}
              </p>
            </div>
            {item.certificateUrl ? (
              <div className="mt-4">
                <a className="btn-secondary" href={item.certificateUrl} target="_blank" rel="noreferrer">
                  Preview certificate
                </a>
              </div>
            ) : null}
            {editingId === item._id ? (
              <form
                className="mt-5 grid gap-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const payload = {
                    ...editForm,
                    semester: editForm.semester ? Number(editForm.semester) : undefined,
                  };
                  await updateMutation.mutateAsync({ id: item._id, values: payload });
                }}
              >
                <input
                  className="input"
                  value={editForm.title}
                  placeholder="e.g. National Hackathon Finalist"
                  onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                />
                <textarea
                  className="input min-h-24"
                  value={editForm.description}
                  placeholder="Describe the achievement in 1-2 sentences"
                  onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="input"
                    type="date"
                    value={editForm.date}
                    onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))}
                  />
                  <select
                    className="input"
                    value={editForm.category}
                    onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))}
                  >
                    {["academic", "hackathon", "competition", "olympiad", "certification", "internship", "project", "sports", "cultural", "club", "research"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    className="input"
                    placeholder="Academic year (e.g. 2024-2025)"
                    value={editForm.academicYear}
                    onChange={(event) => setEditForm((current) => ({ ...current, academicYear: event.target.value }))}
                  />
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={12}
                    placeholder="Semester (e.g. 6)"
                    value={editForm.semester}
                    onChange={(event) => setEditForm((current) => ({ ...current, semester: event.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Activity type (e.g. Workshop)"
                    value={editForm.activityType}
                    onChange={(event) => setEditForm((current) => ({ ...current, activityType: event.target.value }))}
                  />
                </div>
                <div className="flex gap-3">
                  <button className="btn-primary" type="submit">
                    Save changes
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(item._id);
                    setEditForm({
                      title: item.title,
                      description: item.description,
                      category: item.category,
                      date: item.date?.slice(0, 10) || "",
                      academicYear: item.academicYear || "",
                      semester: item.semester ? String(item.semester) : "",
                      activityType: item.activityType || "",
                    });
                  }}
                  type="button"
                >
                  Edit
                </button>
                <button className="btn-secondary" onClick={() => deleteMutation.mutate(item._id)} type="button">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add achievement">
        <AchievementForm
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
            setIsModalOpen(false);
          }}
          token={token}
        />
      </Modal>
    </DashboardShell>
  );
}
