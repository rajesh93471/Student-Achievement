"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["faculty-profile"],
    queryFn: () => api<any>("/faculty/profile", { token }),
    enabled: !!token,
  });

  return (
    <DashboardShell
      title={`Hi, ${user?.name || 'Faculty'}`}
      subtitle={`${profile?.department || 'Department'} Supervisor • Section ${profile?.section || 'N/A'}`}
      nav={[
        { label: "Overview", href: "/faculty" },
        { label: "Assigned Students", href: "/faculty/students" },
        { label: "Student Achievements", href: "/faculty/achievements" },
        { label: "Student Documents", href: "/faculty/documents" },
        { label: "Analytics", href: "/faculty/analytics" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
