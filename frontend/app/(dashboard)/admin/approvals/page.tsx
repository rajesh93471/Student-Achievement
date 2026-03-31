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
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
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

  const achievements = data?.achievements || [];
  const selectedList = achievements.filter((item) => selectedIds[item._id]);
  const allSelected = achievements.length > 0 && selectedList.length === achievements.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds({});
      return;
    }
    const next: Record<string, boolean> = {};
    achievements.forEach((item) => {
      next[item._id] = true;
    });
    setSelectedIds(next);
  };

  const approveSelected = async () => {
    for (const item of selectedList) {
      await reviewMutation.mutateAsync({
        id: item._id,
        status: "approved",
        recommendedForAward: false,
      });
    }
    setSelectedIds({});
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .ap-wrap {
          --ink: #0d1117;
          --slate: #57606a;
          --slate-light: #8b949e;
          --brand: #1a56db;
          --brand-light: #eef2ff;
          --green: #16a34a;
          --green-light: #dcfce7;
          --red: #b91c1c;
          --red-light: #fee2e2;
          --amber: #a16207;
          --amber-light: #fef9c3;
          --surface: #f6f8fa;
          --white: #ffffff;
          --border: #d0d7de;
          --border-light: #eaeef2;
          --radius-lg: 18px;
          --radius-xl: 24px;
          --shadow: 0 3px 12px rgba(31,35,40,0.08), 0 1px 3px rgba(31,35,40,0.04);
          --shadow-lg: 0 8px 24px rgba(31,35,40,0.10), 0 2px 6px rgba(31,35,40,0.05);
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body: 'Geist', system-ui, sans-serif;
          font-family: var(--font-body);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* PAGE HEADER */
        .ap-page-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 28px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ap-breadcrumb {
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--slate-light); margin-bottom: 8px;
          display: flex; align-items: center; gap: 5px;
        }
        .ap-page-title {
          font-family: var(--font-display);
          font-size: 30px; font-weight: 400;
          color: var(--ink); line-height: 1.1;
        }
        .ap-page-title em { font-style: italic; color: var(--brand); }
        .ap-page-sub { font-size: 14px; color: var(--slate); margin-top: 5px; }
        .ap-count-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--slate-light);
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 100px; padding: 6px 14px;
          white-space: nowrap; margin-top: 4px;
        }
        .ap-count-dot {
          width: 6px; height: 6px;
          background: var(--amber); border-radius: 50%;
        }

        /* OUTER CARD */
        .ap-outer-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .ap-outer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px 14px;
          border-bottom: 1px solid var(--border-light);
        }
        .ap-outer-title {
          font-size: 14px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }
        .ap-outer-title-dot {
          width: 7px; height: 7px;
          border-radius: 50%; background: var(--amber);
        }
        .ap-outer-tag {
          font-size: 11px; font-weight: 500;
          color: var(--amber);
          background: var(--amber-light);
          border-radius: 100px; padding: 3px 10px;
        }
        .ap-list { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

        /* ACHIEVEMENT ITEM */
        .ap-item {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .ap-item:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }

        .ap-item-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid var(--border-light);
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
        }
        .ap-item-title {
          font-size: 15px; font-weight: 600; color: var(--ink);
        }
        .ap-item-meta {
          display: flex; align-items: center; gap: 6px;
          flex-wrap: wrap; margin-top: 5px;
        }
        .ap-meta-pill {
          font-size: 11px; font-weight: 500;
          color: var(--slate);
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 100px; padding: 2px 9px;
        }
        .ap-status-pill {
          font-size: 11px; font-weight: 600;
          color: var(--amber);
          background: var(--amber-light);
          border-radius: 100px; padding: 3px 10px;
          white-space: nowrap;
        }

        .ap-item-body { padding: 16px 20px; }
        .ap-desc {
          font-size: 13px; color: var(--slate);
          line-height: 1.6; margin-bottom: 12px;
        }
        .ap-cert-link {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600;
          color: var(--brand);
          background: var(--brand-light);
          border-radius: 8px; padding: 6px 12px;
          text-decoration: none;
          transition: background 0.15s;
          margin-bottom: 14px;
        }
        .ap-cert-link:hover { background: rgba(26,86,219,0.15); }

        .ap-textarea-label {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--slate-light); margin-bottom: 6px;
          display: block;
        }
        .ap-textarea {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 13px; color: var(--ink);
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          width: 100%;
          min-height: 88px;
          resize: vertical;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          line-height: 1.6;
        }
        .ap-textarea::placeholder { color: var(--slate-light); }
        .ap-textarea:focus {
          border-color: var(--brand);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(26,86,219,0.10);
        }

        /* ACTION BUTTONS */
        .ap-actions {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: 14px 20px 18px;
          border-top: 1px solid var(--border-light);
          background: var(--surface);
        }
        .ap-bulk-actions {
          display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
        }
        .ap-select-all {
          font-size: 12px; font-weight: 600; color: var(--slate);
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 9px; padding: 6px 12px; cursor: pointer;
          transition: all 0.15s;
        }
        .ap-select-all:hover { border-color: var(--brand); color: var(--brand); }
        .ap-btn-bulk {
          font-size: 12px; font-weight: 600;
          border: none; border-radius: 9px; padding: 6px 12px;
          background: var(--green-light); color: var(--green);
          cursor: pointer; transition: all 0.15s;
        }
        .ap-btn-bulk:hover { background: #bbf7d0; }
        .ap-checkbox {
          width: 16px; height: 16px; cursor: pointer;
        }
        .ap-btn {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 13px; font-weight: 600;
          border: none; border-radius: 9px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .ap-btn-approve {
          background: var(--green-light);
          color: var(--green);
        }
        .ap-btn-approve:hover { background: #bbf7d0; }

        .ap-btn-recommend {
          background: var(--brand-light);
          color: var(--brand);
        }
        .ap-btn-recommend:hover { background: rgba(26,86,219,0.15); }

        .ap-btn-reject {
          background: var(--red-light);
          color: var(--red);
        }
        .ap-btn-reject:hover { background: #fecaca; }

        .ap-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* EMPTY STATE */
        .ap-empty {
          padding: 56px 24px;
          text-align: center;
          color: var(--slate-light);
          font-size: 14px;
        }
        .ap-empty-icon { font-size: 32px; margin-bottom: 12px; }
        .ap-empty-title { font-size: 15px; font-weight: 600; color: var(--slate); margin-bottom: 4px; }

        @media (max-width: 640px) {
          .ap-actions { flex-direction: column; }
          .ap-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="ap-wrap">
        <DashboardShell
          title="Admin dashboard"
          subtitle="Approve, reject, and comment on student achievements."
          nav={[
            { label: "Overview", href: "/admin" },
            { label: "Students", href: "/admin/students" },
            { label: "Student achievements", href: "/admin/student-achievements" },
            { label: "Approvals", href: "/admin/approvals" },
            { label: "Analytics", href: "/admin/analytics" },
            { label: "Reports", href: "/admin/reports" },
          ]}
        >
          {/* PAGE HEADER */}
          <div className="ap-page-header">
            <div>
              <div className="ap-breadcrumb">
                <span>Admin</span>
                <span>›</span>
                <span style={{ color: "var(--ink)" }}>Approvals</span>
              </div>
              <h1 className="ap-page-title">
                Pending <em>approvals</em>
              </h1>
              <p className="ap-page-sub">
                Review, approve, and comment on student achievement submissions.
              </p>
            </div>
            <div className="ap-count-badge">
              <span className="ap-count-dot" />
              {(data?.achievements || []).length} pending
            </div>
          </div>

          {/* APPROVALS LIST */}
          <div className="ap-outer-card">
            <div className="ap-outer-header">
              <span className="ap-outer-title">
                <span className="ap-outer-title-dot" />
                Achievement submissions
              </span>
              <div className="ap-bulk-actions">
                <button className="ap-select-all" type="button" onClick={toggleSelectAll}>
                  {allSelected ? "Clear selection" : "Select all"}
                </button>
                <button
                  className="ap-btn-bulk"
                  type="button"
                  disabled={selectedList.length === 0 || reviewMutation.isPending}
                  onClick={approveSelected}
                >
                  Approve selected
                </button>
                <span className="ap-outer-tag">Pending review</span>
              </div>
            </div>

            {(data?.achievements || []).length === 0 ? (
              <div className="ap-empty">
                <div className="ap-empty-icon">✓</div>
                <div className="ap-empty-title">All caught up</div>
                No pending achievements to review.
              </div>
            ) : (
              <div className="ap-list">
                {achievements.map((item) => (
                  <div key={item._id} className="ap-item">

                    {/* ITEM HEADER */}
                    <div className="ap-item-header">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <input
                            className="ap-checkbox"
                            type="checkbox"
                            checked={!!selectedIds[item._id]}
                            onChange={(event) =>
                              setSelectedIds((current) => ({
                                ...current,
                                [item._id]: event.target.checked,
                              }))
                            }
                          />
                          <span className="ap-item-title">{item.title}</span>
                        </div>
                        <div className="ap-item-meta">
                          <span className="ap-meta-pill">{item.student?.fullName}</span>
                          <span className="ap-meta-pill">{item.student?.studentId}</span>
                          <span className="ap-meta-pill">{item.student?.department}</span>
                          <span className="ap-meta-pill">{item.category}</span>
                          <span className="ap-meta-pill">{formatDate(item.date)}</span>
                        </div>
                      </div>
                      <span className="ap-status-pill">⏳ Pending</span>
                    </div>

                    {/* ITEM BODY */}
                    <div className="ap-item-body">
                      {item.description ? (
                        <p className="ap-desc">{item.description}</p>
                      ) : null}

                      {item.certificateUrl ? (
                        <a
                          className="ap-cert-link"
                          href={item.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📄 View certificate →
                        </a>
                      ) : null}

                      <label className="ap-textarea-label">Feedback for student</label>
                      <textarea
                        className="ap-textarea"
                        placeholder="Write feedback for the student (optional)"
                        value={feedbackById[item._id] || ""}
                        onChange={(event) =>
                          setFeedbackById((current) => ({
                            ...current,
                            [item._id]: event.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* ACTIONS */}
                    <div className="ap-actions">
                      <button
                        className="ap-btn ap-btn-approve"
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() => reviewMutation.mutate({ id: item._id, status: "approved", recommendedForAward: false })}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="ap-btn ap-btn-recommend"
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() => reviewMutation.mutate({ id: item._id, status: "approved", recommendedForAward: true })}
                      >
                        ★ Approve + Recommend
                      </button>
                      <button
                        className="ap-btn ap-btn-reject"
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() => reviewMutation.mutate({ id: item._id, status: "rejected", recommendedForAward: false })}
                      >
                        ✕ Reject
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </DashboardShell>
      </div>
    </>
  );
}
