"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Award, 
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  BarChart3,
  Crown,
  Search,
  FileText,
  Calendar,
  Layers,
  GraduationCap,
  Info,
  Loader2,
  Download,
  DownloadCloud
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

const labelClasses = "block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2";
const inputClasses = "w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 text-ink text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400";
const selectClasses = "w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-ink text-xs font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none uppercase tracking-widest";

function formatCategoryLabel(category?: string) {
  return (category || "Uncategorized")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatShortDate(value?: string) {
  if (!value) return "Recently added";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FacultyDashboard() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  
  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "achievements" | "documents">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Inspector State
  const [inspectorStudentId, setInspectorStudentId] = useState("");
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [reviewRemarks, setReviewRemarks] = useState("");

  // Queries
  const { data: profile } = useQuery({
    queryKey: ["faculty-profile"],
    queryFn: () => api<any>("/faculty/profile", { token }),
    enabled: !!token,
  });

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["faculty-students"],
    queryFn: () => api<any[]>("/faculty/students", { token }),
    enabled: !!token,
  });

  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ["faculty-achievements", statusFilter, categoryFilter, searchQuery],
    queryFn: () => {
       const params = new URLSearchParams();
       if (statusFilter !== "all") params.append("status", statusFilter);
       if (categoryFilter !== "all") params.append("category", categoryFilter);
       if (searchQuery) params.append("search", searchQuery);
       return api<any[]>(`/faculty/achievements?${params.toString()}`, { token });
    },
    enabled: !!token,
  });

  const { data: documents, isLoading: loadingDocuments } = useQuery({
    queryKey: ["faculty-documents", typeFilter],
    queryFn: () => {
       const params = new URLSearchParams();
       if (typeFilter !== "all") params.append("type", typeFilter);
       return api<any[]>(`/faculty/documents?${params.toString()}`, { token });
    },
    enabled: !!token,
  });

  const { data: inspectorData, isLoading: loadingInspector } = useQuery({
    queryKey: ["admin-student-details", inspectorStudentId],
    queryFn: () => api<any>(`/students/${inspectorStudentId}`, { token }),
    enabled: !!token && !!inspectorStudentId && isInspectorOpen,
  });

  const reviewMutation = useMutation({
    mutationFn: (values: { id: string, status: string, remarks: string }) => 
      api(`/faculty/achievements/${values.id}/review`, { 
        method: "PUT", 
        token, 
        body: JSON.stringify({ status: values.status, remarks: values.remarks }) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["faculty-students"] });
      setReviewModalOpen(false);
      setSelectedAchievement(null);
    },
  });

  // Analytics Derivation
  const stats = useMemo(() => {
    const studentList = students || [];
    const achievementList = achievements || [];
    const documentList = documents || [];
    const categoryCounts: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};
    const documentTypeCounts: Record<string, number> = {};

    achievementList.forEach(a => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    studentList.forEach((student) => {
      const key = student.year ? `Year ${student.year}` : "Not set";
      yearCounts[key] = (yearCounts[key] || 0) + 1;
    });

    documentList.forEach((doc) => {
      const key = doc.type || "Other";
      documentTypeCounts[key] = (documentTypeCounts[key] || 0) + 1;
    });

    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    const busiestYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];
    const latestAchievements = [...achievementList]
      .sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime())
      .slice(0, 5);
    const latestDocuments = [...documentList]
      .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime())
      .slice(0, 5);
    const topStudents = [...studentList]
      .sort((a, b) => (b.achievementsCount || 0) - (a.achievementsCount || 0))
      .slice(0, 5);

    return {
      totalStudents: studentList.length,
      totalAchievements: achievementList.length,
      totalDocuments: documentList.length,
      topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
      busiestYear: busiestYear ? { name: busiestYear[0], count: busiestYear[1] } : null,
      categoryData: Object.entries(categoryCounts).map(([name, value]) => ({ name: name.toUpperCase(), value })),
      latestAchievements,
      latestDocuments,
      topStudents,
      documentTypes: Object.entries(documentTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count })),
    };
  }, [students, achievements, documents]);

  if (loadingAchievements) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="animate-spin text-brand-600" size={48} />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Building your command center...</p>
      </div>
    );
  }

  return (
    <div className="p-0 animate-fade-up">
      <div className="p-4 lg:p-6 pb-20 max-w-7xl mx-auto space-y-8">
        
        {/* ── 1. Tab Navigation ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="bg-surface-100 p-1.5 rounded-[20px] flex items-center shadow-inner w-full sm:w-auto">
              {[
                { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
                { id: "students", label: "Directory", icon: <Users size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto text-nowrap",
                    activeTab === tab.id 
                      ? "bg-white text-brand-600 shadow-md transform scale-[1.02]" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
           </div>
           
           <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-brand-50 border border-brand-100 rounded-xl flex items-center gap-2 text-brand-700">
                <Crown size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Supervisor Hub</span>
              </div>
           </div>
        </div>

        {/* ── 2. Content Sections ── */}
        
        {activeTab === "overview" && (
           <div className="space-y-10 animate-fade-up">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7 bg-white border border-surface-200 rounded-[32px] p-8 shadow-panel overflow-hidden relative">
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.12),_transparent_65%)] pointer-events-none" />
                  <div className="relative space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-100 bg-brand-50 text-brand-700 text-[10px] font-black uppercase tracking-[0.2em]">
                      <Crown size={14} />
                      Faculty Overview
                    </div>
                    <div>
                      <h2 className="font-display font-black text-3xl text-ink leading-tight">
                        Department activity at a glance for {profile?.department || user?.department || "your students"}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm text-slate-500 leading-relaxed">
                        Use this overview to jump into assigned students, inspect new achievement uploads, and keep track of the document flow without the extra filler cards.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab("students")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-md"
                      >
                        <Users size={14} />
                        Open Student Directory
                      </button>
                      <button
                        onClick={() => setActiveTab("achievements")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-surface-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest hover:border-brand-200 hover:text-brand-600 transition-all"
                      >
                        <Award size={14} />
                        Open Achievement Desk
                      </button>
                      <button
                        onClick={() => setActiveTab("documents")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-surface-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest hover:border-brand-200 hover:text-brand-600 transition-all"
                      >
                        <FileText size={14} />
                        Open Documents
                      </button>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                      <Users className="text-brand-300" size={22} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Assigned Students</p>
                    <p className="text-4xl font-display font-black leading-none">{stats?.totalStudents ?? 0}</p>
                    <p className="mt-3 text-xs text-slate-400">Students currently mapped to your faculty dashboard.</p>
                  </div>

                  <div className="bg-white border border-surface-200 rounded-[32px] p-6 shadow-panel">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                      <Award size={22} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Achievement Uploads</p>
                    <p className="text-4xl font-display font-black text-ink leading-none">{stats?.totalAchievements ?? 0}</p>
                    <p className="mt-3 text-xs text-slate-500">Current achievement entries available in your supervision scope.</p>
                  </div>

                  <div className="bg-white border border-surface-200 rounded-[32px] p-6 shadow-panel">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                      <FileText size={22} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Document Records</p>
                    <p className="text-4xl font-display font-black text-ink leading-none">{stats?.totalDocuments ?? 0}</p>
                    <p className="mt-3 text-xs text-slate-500">Supporting files and student documents available to inspect.</p>
                  </div>

                  <div className="bg-white border border-surface-200 rounded-[32px] p-6 shadow-panel">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                      <Layers size={22} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Most Active Category</p>
                    <p className="text-xl font-display font-black text-ink leading-tight">
                      {stats?.topCategory ? formatCategoryLabel(stats.topCategory.name) : "No data yet"}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                      {stats?.topCategory ? `${stats.topCategory.count} achievement uploads in this category.` : "Once achievements are uploaded, the dominant category will appear here."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white border border-surface-200 rounded-[32px] p-8 shadow-panel lg:col-span-2">
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="font-display font-bold text-lg text-ink">Achievement Categories</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Distribution of uploads across the categories already used in this project.</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-black uppercase tracking-widest">
                      <BarChart3 size={14} />
                      Live breakdown
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.categoryData} margin={{ top: 10, right: 8, left: -12, bottom: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          minTickGap={0}
                          tick={{ fill: "#64748B", fontSize: 9, fontWeight: 700 }}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 10 }} />
                        <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ borderRadius: "16px", border: "none" }} />
                        <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-surface-200 rounded-[32px] p-8 shadow-panel">
                  <h3 className="font-display font-bold text-lg text-ink mb-6">Useful Snapshot</h3>
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">Busiest Student Year</p>
                      <p className="text-xl font-display font-black text-ink">
                        {stats?.busiestYear?.name || "No year data"}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {stats?.busiestYear ? `${stats.busiestYear.count} students in this academic year.` : "This will update automatically once student year data is available."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Top Document Types</p>
                      <div className="space-y-3">
                        {stats?.documentTypes?.length ? stats.documentTypes.map((item: any) => (
                          <div key={item.name} className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-ink truncate">{item.name}</span>
                            <span className="px-2.5 py-1 rounded-full bg-white border border-surface-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              {item.count}
                            </span>
                          </div>
                        )) : (
                          <p className="text-sm text-slate-400">No documents uploaded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="bg-white border border-surface-200 rounded-[32px] p-8 shadow-panel">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="font-display font-bold text-lg text-ink">Top Active Students</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Students with the most achievement records in your group.</p>
                    </div>
                    <Users className="text-slate-300" size={20} />
                  </div>
                  <div className="space-y-3">
                    {stats?.topStudents?.length ? stats.topStudents.map((student: any) => (
                      <button
                        key={student.id}
                        onClick={() => { setInspectorStudentId(student.id); setIsInspectorOpen(true); }}
                        className="w-full text-left rounded-2xl border border-surface-100 bg-surface-50 px-4 py-3 hover:border-brand-200 hover:bg-brand-50/40 transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink truncate">{student.fullName}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{student.studentId}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-display font-black text-brand-600">{student.achievementsCount || 0}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Achievements</p>
                          </div>
                        </div>
                      </button>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-surface-200 px-4 py-8 text-center text-sm text-slate-400">
                        No student activity found yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-surface-200 rounded-[32px] p-8 shadow-panel">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="font-display font-bold text-lg text-ink">Latest Achievement Uploads</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Most recent student submissions in your dashboard.</p>
                    </div>
                    <Award className="text-slate-300" size={20} />
                  </div>
                  <div className="space-y-3">
                    {stats?.latestAchievements?.length ? stats.latestAchievements.map((item: any) => (
                      <div key={item.id} className="rounded-2xl border border-surface-100 bg-surface-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink truncate">{item.title}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                              {item.student?.fullName || "Student"} • {formatCategoryLabel(item.category)}
                            </p>
                          </div>
                          {item.certificateUrl ? (
                            <button
                              onClick={() => window.open(item.certificateUrl, "_blank")}
                              className="w-8 h-8 shrink-0 rounded-xl bg-white border border-surface-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center"
                            >
                              <ExternalLink size={14} />
                            </button>
                          ) : null}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <Calendar size={12} />
                          {formatShortDate(item.date || item.createdAt)}
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-surface-200 px-4 py-8 text-center text-sm text-slate-400">
                        No achievements uploaded yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-surface-200 rounded-[32px] p-8 shadow-panel">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="font-display font-bold text-lg text-ink">Latest Documents</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Quick access to the newest student file uploads.</p>
                    </div>
                    <FileText className="text-slate-300" size={20} />
                  </div>
                  <div className="space-y-3">
                    {stats?.latestDocuments?.length ? stats.latestDocuments.map((item: any) => (
                      <div key={item.id} className="rounded-2xl border border-surface-100 bg-surface-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink truncate">{item.title}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                              {item.student?.fullName || "Student"} • {item.type || "Document"}
                            </p>
                          </div>
                          <button
                            onClick={() => window.open(item.fileUrl, "_blank")}
                            className="w-8 h-8 shrink-0 rounded-xl bg-white border border-surface-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <Calendar size={12} />
                          {formatShortDate(item.createdAt || item.updatedAt)}
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-surface-200 px-4 py-8 text-center text-sm text-slate-400">
                        No documents uploaded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
           </div>
        )}

        {activeTab === "students" && (
           <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-surface-200 shadow-sm">
                 <div>
                    <h2 className="font-display font-bold text-xl text-ink">Student Directory</h2>
                    <p className="text-xs text-slate-400 font-medium">Manage students assigned to your supervision.</p>
                 </div>
                 <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      className={cn(inputClasses, "pl-11 py-3")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {loadingStudents ? (
                    Array(6).fill(0).map((_, i) => <div key={i} className="h-40 bg-surface-50 animate-pulse rounded-[32px]" />)
                 ) : students?.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-surface-200 text-slate-400 italic">No assigned students found.</div>
                 ) : students?.filter(s => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentId.includes(searchQuery)).map(s => (
                    <div 
                      key={s.id} 
                      className="bg-white border border-surface-200 rounded-[32px] p-6 shadow-sm hover:shadow-panel hover:border-brand-200 transition-all cursor-pointer group flex flex-col"
                      onClick={() => { setInspectorStudentId(s.id); setIsInspectorOpen(true); }}
                    >
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-brand-50 text-brand-600 border border-brand-100 rounded-2xl flex items-center justify-center font-display font-bold text-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                            {s.fullName[0]}
                          </div>
                          <div>
                             <h4 className="text-base font-bold text-ink leading-tight mb-0.5">{s.fullName}</h4>
                             <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{s.studentId}</p>
                          </div>
                       </div>
                       <div className="mt-auto pt-4 border-t border-surface-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Award size={14} className="text-slate-300" />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.achievementsCount || 0} Achievements</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === "achievements" && (
           <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col gap-6 bg-white p-6 rounded-[32px] border border-surface-200 shadow-sm transition-all hover:shadow-panel">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-display font-bold text-xl text-ink">Achievement Hub</h2>
                        <p className="text-xs text-slate-400 font-medium">Verify and recommend student accomplishments.</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <select className={cn(selectClasses, "w-auto sm:min-w-[160px]")} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                          <option value="all">Categories</option>
                          <option value="Social Activity">Social Activity</option>
                          <option value="Academic">Academic</option>
                          <option value="Sports">Sports</option>
                       </select>
                       <select className={cn(selectClasses, "w-auto sm:min-w-[140px]")} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                          <option value="all">Status</option>
                          <option value="pending">Pending Only</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Recommended">Recommended</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-panel">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-surface-50/50 border-b border-surface-100">
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Title & Category</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Review</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-50">
                       {loadingAchievements ? (
                          Array(3).fill(0).map((_, i) => <tr key={i} className="h-16 animate-pulse bg-surface-50/10" />)
                       ) : achievements?.length === 0 ? (
                          <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">No achievements found in this view.</td></tr>
                       ) : achievements?.map((a) => (
                          <tr key={a.id} className="hover:bg-brand-50/10 transition-all">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{a.student.fullName[0]}</div>
                                   <div>
                                      <p className="text-xs font-bold text-ink leading-tight">{a.student.fullName}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{a.student.studentId}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-xs font-bold text-ink leading-tight mb-1">{a.title}</p>
                                <span className="inline-block px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded text-[8px] font-black uppercase tracking-tight">{a.category}</span>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className={cn(
                                   "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                   !a.facultyStatus ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                                   a.facultyStatus === "Reviewed" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                   "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                )}>
                                   {a.facultyStatus || "Pending"}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => { setSelectedAchievement(a); setReviewRemarks(a.facultyRemarks || ""); setReviewModalOpen(true); }}
                                  className="w-9 h-9 flex items-center justify-center bg-surface-50 text-slate-400 hover:bg-brand-600 hover:text-white rounded-xl transition-all ml-auto"
                                >
                                   <TrendingUp size={16} />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === "documents" && (
           <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-surface-200 shadow-sm">
                 <div>
                    <h2 className="font-display font-bold text-xl text-ink">Document Vault</h2>
                    <p className="text-xs text-slate-400 font-medium">Browse and audit student credentials.</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <select className={cn(selectClasses, "w-auto sm:min-w-[180px]")} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                       <option value="all">Global Types</option>
                       <option value="Identity Proofs">Identity</option>
                       <option value="Academic Documents">Academic</option>
                       <option value="Skills & Certifications">Certifications</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                 {loadingDocuments ? (
                    Array(8).fill(0).map((_, i) => <div key={i} className="h-40 bg-surface-50 animate-pulse rounded-[32px]" />)
                 ) : documents?.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 font-medium italic">No student documents found.</div>
                 ) : documents?.map((d) => (
                    <div key={d.id} className="bg-white border border-surface-200 rounded-[32px] p-6 shadow-sm hover:shadow-panel hover:border-brand-200 transition-all flex flex-col group">
                        <div className="flex items-start justify-between mb-5">
                           <div className="w-11 h-11 bg-surface-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                              <FileText size={20} />
                           </div>
                           <button 
                            onClick={() => window.open(d.fileUrl, "_blank")}
                            className="w-8 h-8 flex items-center justify-center bg-brand-50 text-brand-500 hover:bg-brand-600 hover:text-white rounded-lg transition-all"
                           >
                              <DownloadCloud size={14} />
                           </button>
                        </div>
                        <h4 className="text-[13px] font-bold text-ink leading-snug mb-1 truncate">{d.title}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{d.type}</p>
                        <div className="mt-auto pt-3 border-t border-surface-50 flex items-center gap-2">
                           <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[8px] font-bold">{d.student.fullName[0]}</div>
                           <p className="text-[9px] font-bold text-slate-500 truncate lowercase">{d.student.fullName}</p>
                        </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

      </div>

      {/* ── 3. Profile Inspector Modal ── */}
      <Modal 
        open={isInspectorOpen} 
        onClose={() => { setIsInspectorOpen(false); setInspectorStudentId(""); }} 
        title="Student Achievement Profile"
      >
        <div className="py-2">
           {loadingInspector ? (
             <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
               <Loader2 size={32} className="animate-spin text-brand-500" />
               <p className="text-xs font-bold uppercase tracking-widest">Fetching Records...</p>
             </div>
           ) : !inspectorData?.student ? (
             <div className="py-20 text-center text-slate-400 italic font-medium">Record not found.</div>
           ) : (
             <div className="space-y-6">
                <div className="bg-brand-50 border border-brand-100 rounded-[32px] p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white border-2 border-brand-200 rounded-2xl flex items-center justify-center text-2xl font-bold font-display text-brand-700 shadow-sm transition-transform hover:scale-105">
                         {inspectorData.student.fullName[0]}
                      </div>
                      <div>
                         <h3 className="text-2xl font-display font-bold text-ink leading-tight">{inspectorData.student.fullName}</h3>
                         <div className="flex items-center gap-2 mt-1.5 font-bold">
                            <span className="text-[10px] text-brand-700 bg-white border border-brand-100 px-2 py-0.5 rounded-md tracking-wider uppercase">{inspectorData.student.studentId}</span>
                            <span className="text-[10px] text-slate-400 tracking-widest uppercase">{inspectorData.student.department} &bull; SEC {inspectorData.student.section}</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-2xl font-display font-bold text-brand-600 leading-none mb-1">{inspectorData.student.cgpa || "N.A"}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">CGPA</div>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {[
                     { label: "Phone", value: inspectorData.student.phone || "N/A", icon: <Info size={14} /> },
                     { label: "Year", value: `${inspectorData.student.year} Year`, icon: <Calendar size={14} /> },
                     { label: "Graduation", value: inspectorData.student.graduationYear || "N/A", icon: <GraduationCap size={14} /> },
                     { label: "Program", value: inspectorData.student.program, icon: <Layers size={14} /> },
                   ].map((spec, i) => (
                     <div key={i} className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm border-b-2 transition-all hover:-translate-y-1">
                        <div className="text-slate-300 mb-3">{spec.icon}</div>
                        <div className="text-[14px] font-bold text-ink leading-tight mb-0.5">{spec.value}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{spec.label}</div>
                     </div>
                   ))}
                </div>

                <div className="bg-surface-50 border border-surface-100 rounded-[32px] overflow-hidden">
                   <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-brand-500" />
                        <span className="text-[10px] font-black text-ink uppercase tracking-[0.2em]">Achievement Stream</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{inspectorData.achievements?.length || 0} Entries</span>
                   </div>
                   <div className="p-4 flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {inspectorData.achievements?.length === 0 ? <div className="py-10 text-center text-slate-400 text-xs italic font-medium">Void. No achievements recorded.</div> : inspectorData.achievements.map((a: any) => (
                          <div key={a.id} className="bg-white border border-surface-100 rounded-2xl p-4 flex items-center justify-between group hover:border-brand-200 transition-all shadow-sm">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shadow-inner group-hover:bg-brand-600 group-hover:text-white transition-all"><Award size={18} /></div>
                                <div><div className="text-[13px] font-bold text-ink leading-tight mb-0.5">{a.title}</div><div className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{a.category} &bull; {new Date(a.date).toLocaleDateString()}</div></div>
                             </div>
                             {a.certificateUrl && <button onClick={() => window.open(a.certificateUrl, "_blank")} className="w-9 h-9 flex items-center justify-center bg-surface-50 text-slate-400 hover:bg-brand-600 hover:text-white rounded-xl transition-all"><ExternalLink size={14} /></button>}
                          </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-900 rounded-[32px] overflow-hidden text-white shadow-2xl">
                   <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-brand-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Library Vault</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{inspectorData.documents?.length || 0} Files</span>
                   </div>
                   <div className="p-4 flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                      {inspectorData.documents?.length === 0 ? <div className="py-8 text-center text-slate-500 text-xs italic font-medium">No documentation found.</div> : inspectorData.documents.map((d: any) => (
                          <div key={d.id} className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-800 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center text-brand-400 shadow-inner"><FileText size={18} /></div>
                                <div><div className="text-[13px] font-bold text-slate-100 leading-tight mb-0.5">{d.title}</div><div className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{d.type} &bull; {(d.size/1024).toFixed(1)}KB</div></div>
                             </div>
                             <button onClick={() => window.open(d.fileUrl, "_blank")} className="w-9 h-9 flex items-center justify-center bg-slate-700 text-slate-400 group-hover:bg-brand-600 group-hover:text-white rounded-xl transition-all shadow-md"><Download size={14} /></button>
                          </div>
                      ))}
                   </div>
                </div>
             </div>
           )}
        </div>
      </Modal>

       {/* Review Modal */}
       <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Audit Context">
        <div className="py-2">
           <div className="bg-surface-50 rounded-[28px] p-6 mb-8 border border-surface-100 shadow-inner relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors" />
              <h3 className="font-display font-black text-xl text-ink mb-2 tracking-tight">{selectedAchievement?.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium max-w-[90%]">{selectedAchievement?.description || "No detailed description provided."}</p>
              <div className="flex flex-wrap items-center gap-3">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white border border-surface-200 text-[10px] font-black text-brand-700 uppercase tracking-widest shadow-sm">
                    <Award size={14} />
                    {selectedAchievement?.category}
                 </div>
                 {selectedAchievement?.certificateUrl && (
                   <button onClick={() => window.open(selectedAchievement.certificateUrl, "_blank")} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-brand-600 hover:-translate-y-0.5 transition-all">
                      <ExternalLink size={14} />
                      AUDIT PROOF
                   </button>
                 )}
              </div>
           </div>
           
           <div className="space-y-8">
              <div>
                 <label className={cn(labelClasses, "flex items-center gap-2")}><Activity size={12} className="text-brand-500"/> Auditor Remarks</label>
                 <textarea className={cn(inputClasses, "min-h-[140px] resize-none border-dashed")} placeholder="Provide specific feedback or internal notes for this verification..." value={reviewRemarks} onChange={(e) => setReviewRemarks(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                 <button className="bg-white text-blue-600 border-2 border-blue-100 font-black px-6 py-5 rounded-[24px] text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex flex-col items-center gap-2 shadow-sm" onClick={() => reviewMutation.mutate({ id: selectedAchievement.id, status: "Reviewed", remarks: reviewRemarks })} disabled={reviewMutation.isPending}>
                    <CheckCircle2 size={22} strokeWidth={2} />
                    SIGN AS REVIEWED
                 </button>
                 <button className="bg-brand-600 text-white font-black px-6 py-5 rounded-[24px] text-[10px] uppercase tracking-widest hover:bg-brand-700 hover:-translate-y-1 transition-all shadow-panel flex flex-col items-center gap-2" onClick={() => reviewMutation.mutate({ id: selectedAchievement.id, status: "Recommended", remarks: reviewRemarks })} disabled={reviewMutation.isPending}>
                    <TrendingUp size={22} strokeWidth={2} />
                    PUSH RECOMMENDATION
                 </button>
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
}
