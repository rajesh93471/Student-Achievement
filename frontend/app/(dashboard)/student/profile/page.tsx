"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { StudentProfile } from "@/lib/types";

export default function StudentProfilePage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => api<{ student: StudentProfile }>("/students/me", { token }),
    enabled: !!token,
  });

  return (
    <DashboardShell
      title="Student dashboard"
      subtitle="Profile details are managed by administrators."
      nav={[
        { label: "Overview", href: "/student" },
        { label: "Profile", href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents", href: "/student/documents" },
      ]}
    >
      {data?.student ? (
        <div className="card p-6">
          <h3 className="text-lg font-semibold">Profile information</h3>
          <div className="mt-4 grid gap-4 text-sm text-slate md:grid-cols-2">
            <p><span className="font-semibold text-ink">Full Name:</span> {data.student.fullName}</p>
            <p><span className="font-semibold text-ink">Student ID:</span> {data.student.studentId}</p>
            <p><span className="font-semibold text-ink">Department:</span> {data.student.department}</p>
            <p><span className="font-semibold text-ink">Program:</span> {data.student.program}</p>
            <p><span className="font-semibold text-ink">Admission category:</span> {data.student.admissionCategory || "-"}</p>
            <p><span className="font-semibold text-ink">Year:</span> {data.student.year}</p>
            <p><span className="font-semibold text-ink">Semester:</span> {data.student.semester}</p>
            <p><span className="font-semibold text-ink">Email:</span> {data.student.email}</p>
            <p><span className="font-semibold text-ink">Phone:</span> {data.student.phone || "-"}</p>
            <p><span className="font-semibold text-ink">Address:</span> {data.student.address || "-"}</p>
            <p><span className="font-semibold text-ink">CGPA:</span> {data.student.cgpa ?? "-"}</p>
            <p><span className="font-semibold text-ink">Backlogs:</span> {data.student.backlogs}</p>
          </div>
          <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            If any details are incorrect, please contact the admin office to update your profile.
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
