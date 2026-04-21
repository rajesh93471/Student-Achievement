"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { cn, sortSectionsAscending } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  ExternalLink,
  ChevronDown,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  Loader2,
  Archive
} from "lucide-react";
import { Select } from "@/components/ui/select";

const ACHIEVEMENT_GROUPS = {
  technical: [
    { value: "hackathon", label: "Hackathon" },
    { value: "competition", label: "Technical Competition" },
    { value: "olympiad", label: "Olympiad" },
    { value: "certification", label: "Certification" },
    { value: "internship", label: "Internship" },
    { value: "project", label: "Project" },
    { value: "research", label: "Research" },
    { value: "academic", label: "Academic" },
    { value: "other-technical", label: "Other" },
  ],
  "non-technical": [
    { value: "sports", label: "Sports" },
    { value: "cultural", label: "Cultural" },
    { value: "club", label: "Club" },
    { value: "leadership", label: "Leadership" },
    { value: "volunteering", label: "Volunteering" },
    { value: "social-service", label: "Social Service" },
    { value: "nss", label: "NSS" },
    { value: "ncc", label: "NCC" },
    { value: "entrepreneurship", label: "Entrepreneurship" },
    { value: "arts", label: "Arts" },
    { value: "literary", label: "Literary" },
    { value: "public-speaking", label: "Public Speaking" },
    { value: "community", label: "Community Engagement" },
    { value: "other-non-technical", label: "Other" },
  ],
} as const;

type AchievementGroup = keyof typeof ACHIEVEMENT_GROUPS;

const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2";

export default function AdminStudentAchievementsPage() {
  const { token } = useAuth();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedAchievementYear, setSelectedAchievementYear] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<AchievementGroup>("technical");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [downloadState, setDownloadState] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-student-achievements"],
    queryFn: () => api<{ achievements: any[] }>("/achievements", { token }),
    enabled: !!token,
  });

  const { data: metaData } = useQuery({
    queryKey: ["admin-meta"],
    queryFn: () => api<{ graduationYears: number[]; sections: string[] }>("/admin/meta", { token }),
    enabled: !!token,
  });

  const achievements = data?.achievements || [];
  
  const yearOptions = useMemo(() => {
    if (metaData?.graduationYears) {
      return metaData.graduationYears.map(String);
    }
    // Fallback to dynamic calculation if meta hasn't loaded
    const years = achievements
      .map((item) => item.student?.graduationYear != null ? String(item.student.graduationYear) : null)
      .filter((year): year is string => Boolean(year));
    return Array.from(new Set(years)).sort((left, right) => Number(right) - Number(left));
  }, [achievements, metaData]);

  const achievementYearOptions = useMemo(() => {
    const years = achievements
      .map((item) => item.date ? String(new Date(item.date).getFullYear()) : null)
      .filter((year): year is string => Boolean(year));
    return Array.from(new Set(years)).sort((left, right) => Number(right) - Number(left));
  }, [achievements]);

  const sectionOptions = useMemo(() => {
    if (metaData?.sections) return sortSectionsAscending(metaData.sections);
    const sections = achievements
      .map((item) => item.student?.section || null)
      .filter((s): s is string => Boolean(s));
    return sortSectionsAscending(Array.from(new Set(sections)));
  }, [achievements, metaData]);

  const filteredAchievements = achievements.filter((item) => {
    const graduationYear = item.student?.graduationYear != null ? String(item.student.graduationYear) : "";
    const achievementYear = item.date ? String(new Date(item.date).getFullYear()) : "";
    const section = item.student?.section || "";
    
    return (
      (selectedYear === "all" || graduationYear === selectedYear) &&
      (selectedSection === "all" || section === selectedSection) &&
      (selectedAchievementYear === "all" || achievementYear === selectedAchievementYear) &&
      (ACHIEVEMENT_GROUPS[selectedGroup].some(o => o.value === item.category)) &&
      (selectedCategory === "all" || item.category === selectedCategory)
    );
  });

  const groupedAchievements = useMemo(() => {
    const groups = new Map<string, any>();
    filteredAchievements.forEach((item) => {
      const key = item.student?._id || item.student?.studentId || item._id;
      if (!groups.has(key)) {
        groups.set(key, {
          studentName: item.student?.fullName || "Student",
          studentId: item.student?.studentId || "-",
          department: item.student?.department || "Dept",
          section: item.student?.section || "-",
          graduationYear: item.student?.graduationYear || "-",
          items: [],
        });
      }
      groups.get(key).items.push(item);
    });
    return Array.from(groups.values());
  }, [filteredAchievements]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/achieve/api";

  const handleExport = async (format: "pdf" | "excel" | "zip") => {
    if (!token) return;
    setDownloadState(`Preparing ${format.toUpperCase()}...`);
    try {
      const params = new URLSearchParams({
        report: "student-achievements",
        format,
        year: selectedYear,
        section: selectedSection,
        achievementYear: selectedAchievementYear,
        group: selectedGroup,
        category: selectedCategory,
      });
      const response = await fetch(`${apiUrl}/admin/reports/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = format === "pdf" ? "pdf" : format === "excel" ? "xlsx" : "zip";
      link.download = `achievements-report.${extension}`;
      link.click();
      window.URL.revokeObjectURL(url);
      setDownloadState("");
    } catch (err) {
      setDownloadState("Export failed.");
    }
  };

  return (
    <DashboardShell
      title="Achievement Explorer"
      subtitle="Advanced filtering and export tools for verified student accomplishments."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Faculty Management", href: "/admin/faculty" },
        { label: "Student achievements", href: "/admin/student-achievements" },
        { label: "Student documents", href: "/admin/student-documents" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      <div className="bg-white border border-surface-200 rounded-[32px] p-6 mb-6 shadow-panel animate-fade-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className={labelClasses}>
              <GraduationCap size={14} className="inline mr-1" />
              Graduation Year
            </label>
            <Select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              <option value="all">ALL YEARS</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <div>
            <label className={labelClasses}>
              <Layers size={14} className="inline mr-1" />
              Section
            </label>
            <Select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
              <option value="all">ALL SECTIONS</option>
              {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <label className={labelClasses}>
              <Calendar size={14} className="inline mr-1" />
              Award Year
            </label>
            <Select value={selectedAchievementYear} onChange={e => setSelectedAchievementYear(e.target.value)}>
              <option value="all">ALL YEARS</option>
              {achievementYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <div>
            <label className={labelClasses}>
              <Layers size={14} className="inline mr-1" />
              Stream
            </label>
            <Select
              value={selectedGroup} 
              onChange={e => { setSelectedGroup(e.target.value as AchievementGroup); setSelectedCategory("all"); }}
            >
              <option value="technical">TECHNICAL</option>
              <option value="non-technical">NON-TECHNICAL</option>
            </Select>
          </div>
          <div>
            <label className={labelClasses}>
              <Award size={14} className="inline mr-1" />
              Category
            </label>
            <Select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="all">ALL CATEGORIES</option>
              {ACHIEVEMENT_GROUPS[selectedGroup].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-surface-100 flex flex-col sm:flex-row items-center justify-between gap-3">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
             {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />}
             Found: {groupedAchievements.length} Students &bull; {filteredAchievements.length} Achievements
             {downloadState && <span className="ml-2 text-brand-600 animate-pulse">{downloadState}</span>}
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 border border-brand-100 rounded-xl text-[10px] font-bold hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                onClick={() => handleExport("pdf")}
              >
                <FileText size={14} />
                PDF
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                onClick={() => handleExport("excel")}
              >
                <FileSpreadsheet size={14} />
                EXCEL
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-danger-100 text-danger-600 border border-danger-100 rounded-xl text-[10px] font-bold hover:bg-danger-600 hover:text-white transition-all shadow-sm"
                onClick={() => handleExport("zip")}
              >
                <Archive size={14} />
                ZIP
              </button>
           </div>
        </div>
      </div>

      {/* ── Results Table ── */}
      <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-panel animate-fade-up" style={{ animationDelay: "100ms" }}>
        {groupedAchievements.length === 0 ? (
          <div className="text-center py-24">
             <Search size={64} className="mx-auto mb-4 text-slate-200" />
             <h3 className="font-display font-semibold text-2xl text-ink">No results found</h3>
             <p className="text-sm text-slate-500">Try adjusting your filters to find matching records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/50">
                  <th className="px-6 py-4 font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-100">Identity</th>
                  <th className="px-6 py-4 font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-100">Details</th>
                  <th className="px-6 py-4 font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-100 italic">Scope</th>
                  <th className="px-6 py-4 font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-100 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {groupedAchievements.map((group, gIdx) => (
                  group.items.map((item: any, iIdx: number) => (
                    <tr key={`${group.studentId}-${iIdx}`} className="group hover:bg-brand-50/10 transition-colors">
                      {iIdx === 0 && (
                        <td className="px-6 py-4 align-top" rowSpan={group.items.length}>
                           <div className="font-display font-semibold text-ink leading-tight text-sm tracking-tight">{group.studentName}</div>
                           <div className="text-[10px] font-semibold text-brand-600 uppercase tracking-widest mt-0.5">{group.studentId}</div>
                           <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight mt-1">{group.department} &bull; SEC {group.section} &bull; {group.graduationYear}</div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="font-sans font-semibold text-ink text-sm mb-0.5 tracking-tight">{item.title}</div>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{item.description || "Verified achievement."}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className="inline-block px-1.5 py-0.5 bg-white border border-surface-100 rounded text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:border-brand-200 group-hover:text-brand-600 transition-colors">
                           {item.category?.slice(0, 10)}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button
                           disabled={!item.certificateUrl}
                           className={cn(
                             "p-2 rounded-xl transition-all shadow-sm",
                             item.certificateUrl 
                               ? "bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white border border-brand-100" 
                               : "bg-surface-50 text-slate-300 border border-surface-50 cursor-not-allowed"
                           )}
                           onClick={() => item.certificateUrl && window.open(item.certificateUrl, "_blank")}
                         >
                           <ExternalLink size={16} />
                         </button>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
