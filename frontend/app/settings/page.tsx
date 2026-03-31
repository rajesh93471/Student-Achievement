"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

type UserSettings = {
  emailNotifications: boolean;
  smsAlerts: boolean;
  weeklyDigest: boolean;
  profileVisibility: boolean;
};

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => api<{ settings: UserSettings }>("/users/me/settings", { token }),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: (updates: Partial<UserSettings>) =>
      api<{ settings: UserSettings }>("/users/me/settings", {
        method: "PUT",
        token,
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      setStatusMessage("Settings saved.");
      refetch();
    },
    onError: () => {
      setStatusMessage("Unable to save. Try again.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: typeof passwordForm) =>
      api<{ message: string }>("/users/me/change-password", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setPasswordMessage("Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: () => {
      setPasswordMessage("Unable to update password. Check your current password.");
    },
  });


  const settings = data?.settings;

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const toggle = (key: keyof UserSettings) => {
    if (!localSettings) return;
    const next = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(next);
    setStatusMessage("");
    mutation.mutate({ [key]: next[key] });
  };

  return (
    <DashboardShell
      title="Settings"
      subtitle="Manage account preferences and security."
      nav={[
        { label: "Dashboard", href: user?.role === "admin" ? "/admin" : user?.role === "parent" ? "/parent" : "/student" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-ink">Account preferences</h2>
            <p className="mt-2 text-sm text-slate">Adjust notifications, appearance, and privacy controls.</p>
          </div>
          {statusMessage ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate">
              {statusMessage}
            </div>
          ) : null}
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold">Email notifications</p>
                <p className="text-xs text-slate">Receive updates about approvals, uploads, and requests.</p>
              </div>
              <button className="btn-secondary" type="button" onClick={() => toggle("emailNotifications")}>
                {localSettings?.emailNotifications ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold">SMS alerts</p>
                <p className="text-xs text-slate">Send critical alerts to your registered phone number.</p>
              </div>
              <button className="btn-secondary" type="button" onClick={() => toggle("smsAlerts")}>
                {localSettings?.smsAlerts ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold">Weekly digest</p>
                <p className="text-xs text-slate">Summary of achievements, documents, and profile changes.</p>
              </div>
              <button className="btn-secondary" type="button" onClick={() => toggle("weeklyDigest")}>
                {localSettings?.weeklyDigest ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold">Profile visibility</p>
                <p className="text-xs text-slate">Allow staff to view your public achievement profile.</p>
              </div>
              <button className="btn-secondary" type="button" onClick={() => toggle("profileVisibility")}>
                {localSettings?.profileVisibility ? "Visible" : "Hidden"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-ink">Security</h3>
            <div className="space-y-3 text-sm text-slate">
              <p>Last login: Today, 10:18 AM</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="btn-primary"
                type="button"
                onClick={() => {
                  setShowPasswordForm((prev) => !prev);
                  setPasswordMessage("");
                }}
              >
                {showPasswordForm ? "Close change password" : "Change password"}
              </button>
            </div>
          </div>

          {showPasswordForm ? (
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">Change password</h3>
              <p className="text-sm text-slate">Update your password and keep your account secure.</p>
              {passwordMessage ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate">
                  {passwordMessage}
                </div>
              ) : null}
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPasswordMessage("");
                  passwordMutation.mutate(passwordForm);
                }}
              >
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink"
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink"
                  type="password"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  required
                />
                <button className="btn-primary" type="submit">
                  Save new password
                </button>
              </form>
            </div>
          ) : null}

        </div>
      </div>
    </DashboardShell>
  );
}
