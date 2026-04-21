"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { AchievementForm, AchievementFormValues } from "@/components/forms/achievement-form";
import { Modal } from "@/components/ui/modal";
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Calendar,
  Layers,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { formatDate } from "@/lib/utils";

/* ─── Category styles (consistent with dashboard) ────────────────────────── */
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

const TECHNICAL_CATEGORIES = new Set([
  "academic",
  "hackathon",
  "competition",
  "olympiad",
  "certification",
  "internship",
  "project",
  "research",
  "other-technical",
]);

function getAchievementStream(category?: string) {
  return TECHNICAL_CATEGORIES.has(category || "") ? "Technical" : "Non-technical";
}

function formatCategoryLabel(category?: string) {
  return (category || "achievement").replace(/-/g, " ");
}

export default function StudentAchievementsPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [filterYear, setFilterYear] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["student-achievements", user?.id],
    queryFn: () => api<{ achievements: any[] }>("/achievements", { token }),
    enabled: !!token && !!user?.id,
  });

  const { data: profileData } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => api<{ student: any }>("/students/me", { token }),
    enabled: !!token && !!user?.id,
  });

  const student = profileData?.student;
  const currentAcademicYear = student ? `Year ${student.year}` : undefined;
  const currentSemester = student?.semester;

  const achievements = data?.achievements || [];

  /* ─── Derived data ─────────────────────────────────────────────────────── */
  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(achievements.map((a) => new Date(a.date).getFullYear().toString())));
    return ["All", ...uniqueYears.sort()];
  }, [achievements]);

  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      const matchesYear = filterYear === "All" || new Date(a.date).getFullYear().toString() === filterYear;
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.position?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesYear && matchesSearch;
    });
  }, [achievements, filterYear, searchQuery]);

  /* ─── Mutations ────────────────────────────────────────────────────────── */
  const createMutation = useMutation({
    mutationFn: (values: AchievementFormValues) => 
      api("/achievements", {
        method: "POST",
        token,
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-achievements"] });
      setIsAddModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; values: AchievementFormValues }) => 
      api(`/achievements/${payload.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify(payload.values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-achievements"] });
      setEditingAchievement(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      api(`/achievements/${id}`, {
        method: "DELETE",
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-achievements"] });
    },
  });

  return (
    <DashboardShell
      title="Achievements List"
      subtitle="TRACK, MANAGE AND DOWNLOAD YOUR VERIFIED ACADEMIC AND TECHNICAL ACHIEVEMENTS."
      nav={[
        { label: "Overview",     href: "/student" },
        { label: "Profile",      href: "/student/profile" },
        { label: "Achievements", href: "/student/achievements" },
        { label: "Documents",    href: "/student/documents" },
      ]}
    >
      <div className="flex flex-col gap-6">
        
        {/* ── Filter Bar ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm border border-surface-200 p-4 rounded-[24px] shadow-sm animate-fade-up">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <Filter size={16} className="text-slate-400 shrink-0 mr-2" />
            {years.map((year: any) => (
              <button
                key={year}
                onClick={() => setFilterYear(year)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  filterYear === year 
                    ? "bg-brand-600 text-white border-brand-600 shadow-md" 
                    : "bg-white text-slate-500 border-surface-200 hover:border-brand-200"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus size={16} />
              Add New Achievement
            </button>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-2xl text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Achievements Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {isLoading ? (
            <div className="col-span-full py-20 text-center text-slate-400">Loading your record...</div>
          ) : filteredAchievements.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white/50 border-2 border-dashed border-surface-200 rounded-[32px]">
              <div className="text-4xl mb-4 text-slate-300">🏅</div>
              <h3 className="text-lg font-bold text-ink mb-1">No achievements match your search</h3>
              <p className="text-sm text-slate-500">Try narrowing your filters or add a new entry.</p>
            </div>
          ) : (
            filteredAchievements.map((item, idx) => {
              const bgClass = CATEGORY_STYLES[item.category] || "bg-slate-50 text-slate-500 border-slate-100";
              const streamLabel = getAchievementStream(item.category);
              
              return (
                <div 
                  key={item.id} 
                  className="group bg-white border border-surface-200 rounded-[32px] overflow-hidden hover:border-brand-400 hover:shadow-panel transition-all duration-500 flex flex-col"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-6 sm:p-8 flex-1">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm ${bgClass}`}>
                          {formatCategoryLabel(item.category)}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border border-brand-200 bg-brand-50 text-brand-700 shadow-sm">
                          {streamLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => setEditingAchievement(item)}
                            className="p-1.5 hover:bg-brand-50 text-slate-400 hover:text-brand-600 rounded-lg transition-colors"
                         >
                            <Edit3 size={15} />
                         </button>
                         <button 
                            onClick={() => { if(confirm("Delete this achievement?")) deleteMutation.mutate(item.id); }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                         >
                            <Trash2 size={15} />
                         </button>
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-bold text-ink leading-[1.2] mb-4 group-hover:text-brand-700 transition-colors line-clamp-2 uppercase">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6 italic min-h-[40px]">
                      {item.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 gap-y-4 border-t border-surface-100 pt-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Achievement Year</span>
                        <span className="text-xs font-bold text-ink">{new Date(item.date).getFullYear()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rank</span>
                        <span className="text-xs font-bold text-brand-600 uppercase">{item.position || "-"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Host</span>
                        <span className="text-xs font-bold text-ink uppercase truncate pr-2">{item.organizedBy || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-surface-50 border-t border-surface-100 flex items-center justify-between">
                     {item.certificateUrl ? (
                        <a 
                          href={item.certificateUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:text-brand-800 transition-colors"
                        >
                          <ExternalLink size={14} />
                          View Doc
                        </a>
                     ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Certificate</span>
                     )}
                     <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-tighter">{formatDate(item.date)}</span>
                     </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Record Achievement"
      >
        <div className="p-1">
          <AchievementForm 
            token={token}
            defaultAcademicYear={currentAcademicYear}
            defaultSemester={currentSemester}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
            submitLabel="Save Achievement"
          />
        </div>
      </Modal>

      <Modal 
        open={!!editingAchievement} 
        onClose={() => setEditingAchievement(null)} 
        title="Edit Achievement"
      >
        <div className="p-1">
          <AchievementForm 
            token={token}
            initialValues={editingAchievement}
            defaultAcademicYear={currentAcademicYear}
            defaultSemester={currentSemester}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync({ id: editingAchievement.id, values });
            }}
            submitLabel="Update Record"
            requireCertificate={false}
          />
        </div>
      </Modal>
    </DashboardShell>
  );
}
