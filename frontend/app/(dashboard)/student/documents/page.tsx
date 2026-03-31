"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { uploadStudentFile } from "@/lib/uploads";

/* ─── Document type → accent color ──────────────────────────────────────── */
const TYPE_COLORS: Record<string, string> = {
  marksheet:          "#f59e0b",
  aadhaar:            "#3b82f6",
  pan:                "#10b981",
  "voter-id":         "#8b5cf6",
  "apaar-abc-id":     "#06b6d4",
  certificate:        "#f43f5e",
  "internship-letter":"#fb923c",
  publication:        "#34d399",
  award:              "#e879f9",
  other:              "#666",
};

const DOC_TYPES = [
  "marksheet","aadhaar","pan","voter-id","apaar-abc-id",
  "certificate","internship-letter","publication","award","other",
];

/* ─── File type icon ─────────────────────────────────────────────────────── */
function FileIcon({ mime }: { mime?: string }) {
  const isPdf = mime?.includes("pdf");
  return (
    <div style={{
      width: 38, height: 44,
      borderRadius: 6,
      background: isPdf ? "rgba(244,63,94,0.12)" : "rgba(245,158,11,0.12)",
      border: `1px solid ${isPdf ? "rgba(244,63,94,0.25)" : "rgba(245,158,11,0.25)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      fontSize: 11,
      fontFamily: "'Inter', sans-serif",
      color: isPdf ? "#f43f5e" : "#f59e0b",
      letterSpacing: "0.03em",
      fontWeight: 500,
    }}>
      {isPdf ? "PDF" : "IMG"}
    </div>
  );
}

export default function StudentDocumentsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const { data } = useQuery({
    queryKey: ["documents"],
    queryFn: () => api<{ documents: any[] }>("/documents", { token }),
    enabled: !!token,
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');

        .doc-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          animation: fadeUp 0.4s ease both;
          box-shadow: 0 18px 40px rgba(15,23,42,0.08);
        }

        .doc-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          transition: border-color 0.2s, background 0.2s;
          animation: fadeUp 0.35s ease both;
        }
        .doc-item:hover {
          border-color: #cbd5e1;
          background: #ffffff;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .doc-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 14px;
          color: #0f172a;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.18s;
          box-sizing: border-box;
          appearance: none;
        }
        .doc-input:focus {
          border-color: #2563eb;
        }
        .doc-input::placeholder { color: #94a3b8; }

        .drop-zone {
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          padding: 22px 16px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: #f8fafc;
          position: relative;
        }
        .drop-zone.dragging {
          border-color: #2563eb;
          background: rgba(37,99,235,0.08);
        }
        .drop-zone input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .btn-gold {
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 11px 24px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.02em;
          width: 100%;
          transition: background 0.18s, transform 0.15s;
        }
        .btn-gold:hover { background: #1d4ed8; transform: translateY(-1px); }

        .btn-ghost {
          background: #ffffff;
          color: #64748b;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          padding: 7px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: border-color 0.18s, color 0.18s;
          white-space: nowrap;
        }
        .btn-ghost:hover { border-color: #94a3b8; color: #0f172a; }

        .btn-danger {
          background: #ffffff;
          color: #f43f5e;
          border: 1px solid rgba(244,63,94,0.2);
          border-radius: 7px;
          padding: 7px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s;
          white-space: nowrap;
        }
        .btn-danger:hover {
          background: rgba(244,63,94,0.07);
          border-color: rgba(244,63,94,0.45);
        }

        .form-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 8px;
        }

        .section-title {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          color: #0f172a;
          font-weight: 600;
          margin: 0 0 6px;
        }

        .section-sub {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #64748b;
          margin: 0 0 24px;
          letter-spacing: 0.02em;
        }

        .divider { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }

        .msg-ok  { color: #10b981; }
        .msg-err { color: #f43f5e; }
        .msg-inf { color: #64748b; }
      `}</style>

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
        <div style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          alignItems: "start",
        }}>

          {/* ── Upload form ── */}
          <form
            ref={formRef}
            className="doc-card"
            style={{ display: "grid", gap: 18 }}
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const file = formData.get("file") as File;
              if (!file || !token) {
                setMessage("! Please choose a file to upload.");
                return;
              }
              setMessage("Uploading...");
              const uploaded = await uploadStudentFile({
                file,
                token,
                apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
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
            }}
          >
            {/* Accent line */}
            <div style={{ height: 3, width: 40, borderRadius: 99, background: "#f59e0b" }} />

            <div>
              <h3 className="section-title">Register document</h3>
              <p className="section-sub">Upload academic or identity records securely.</p>
            </div>

            <div>
              <label className="form-label" htmlFor="doc-title">Document title</label>
              <input
                className="doc-input"
                id="doc-title"
                name="title"
                placeholder="e.g. Semester 5 Marksheet"
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="doc-type">Document type</label>
              <select className="doc-input" id="doc-type" name="type" defaultValue="marksheet">
                {DOC_TYPES.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Drop zone */}
            <div>
              <label className="form-label">File</label>
              <div
                className={`drop-zone${isDragging ? " dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={() => setIsDragging(false)}
              >
                <input
                  id="document-file"
                  name="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  required
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setSelectedFileName(file ? file.name : "");
                  }}
                />
                <div style={{ pointerEvents: "none" }}>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 16,
                    color: isDragging ? "#f59e0b" : "#444",
                    margin: "0 0 6px",
                    transition: "color 0.2s",
                  }}>
                    {isDragging ? "Drop it here" : "Drag & drop or click to browse"}
                  </p>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: "#444",
                    margin: 0,
                    letterSpacing: "0.04em",
                  }}>
                    PDF - JPG - PNG - max 5 MB
                  </p>
                </div>
              </div>
              {selectedFileName ? (
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#1e3a8a",
                  margin: "8px 0 0",
                  letterSpacing: "0.02em",
                }}>
                  Selected file: {selectedFileName}
                </p>
              ) : null}
            </div>

            {message && (
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                margin: 0,
              }} className={
                message.startsWith("Document uploaded") ? "msg-ok" :
                message.startsWith("!") ? "msg-err" : "msg-inf"
              }>
                {message}
              </p>
            )}

            <button className="btn-gold" type="submit">
              Upload document
            </button>
          </form>

          {/* ── Documents list ── */}
          <div className="doc-card">
            <div style={{ height: 3, width: 40, borderRadius: 99, background: "#3b82f6", marginBottom: 20 }} />
            <h2 className="section-title">Stored documents</h2>
            <p className="section-sub">{documents.length} record{documents.length !== 1 ? "s" : ""} on file</p>

            <div style={{ display: "grid", gap: 10 }}>
              {documents.map((item, idx) => {
                const accent = TYPE_COLORS[item.type] ?? "#666";
                return (
                  <div
                    key={item._id}
                    className="doc-item"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Left: icon + info */}
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                      <FileIcon mime={item.mimeType} />
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 16,
                          color: "#e8e2d9",
                          fontWeight: 400,
                          margin: "0 0 4px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {item.title}
                        </h3>
                        <span style={{
                          display: "inline-block",
                          background: `${accent}15`,
                          color: accent,
                          border: `1px solid ${accent}35`,
                          borderRadius: 4,
                          padding: "1px 8px",
                          fontSize: 11,
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "0.07em",
                          textTransform: "capitalize",
                          marginBottom: 4,
                        }}>
                          {item.type}
                        </span>
                        <p style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          color: "#555",
                          margin: 0,
                        }}>
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
                      <button
                        className="btn-ghost"
                        type="button"
                        onClick={() => downloadMutation.mutate(item._id)}
                      >
                        View
                      </button>
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={() => deleteMutation.mutate(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {documents.length === 0 && (
                <div style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  border: "1px dashed #1e1e1e",
                  borderRadius: 10,
                }}>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 17,
                    color: "#333",
                    margin: "0 0 6px",
                  }}>No documents yet</p>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: "#444",
                    margin: 0,
                  }}>Upload your first document using the form.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </DashboardShell>
    </>
  );
}
