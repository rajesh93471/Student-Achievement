"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { StudentProfile } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, MapPin, GraduationCap, BookOpen, Layers, Calendar, Award, Trash2, Edit3, Send, Info } from "lucide-react";

const romanYears: Record<number, string> = { 1: "I", 2: "II", 3: "III", 4: "IV" };

/* ─── Field groups ───────────────────────────────────────────────────────── */
const SECTIONS = [
  {
    heading: "Identity",
    icon: <User size={14} />,
    accent: "bg-amber-500",
    fields: [
      { label: "Full name",    key: "fullName",  span: "col-span-12 md:col-span-3" },
      { label: "Student ID",   key: "studentId", span: "col-span-12 md:col-span-2" },
      { label: "Email",        key: "email",     span: "col-span-12 md:col-span-4" }, // Increased horizontal space by roughly 10-15% in a 12-col grid
      { label: "Phone",        key: "phone",     span: "col-span-12 md:col-span-3" },
      { label: "Address",      key: "address",   span: "col-span-12" },
    ],
  },
  {
    heading: "Academic",
    icon: <GraduationCap size={14} />,
    accent: "bg-brand-500",
    fields: [
      { label: "Department",         key: "department",        span: "col-span-6 md:col-span-3" },
      { label: "Program",            key: "program",           span: "col-span-6 md:col-span-3" },
      { label: "Admission",          key: "admissionCategory", span: "col-span-6 md:col-span-3" },
      { label: "Year",               key: "year",              span: "col-span-6 md:col-span-1.5" },
      { label: "Semester",           key: "semester",          span: "col-span-6 md:col-span-1.5" },
      { label: "Grad Year",          key: "graduationYear",    span: "col-span-6 md:col-span-4" },
      { label: "CGPA",               key: "cgpa",              span: "col-span-6 md:col-span-4" },
      { label: "Backlogs",           key: "backlogs",          span: "col-span-6 md:col-span-4" },
      { label: "Counsellor",         key: "counsellorName",    span: "col-span-12" },
    ],
  },
];

/* ─── Single field tile ──────────────────────────────────────────────────── */
function ProfileField({
  label,
  value,
  span,
  delay,
}: {
  label: string;
  value: string | number | undefined | null;
  span?: string;
  delay: number;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-surface-100 rounded-xl p-3.5 animate-fade-up hover:border-brand-200 hover:shadow-panel transition-all group shrink-0",
        span || "col-span-12 md:col-span-3"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="font-sans text-[11px] font-black tracking-[0.15em] uppercase text-slate-400 mb-1.5 group-hover:text-brand-500 transition-colors">
        {label}
      </p>
      <p className={cn(
        "font-sans text-base font-bold tracking-tight truncate",
        value !== undefined && value !== null && value !== "" && value !== "-"
          ? "text-ink"
          : "text-slate-300"
      )}>
        {value ?? "-"}
      </p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function StudentProfilePage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<string>("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editableEmail, setEditableEmail] = useState("");
  const [editableAddress, setEditableAddress] = useState("");
  const [editablePhone, setEditablePhone] = useState(""); // Shared phone state
  const [editStatus, setEditStatus] = useState("");

  const { data } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => api<{ student: StudentProfile }>("/students/me", { token }),
    enabled: !!token && !!user?.id,
  });

  const student = data?.student;

  useEffect(() => {
    if (!student) return;
    setEditableEmail(student.email || "");
    setEditableAddress(student.address || "");
    setEditablePhone(student.phone || "");
  }, [student]);

  const contactMutation = useMutation({
    mutationFn: (message: string) =>
      api("/notifications", {
        method: "POST",
        token,
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => {
      setContactStatus("Request sent to admin.");
      setContactMessage("");
    },
    onError: () => {
      setContactStatus("Unable to send request.");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: Partial<StudentProfile>) =>
      api<{ student: StudentProfile }>("/students/me", {
        method: "PUT",
        token,
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      setEditStatus("Profile updated.");
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      setTimeout(() => {
        setIsEditOpen(false);
      }, 1500);
    },
    onError: (error) => {
      setEditStatus(error instanceof Error ? error.message : "Update failed.");
    },
  });

  return (
    <DashboardShell
      title="Student profile"
      subtitle="View and manage your academic identity and contact details."
      nav={[
        { label: "Overview",     href: "/student" },
        { label: "Profile",      href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents",    href: "/student/documents" },
      ]}
    >
      {student ? (
        <div className="flex flex-col gap-5 max-w-6xl">

          {/* ── Field sections ── */}
          {SECTIONS.map((section, si) => (
            <div
              key={section.heading}
              className="bg-white border border-surface-200 rounded-[32px] p-5 sm:p-6 shadow-sm animate-fade-up"
              style={{ animationDelay: `${si * 80}ms` }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1 h-4 rounded-full", section.accent)} />
                  <h3 className="font-sans text-[10px] font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-2">
                    {section.icon}
                    {section.heading}
                  </h3>
                </div>
                {section.heading === "Identity" ? (
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-xl text-[10px] font-semibold hover:bg-brand-600 hover:text-white transition-all shadow-sm uppercase tracking-widest"
                    onClick={() => {
                      setEditStatus("");
                      setEditableEmail(student.email || "");
                      setEditableAddress(student.address || "");
                      setEditablePhone(student.phone || "");
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit3 size={14} />
                    Edit contact
                  </button>
                ) : null}
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-12 gap-3">
                {section.fields.map((field: any, fi) => (
                  <ProfileField
                    key={field.key}
                    label={field.label}
                    value={
                      field.key === "year" 
                        ? (romanYears[(student as any)[field.key]] || (student as any)[field.key]) 
                        : field.key === "counsellorName"
                          ? (student as any).assignment?.faculty?.fullName || "Not Assigned"
                          : (student as any)[field.key]
                    }
                    span={field.span}
                    delay={si * 80 + fi * 40}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* ── Actions Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
            {/* Support */}
            <div className="bg-white border border-surface-200 rounded-[32px] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-ink leading-tight">Student profile</h2>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1">View and manage your academic identity and contact details.</p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-tight leading-relaxed mb-4">
                  Need help updating your profile or documents? Request changes from the admin office.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all shadow-md uppercase tracking-widest"
                  onClick={() => {
                    setContactStatus("");
                    setIsContactOpen(true);
                  }}
                >
                  <Send size={14} />
                  Contact Admin
                </button>
              </div>
            </div>

             {/* Info */}
            <div className="bg-brand-50 border border-brand-100 rounded-[32px] p-5 sm:p-6 shadow-sm flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-white border border-brand-200 flex items-center justify-center shrink-0 shadow-sm text-brand-600">
                 <span className="text-brand-600 font-bold text-lg">!</span>
               </div>
               <div>
                  <h3 className="font-display font-semibold text-base text-brand-900 mb-1">Academic Updates</h3>
                  <p className="text-[11px] text-brand-700 font-semibold uppercase tracking-tight leading-relaxed">
                    Personal details (Email, Address & Phone) can be managed directly. For academic status (Year & Semester) corrections or other data changes, please contact administration.
                  </p>
               </div>
            </div>
          </div>

        </div>
      ) : null}

      {/* ── MODALS ── */}
      <Modal open={isContactOpen} onClose={() => setIsContactOpen(false)} title="Contact admin">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setContactStatus("");
            const payload = contactMessage.trim();
            if (payload.length < 10) {
              setContactStatus("Please explain clearly (min 10 chars).");
              return;
            }
            contactMutation.mutate(payload);
          }}
        >
          <textarea
            className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-ink font-sans focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
            rows={4}
            placeholder="Describe the changes required..."
            value={contactMessage}
            onChange={(event) => setContactMessage(event.target.value)}
            required
          />
          {contactStatus && (
            <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-[10px] font-bold text-brand-700 uppercase tracking-widest">
              {contactStatus}
            </div>
          )}
          <div className="flex gap-3">
            <button className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-md" type="submit" disabled={contactMutation.isPending}>
              {contactMutation.isPending ? "SENDING..." : "SEND REQUEST"}
            </button>
            <button className="flex-1 bg-white border border-surface-200 text-slate-500 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-surface-50 transition-all" type="button" onClick={() => setIsContactOpen(false)}>
              CLOSE
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Contact Info">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setEditStatus("");
            updateProfileMutation.mutate({
              email: editableEmail.trim(),
              address: editableAddress.trim(),
              phone: editablePhone.trim(),
            });
          }}
        >
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email address</label>
            <input
              className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-ink font-sans focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
              type="email"
              value={editableEmail}
              onChange={(event) => setEditableEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
            <input
              className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-ink font-sans focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
              type="tel"
              value={editablePhone}
              onChange={(event) => setEditablePhone(event.target.value)}
              placeholder="e.g. 9876543210"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mailing Address</label>
            <textarea
              className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-ink font-sans focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
              rows={3}
              value={editableAddress}
              onChange={(event) => setEditableAddress(event.target.value)}
              placeholder="Enter your current address"
            />
          </div>
          {editStatus && (
            <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-[10px] font-bold text-brand-700 uppercase tracking-widest">
              {editStatus}
            </div>
          )}
          <div className="flex gap-3">
            <button className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-md" type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
            </button>
            <button className="flex-1 bg-white border border-surface-200 text-slate-500 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-surface-50 transition-all" type="button" onClick={() => setIsEditOpen(false)}>
              CANCEL
            </button>
          </div>
        </form>
      </Modal>

    </DashboardShell>
  );
}
