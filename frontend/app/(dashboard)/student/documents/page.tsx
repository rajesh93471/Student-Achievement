"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { uploadStudentFile } from "@/lib/uploads";

export default function StudentDocumentsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const { data } = useQuery({
    queryKey: ["documents"],
    queryFn: () => api<{ documents: any[] }>("/documents", { token }),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => api("/documents", { method: "POST", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      setMessage("Document uploaded and saved successfully.");
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/documents/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => api<{ downloadUrl: string; mock?: boolean }>(`/documents/${id}/download-url`, { token }),
    onSuccess: (payload) => {
      if (payload?.downloadUrl) {
        window.open(payload.downloadUrl, "_blank", "noopener,noreferrer");
      }
    },
  });

  return (
    <DashboardShell
      title="Student dashboard"
      subtitle="Manage mark sheets, certificates, publications, and award files."
      nav={[
        { label: "Overview", href: "/student" },
        { label: "Profile", href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents", href: "/student/documents" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form
          ref={formRef}
          className="card grid gap-4 p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const file = formData.get("file") as File;
            if (!file || !token) {
              setMessage("Please choose a file to upload.");
              return;
            }
            setMessage("Uploading document...");
            const uploaded = await uploadStudentFile({
              file,
              token,
              apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
            });
            await createMutation.mutateAsync({
              title: formData.get("title"),
              type: formData.get("type"),
              fileUrl: uploaded.fileUrl,
              fileKey: uploaded.fileKey,
              mimeType: uploaded.mimeType,
              size: uploaded.size,
            });
            formRef.current?.reset();
          }}
        >
          <h3 className="text-lg font-semibold">Register document</h3>
          <label className="text-sm font-medium text-slate">
            Document title
            <input className="input mt-2" name="title" placeholder="e.g. Semester 5 Marksheet" required />
          </label>
          <label className="text-sm font-medium text-slate">
            Document type
            <select className="input mt-2" name="type" defaultValue="marksheet">
              {[
                "marksheet",
                "aadhaar",
                "pan",
                "voter-id",
                "apaar-abc-id",
                "certificate",
                "internship-letter",
                "publication",
                "award",
                "other",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-brand-50 p-4">
            <label className="block text-sm font-medium text-ink" htmlFor="document-file">
              Upload file
            </label>
            <input className="mt-3 block w-full text-sm" id="document-file" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg" required />
            <p className="mt-2 text-xs text-slate">Supported formats: PDF, JPG, PNG. Maximum size: 5MB.</p>
          </div>
          {message ? <p className="text-sm text-slate">{message}</p> : null}
          <button className="btn-primary" type="submit">
            Upload document
          </button>
        </form>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Stored documents</h2>
          <div className="mt-4 space-y-4">
            {(data?.documents || []).map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate">{item.type}</p>
                    <p className="mt-1 text-xs text-slate">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() => downloadMutation.mutate(item._id)}
                    >
                      View file
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => deleteMutation.mutate(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
