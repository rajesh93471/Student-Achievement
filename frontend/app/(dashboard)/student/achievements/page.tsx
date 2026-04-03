"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AchievementForm } from "@/components/forms/achievement-form";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Plus, Filter, Calendar, Award, ExternalLink, Edit3, Trash2, ChevronDown } from "lucide-react";
import { Select } from "@/components/ui/select";

/* ─── Category accent map ────────────────────────────────────────────────── */
const CATEGORY_STYLES: Record<string, string> = {
  academic:      "bg-amber-100 text-amber-700 border-amber-200",
  hackathon:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  competition:   "bg-blue-100 text-blue-700 border-blue-200",
  olympiad:      "bg-purple-100 text-purple-700 border-purple-200",
  certification: "bg-rose-100 text-rose-700 border-rose-200",
  internship:    "bg-cyan-100 text-cyan-700 border-cyan-200",
  project:       "bg-lime-100 text-lime-700 border-lime-200",
  sports:        "bg-orange-100 text-orange-700 border-orange-200",
  cultural:      "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  club:          "bg-indigo-100 text-indigo-700 border-indigo-200",
  research:      "bg-teal-100 text-teal-700 border-teal-200",
};

const ORGANIZED_BY_OPTIONS = ["University", "NO / Outside Campus"];
const POSITION_OPTIONS = [
  "Winner", "Runner", "1st Runner", "2nd Runner", "1st Prize", "2nd Prize", "3rd Prize",
  "Participation", "Appreciation", "Round 1", "Round 2", "Round 3", "Finalist",
  "Semi Finalist", "Quarter Finalist", "Top 10", "Top 5", "Merit", "Special Mention",
  "Best Performer", "Consolation",
];

const CATEGORIES = [
  "academic","hackathon","competition","olympiad","certification",
  "internship","project","other-technical","sports","cultural","club","leadership",
  "volunteering","social-service","nss","ncc","entrepreneurship",
  "arts","literary","public-speaking","community","other-non-technical","research",
];

const inputClasses = "w-full bg-white border border-surface-300 rounded-xl px-4 py-3 text-ink font-sans text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

/* ─── Shared micro-component: labelled field ─────────────────────────────── */
function Field({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <span className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</span>
      <span className="text-xs font-semibold text-ink leading-tight tracking-tight uppercase">{value}</span>
    </div>
  );
}

export default function StudentAchievementsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "hackathon",
    date: "",
    academicYear: "",
    semester: "",
    activityType: "",
    organizedBy: ORGANIZED_BY_OPTIONS[0],
    position: POSITION_OPTIONS[0],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => api<{ achievements: any[] }>("/achievements", { token }),
    enabled: !!token,
  });
  const { data: profileData } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => api<{ student: any }>("/students/me", { token }),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) =>
      api("/achievements", { method: "POST", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/achievements/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      api(`/achievements/${id}`, { method: "PUT", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });

  const achievements = data?.achievements || [];
  const achievementYears = Array.from(
    new Set(
      achievements
        .map((item) => {
          if (!item.date) return "";
          const parsed = new Date(item.date);
          return Number.isNaN(parsed.getTime()) ? "" : String(parsed.getFullYear());
        })
        .filter(Boolean),
    ),
  ).sort((left, right) => Number(right) - Number(left));

  const filteredAchievements =
    selectedYear === "All"
      ? achievements
      : achievements.filter((item) => {
          if (!item.date) return false;
          const parsed = new Date(item.date);
          return !Number.isNaN(parsed.getTime()) && String(parsed.getFullYear()) === selectedYear;
        });

  const studentProfile = profileData?.student;
  const defaultAcademicYear = studentProfile?.year ? `Year ${studentProfile.year}` : undefined;
  const defaultSemester = studentProfile?.semester ?? undefined;

  return (
    <DashboardShell
      title="Achievements List"
      subtitle="Track, manage and download your verified academic and technical achievements."
      nav={[
        { label: "Overview",      href: "/student" },
        { label: "Profile",       href: "/student/profile" },
        { label: "Achievements",  href: "/student/achievements" },
        { label: "Documents",     href: "/student/documents" },
      ]}
    >
      {/* ── Toolbar (Leaner) ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2 animate-fade-up">
        <div className="flex bg-white border border-surface-200 rounded-xl p-1 w-full sm:w-auto shadow-sm">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase tracking-tight",
            selectedYear === "All" ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:text-brand-600"
          )} onClick={() => setSelectedYear("All")}>
            <Filter size={12} />
            ALL
          </div>
          {achievementYears.slice(0, 3).map(yr => (
            <div key={yr} className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase tracking-tight",
              selectedYear === yr ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:text-brand-600"
            )} onClick={() => setSelectedYear(yr)}>
              {yr}
            </div>
          ))}
          {achievementYears.length > 3 && (
            <Select 
              className="bg-transparent border-none shadow-none py-0 px-2 h-auto text-[10px] w-auto inline-flex pr-6"
              containerClassName="w-auto"
              value={achievementYears.includes(selectedYear) ? selectedYear : ""}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">MORE</option>
              {achievementYears.slice(3).map(yr => <option key={yr} value={yr}>{yr}</option>)}
            </Select>
          )}
        </div>

        <button 
          className="w-full sm:w-auto bg-brand-600 text-white font-bold text-[10px] py-2 px-4 rounded-xl hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-widest" 
          type="button" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={14} />
          ADD NEW ACHIEVEMENT
        </button>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((item, idx) => {
          const styleClass = CATEGORY_STYLES[item.category] || "bg-slate-50 text-slate-500 border-slate-100";
          const isEditing = editingId === item._id;
          const achievementYear = item.date ? new Date(item.date).getFullYear() : "";

          return (
            <div
              key={item._id}
              className="group bg-white border border-surface-200 rounded-3xl overflow-hidden hover:border-brand-200 hover:shadow-panel transition-all animate-fade-up relative"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Header */}
              <div className="px-5 py-3 border-b border-surface-50 flex flex-col gap-2 min-h-[90px] justify-center bg-surface-50/30 group-hover:bg-brand-50/20 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border shadow-sm", styleClass)}>
                    {item.category?.slice(0, 10)}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-base text-ink leading-tight line-clamp-1 group-hover:text-brand-700 transition-colors tracking-tight">
                  {item.title}
                </h3>
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4 min-h-[32px]">
                  {item.description || "Verified entry."}
                </p>

                <div className="grid grid-cols-2 gap-y-3 border-t border-surface-50 pt-4">
                   <Field label="Year" value={achievementYear} />
                   <Field label="Sem" value={item.semester} />
                   <Field label="Rank" value={item.position} />
                   <Field label="Host" value={item.organizedBy} />
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-surface-50 group/footer">
                   {item.certificateUrl ? (
                     <a 
                       href={item.certificateUrl} 
                       target="_blank" 
                       rel="noreferrer"
                       className="flex items-center gap-1.5 text-[9px] font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-widest"
                     >
                       <ExternalLink size={12} />
                       VIEW DOC
                     </a>
                   ) : <div />}

                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 rounded-lg bg-surface-50 border border-surface-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-all"
                        onClick={() => {
                          setEditingId(item._id);
                          setEditForm({
                            title:        item.title,
                            description:  item.description,
                            category:     item.category,
                            date:         item.date?.slice(0, 10) || "",
                            academicYear: item.academicYear || "",
                            semester:     item.semester ? String(item.semester) : "",
                            activityType: item.activityType || "",
                            organizedBy:  item.organizedBy || ORGANIZED_BY_OPTIONS[0],
                            position:     item.position || POSITION_OPTIONS[0],
                          });
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                        onClick={() => deleteMutation.mutate(item._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              </div>

              {/* Editing Overlay (Simplified) */}
              {isEditing && (
                <div className="absolute inset-0 bg-white z-10 p-6 flex flex-col gap-4 overflow-y-auto">
                    <h4 className="font-display font-bold text-ink">Edit Achievement</h4>
                    <input className={inputClasses} value={editForm.title} onChange={e=>setEditForm(c=>({...c, title:e.target.value}))} placeholder="Title" />
                    <textarea className={cn(inputClasses, "min-h-[100px]")} value={editForm.description} onChange={e=>setEditForm(c=>({...c, description:e.target.value}))} placeholder="Description" />
                    <div className="grid grid-cols-2 gap-3">
                       <input className={inputClasses} type="date" value={editForm.date} onChange={e=>setEditForm(c=>({...c, date:e.target.value}))} />
                       <Select value={editForm.category} onChange={e=>setEditForm(c=>({...c, category:e.target.value}))}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </Select>
                    </div>
                    <div className="flex gap-3 mt-auto">
                      <button className="flex-1 bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-brand-700 transition-colors" onClick={() => updateMutation.mutate({ id: item._id, values: editForm })}>SAVE</button>
                      <button className="flex-1 bg-surface-100 text-slate-600 font-bold py-2.5 rounded-xl text-xs hover:bg-surface-200 transition-colors" onClick={() => setEditingId(null)}>CANCEL</button>
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-surface-200 rounded-[32px] bg-white animate-fade-up">
          <Award size={64} className="mx-auto mb-4 text-slate-200" />
          <h3 className="font-display font-bold text-2xl text-ink mb-2">
            {selectedYear === "All" ? "No achievements recorded" : `Nothing found for ${selectedYear}`}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-8 max-w-sm mx-auto">
            {selectedYear === "All"
              ? "Start building your professional profile by adding your first achievement today."
              : "Try switching to another year or reset the filters to see all your accomplishments."}
          </p>
          <button 
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold text-xs py-3 px-8 rounded-2xl hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-md transition-all uppercase tracking-widest"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Add First Achievement
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add achievement">
        <AchievementForm
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
            setIsModalOpen(false);
          }}
          token={token}
          defaultAcademicYear={defaultAcademicYear}
          defaultSemester={defaultSemester}
        />
      </Modal>
    </DashboardShell>
  );
}
