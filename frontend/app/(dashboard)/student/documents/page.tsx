"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { uploadStudentFile } from "@/lib/uploads";
import { cn } from "@/lib/utils";
import { FileText, Image as ImageIcon, Trash2, Eye, UploadCloud, FileCheck } from "lucide-react";

/* ─── Document type → accent color ──────────────────────────────────────── */
const TYPE_STYLES: Record<string, string> = {
  marksheet:          "bg-amber-50 text-amber-600 border-amber-200",
  aadhaar:            "bg-blue-50 text-blue-600 border-blue-200",
  pan:                "bg-emerald-50 text-emerald-600 border-emerald-200",
  "voter-id":         "bg-purple-50 text-purple-600 border-purple-200",
  "apaar-abc-id":     "bg-cyan-50 text-cyan-600 border-cyan-200",
  certificate:        "bg-rose-50 text-rose-600 border-rose-200",
  "internship-letter":"bg-orange-50 text-orange-600 border-orange-200",
  publication:        "bg-teal-50 text-teal-600 border-teal-200",
  award:              "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
  passport:           "bg-sky-50 text-sky-600 border-sky-200",
  resume:             "bg-violet-50 text-violet-600 border-violet-200",
  "admit-card":       "bg-pink-50 text-pink-600 border-pink-200",
  "fee-receipt":      "bg-lime-50 text-lime-600 border-lime-200",
  "bonafide-certificate": "bg-indigo-50 text-indigo-600 border-indigo-200",
  "transfer-certificate": "bg-gray-50 text-gray-600 border-gray-200",
  "community-certificate": "bg-yellow-50 text-yellow-600 border-yellow-200",
  "income-certificate": "bg-red-50 text-red-600 border-red-200",
  other:              "bg-slate-50 text-slate-600 border-slate-200",
};

const DOC_TYPES = [
  "marksheet", "aadhaar", "pan", "voter-id", "apaar-abc-id", 
  "passport", "resume", "admit-card", "fee-receipt", 
  "bonafide-certificate", "transfer-certificate", "community-certificate", "income-certificate",
  "certificate", "internship-letter", "publication", "award", "other",
];

/* ─── File type icon ─────────────────────────────────────────────────────── */
function FileIcon({ mime }: { mime?: string }) {
  const isPdf = mime?.includes("pdf");
  return (
    <div className={cn(
      "w-12 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border shadow-sm",
      isPdf ? "bg-red-50 border-red-100 text-red-600" : "bg-amber-50 border-amber-100 text-amber-600"
    )}>
      {isPdf ? <FileText size={20} /> : <ImageIcon size={20} />}
      <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">
        {isPdf ? "PDF" : "IMG"}
      </span>
    </div>
  );
}

export default function StudentDocumentsPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const { data } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: () => api<{ documents: any[] }>("/documents", { token }),
    enabled: !!token && !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) =>
      api("/documents", { method: "POST", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      setMessage("Document uploaded successfully.");
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/documents/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) =>
      api<{ downloadUrl: string; mock?: boolean }>(`/documents/${id}/download-url`, { token }),
    onSuccess: (payload) => {
      if (payload?.downloadUrl) {
        window.open(payload.downloadUrl, "_blank", "noopener,noreferrer");
      }
    },
  });

  const documents = data?.documents || [];

  return (
    <DashboardShell
      title="Student dashboard"
      subtitle="Manage mark sheets, certificates, publications, and award files."
      nav={[
        { label: "Overview",     href: "/student" },
        { label: "Profile",      href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents",    href: "/student/documents" },
      ]}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-8 items-start">

        {/* ── Upload form ── */}
        <div className="bg-white border border-surface-200 rounded-3xl p-5 sm:p-6 shadow-sm animate-fade-up">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-3.5 rounded-full bg-amber-500"></div>
            <h2 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Register document</h2>
          </div>

          <form
            ref={formRef}
            className="flex flex-col gap-6"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const file = formData.get("file") as File;
              if (!file || !token) {
                setMessage("! Please choose a file to upload.");
                return;
              }
              setMessage("Uploading...");
              try {
                const uploaded = await uploadStudentFile({
                  file,
                  token,
                  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/achieve/api",
                });
                await createMutation.mutateAsync({
                  title:    formData.get("title"),
                  type:     formData.get("type"),
                  fileUrl:  uploaded.fileUrl,
                  fileKey:  uploaded.fileKey,
                  mimeType: uploaded.mimeType,
                  size:     uploaded.size,
                });
                formRef.current?.reset();
                setSelectedFileName("");
              } catch (err: any) {
                setMessage("! " + (err.message || "Upload failed"));
              }
            }}
          >
            <div>
              <label className="block font-sans text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5" htmlFor="doc-title">Document title</label>
              <input
                className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2 text-ink font-sans text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                id="doc-title"
                name="title"
                placeholder="e.g. Semester 5 Marksheet"
                required
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5" htmlFor="doc-type">Document type</label>
              <select 
                className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2 text-ink font-sans text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat uppercase tracking-tight font-bold" 
                id="doc-type" 
                name="type" 
                defaultValue="marksheet"
              >
                {DOC_TYPES.map((opt) => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Drop zone */}
            <div>
              <label className="block font-sans text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">File upload</label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer",
                  isDragging ? "border-brand-500 bg-brand-50/50" : "border-surface-200 bg-surface-50 hover:bg-surface-100 hover:border-surface-300"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={() => setIsDragging(false)}
              >
                <input
                  id="document-file"
                  name="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setSelectedFileName(file ? file.name : "");
                  }}
                />
                <div className="flex flex-col items-center">
                  <UploadCloud size={24} className={cn("mb-2 transition-colors", isDragging ? "text-brand-600" : "text-slate-400")} />
                  <p className={cn("font-display text-sm font-bold mb-0.5 transition-colors uppercase tracking-tight", isDragging ? "text-brand-600" : "text-slate-700")}>
                    {isDragging ? "Drop your file" : "Drag & drop or Click"}
                  </p>
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    PDF &bull; JPG &bull; PNG &bull; 5MB MAX
                  </p>
                </div>
              </div>
              {selectedFileName && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-brand-50 border border-brand-100 rounded-lg">
                  <FileCheck size={16} className="text-brand-600" />
                  <span className="text-sm font-semibold text-brand-700 truncate">{selectedFileName}</span>
                </div>
              )}
            </div>

            {message && (
              <div className={cn(
                "p-3 rounded-xl border text-sm font-medium",
                message.startsWith("Document uploaded") ? "bg-emerald-50 border-emerald-100 text-emerald-700" : 
                message.startsWith("!") ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-600"
              )}>
                {message}
              </div>
            )}

            <button 
              className="w-full bg-brand-600 text-white font-bold text-[10px] py-3 px-6 rounded-xl hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg transition-all uppercase tracking-widest" 
              type="submit"
            >
              UPLOAD DOCUMENT
            </button>
          </form>
        </div>

        {/* ── Documents list ── */}
        <div className="bg-white border border-surface-200 rounded-3xl p-5 sm:p-6 shadow-sm animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 rounded-full bg-blue-500"></div>
              <h2 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400">Stored documents</h2>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-surface-50 rounded-full text-slate-400 border border-surface-100 uppercase tracking-widest">
              {documents.length} FILES
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {documents.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-3xl text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300 opacity-50" />
                <p className="font-display font-bold text-lg text-ink mb-1">No documents yet</p>
                <p className="text-sm">Upload your first document using the form.</p>
              </div>
            ) : (
              documents.map((item, idx) => {
                const styleClass = TYPE_STYLES[item.type] || "bg-slate-100 text-slate-700 border-slate-200";
                return (
                  <div
                    key={item._id}
                    className="group bg-white border border-surface-200 rounded-2xl p-4 flex items-center gap-4 hover:border-brand-300 hover:shadow-md transition-all animate-fade-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <FileIcon mime={item.mimeType} />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-base text-ink truncate group-hover:text-brand-700 transition-colors tracking-tight leading-tight">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border shadow-sm", styleClass)}>
                          {item.type?.slice(0, 15).replace(/-/g, ' ')}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                      <button
                        className="p-2 rounded-xl border border-surface-100 bg-surface-50 text-slate-500 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest shadow-sm"
                        type="button"
                        onClick={() => downloadMutation.mutate(item._id)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        className="p-2 rounded-xl border border-red-50 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest shadow-sm"
                        type="button"
                        onClick={() => deleteMutation.mutate(item._id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
