"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const { token } = useAuth();
  const [downloadState, setDownloadState] = useState<string>("");
  const { data } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => api<any>("/admin/reports", { token }),
    enabled: !!token,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const downloadReport = async (format: "pdf" | "excel") => {
    if (!token) {
      return;
    }

    setDownloadState(`Preparing ${format.toUpperCase()} export...`);
    const response = await fetch(`${apiUrl}/admin/reports/export?report=top-achievers&format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `top-achievers.${format === "pdf" ? "pdf" : "xlsx"}`;
    link.click();
    window.URL.revokeObjectURL(url);
    setDownloadState(`Downloaded ${format.toUpperCase()} report.`);
  };

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Export performance and participation reports in PDF or Excel."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Approvals", href: "/admin/approvals" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Top achievers</h2>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => downloadReport("pdf")}>
                Export PDF
              </button>
              <button className="btn-primary" onClick={() => downloadReport("excel")}>
                Export Excel
              </button>
            </div>
          </div>
          {downloadState ? <p className="mt-3 text-sm text-slate">{downloadState}</p> : null}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate">
                <tr>
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">CGPA</th>
                  <th className="pb-3">Achievements</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topAchievers || []).map((student: any) => (
                  <tr key={student._id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{student.fullName}</td>
                    <td className="py-3 pr-4">{student.department}</td>
                    <td className="py-3 pr-4">{student.cgpa}</td>
                    <td className="py-3">{student.achievementsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Report catalog</h2>
          <div className="mt-4 space-y-3 text-sm text-slate">
            <div className="rounded-2xl bg-sky/40 p-4">Department achievements for comparing participation intensity.</div>
            <div className="rounded-2xl bg-mint/40 p-4">Student participation report for competitions, hackathons, and clubs.</div>
            <div className="rounded-2xl bg-white p-4">Certification statistics segmented by approval status.</div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
