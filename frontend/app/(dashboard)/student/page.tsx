"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => api<{ student: any; achievements: any[]; documents: any[] }>("/students/me", { token }),
    enabled: !!token,
  });

  const student = data?.student;
  const achievements = data?.achievements || [];

  return (
    <DashboardShell
      title="Student dashboard"
      subtitle="Track profile strength, documents, and achievements in one place."
      nav={[
        { label: "Overview", href: "/student" },
        { label: "Profile", href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents", href: "/student/documents" },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="CGPA" value={student?.cgpa ?? "-"} helper="Latest cumulative GPA" />
        <StatCard label="Semester" value={student?.semester ?? "-"} helper="Current academic term" />
        <StatCard label="Achievements" value={student?.achievementsCount ?? 0} helper="Approved + pending entries" />
        <StatCard label="Documents" value={student?.documentsCount ?? 0} helper="Stored academic records" />
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Profile snapshot</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate sm:grid-cols-2">
            <p><span className="font-medium text-ink">Name:</span> {student?.fullName}</p>
            <p><span className="font-medium text-ink">Student ID:</span> {student?.studentId}</p>
            <p><span className="font-medium text-ink">Department:</span> {student?.department}</p>
            <p><span className="font-medium text-ink">Program:</span> {student?.program}</p>
            <p><span className="font-medium text-ink">Admission category:</span> {student?.admissionCategory || "-"}</p>
            <p><span className="font-medium text-ink">Email:</span> {student?.email}</p>
            <p><span className="font-medium text-ink">Phone:</span> {student?.phone || "-"}</p>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Resume-ready highlights</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate">
            <li>Portfolio package can be generated from verified profile data.</li>
            <li>Achievement approvals drive leaderboard and recommendation visibility.</li>
            <li>Uploaded documents support certificates, mark sheets, awards, and publications.</li>
          </ul>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Recent achievements</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td className="capitalize">{item.category}</td>
                  <td>{formatDate(item.date)}</td>
                  <td className="capitalize">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
