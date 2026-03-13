"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardShell
      title="Settings"
      subtitle="Manage account preferences and security."
      nav={[
        { label: "Dashboard", href: user?.role === "admin" ? "/admin" : user?.role === "faculty" ? "/faculty" : user?.role === "parent" ? "/parent" : "/student" },
      ]}
    >
      <div className="card p-6">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="mt-2 text-sm text-slate">
          Settings are coming soon. If you need to change profile details, please contact the admin office.
        </p>
      </div>
    </DashboardShell>
  );
}
