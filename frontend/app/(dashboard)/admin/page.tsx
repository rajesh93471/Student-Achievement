"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DepartmentBarChart, GrowthLineChart } from "@/components/charts/overview-chart";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, Award, FileCheck, Filter, ChevronDown } from "lucide-react";
import { Select } from "@/components/ui/select";

const ACADEMIC_YEAR_OPTIONS = [
  { value: "Year 1", label: "I" },
  { value: "Year 2", label: "II" },
  { value: "Year 3", label: "III" },
  { value: "Year 4", label: "IV" },
];

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<any>("/admin/dashboard", { token }),
    enabled: !!token,
  });

  const { data: achievementData } = useQuery({
    queryKey: ["admin-achievements", filterCategory, filterDepartment, filterSemester, filterYear],
    queryFn: () =>
      api<{ achievements: any[] }>(
        `/achievements?category=${encodeURIComponent(filterCategory)}&department=${encodeURIComponent(filterDepartment)}&semester=${encodeURIComponent(filterSemester)}&academicYear=${encodeURIComponent(filterYear)}`,
        { token }
      ),
    enabled: !!token,
  });

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Manage students, approvals, analytics, and institutional reporting."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Student achievements", href: "/admin/student-achievements" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      {/* ── Status Banner (Replacing bulky header) ── */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-100 border border-surface-200 rounded-full text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          Live System Overview
        </div>
      </div>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
        <StatCard label="Students" value={data?.metrics.totalStudents ?? 0} helper="Total active profiles" />
        <StatCard label="Achievements" value={data?.metrics.totalAchievements ?? 0} helper="System-wide entries" />
        <StatCard label="Documents" value={data?.metrics.totalDocuments ?? 0} helper="Securely stored files" />
      </section>

      {/* CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
        <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-sm hover:border-brand-200 hover:shadow-panel transition-all">
          <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between bg-surface-50/30">
            <h3 className="font-sans text-[10px] font-semibold text-ink flex items-center gap-2 uppercase tracking-widest">
              <BarChart3 size={14} className="text-brand-500" />
              Department breakdown
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Analysis</span>
          </div>
          <div className="p-4">
            <DepartmentBarChart data={data?.departmentData || []} />
          </div>
        </div>

        <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-sm hover:border-brand-200 hover:shadow-panel transition-all">
          <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between bg-surface-50/30">
            <h3 className="font-sans text-[10px] font-semibold text-ink flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-brand-500" />
              Year-on-year growth
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Analysis</span>
          </div>
          <div className="p-4">
            <GrowthLineChart data={data?.yearlyGrowth || []} />
          </div>
        </div>
      </section>

      {/* BOTTOM — TOP STUDENTS + CATEGORIES */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
        
        {/* TOP STUDENTS */}
        <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-sm hover:border-brand-200 hover:shadow-panel transition-all">
          <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between bg-surface-50/30">
            <h3 className="font-sans text-[10px] font-semibold text-ink flex items-center gap-2 uppercase tracking-widest">
              <Users size={14} className="text-brand-500" />
              Top performing students
            </h3>
            <Link className="text-[10px] font-bold text-brand-600 hover:text-brand-700 hover:underline" href="/admin/reports">
              REPORTS →
            </Link>
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 font-sans text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-surface-50">Student</th>
                  <th className="px-3 py-2 font-sans text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-surface-50">Dept</th>
                  <th className="px-3 py-2 font-sans text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-surface-50 text-center">GPA</th>
                  <th className="px-3 py-2 font-sans text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-surface-50 text-center">Achievements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {(data?.topStudents || []).map((student: any, idx: number) => (
                  <tr key={student._id || `${student.studentId || "student"}-${idx}`} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <p className="font-display font-semibold text-ink text-sm leading-tight">{student.fullName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase">{student.studentId}</p>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-slate-500">{student.department?.slice(0, 3)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-100">
                        {student.cgpa ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                        {student.achievementsCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FILTERED ACHIEVEMENTS */}
        <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-brand-200 hover:shadow-panel transition-all">
          <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between bg-surface-50">
            <h3 className="font-sans text-[10px] font-semibold text-ink flex items-center gap-2 uppercase tracking-widest">
              <Filter size={14} className="text-brand-500" />
              Achievement Feed
            </h3>
          </div>
          
          {/* Filters Bar */}
          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white border-b border-surface-50">
            <Select
              className="bg-surface-50 border border-surface-100 rounded-lg p-1.5 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-brand-200 transition-shadow"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              <option value="">Categories</option>
              {(data?.categoryData || []).map((item: any, idx: number) => (
                <option key={item._id || `category-${idx}`} value={item._id}>{item._id}</option>
              ))}
            </Select>
            <Select
              className="bg-surface-50 border border-surface-100 rounded-lg p-1.5 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-brand-200 transition-shadow"
              value={filterDepartment}
              onChange={(event) => setFilterDepartment(event.target.value)}
            >
              <option value="">Depts</option>
              {(data?.departmentData || []).map((item: any, idx: number) => (
                <option key={item._id || `dept-${idx}`} value={item._id}>{item._id}</option>
              ))}
            </Select>
            <Select
              className="bg-surface-50 border border-surface-100 rounded-lg p-1.5 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-brand-200 transition-shadow"
              value={filterSemester}
              onChange={(event) => setFilterSemester(event.target.value)}
            >
              <option value="">Sems</option>
              {[1,2].map((sem) => (
                <option key={sem} value={String(sem)}>Sem {sem}</option>
              ))}
            </Select>
            <Select
              className="bg-surface-50 border border-surface-100 rounded-lg p-1.5 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-brand-200 transition-shadow"
              value={filterYear}
              onChange={(event) => setFilterYear(event.target.value)}
            >
              <option value="">Years</option>
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year.value} value={year.value}>{year.label}</option>
              ))}
            </Select>
          </div>

          <div className="p-3 flex-1 flex flex-col gap-2">
            {(achievementData?.achievements || []).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-[13px] font-medium border border-dashed border-surface-100 rounded-2xl bg-surface-50/30">
                No entries match.
              </div>
            ) : (
              achievementData?.achievements?.slice(0, 5).map((item: any, idx: number) => (
                <div key={item._id || `${item.title || "ach"}-${idx}`} className="bg-surface-50 border border-surface-50 rounded-2xl p-3 flex flex-col gap-2 group transition-all hover:bg-white hover:border-brand-100 hover:shadow-panel">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-display font-semibold text-ink text-[13px] line-clamp-1 group-hover:text-brand-700 transition-colors tracking-tight">{item.title}</h4>
                    <span className="shrink-0 text-[10px] font-bold text-slate-400 uppercase">{item.category?.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 items-center">
                       <div className="w-6 h-6 bg-brand-100 text-brand-600 border border-brand-200 rounded-md flex items-center justify-center font-display font-bold text-[10px]">{item.student?.fullName?.[0]}</div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate max-w-[120px]">
                         {item.student?.fullName}
                       </p>
                    </div>
                    <button
                      className="px-2 py-1 bg-white border border-surface-200 rounded-lg text-[9px] font-bold text-brand-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-sm"
                      disabled={!item.certificateUrl}
                      onClick={() => {
                        if (item.certificateUrl) window.open(item.certificateUrl, "_blank");
                      }}
                    >
                      VIEW
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className="mt-auto pt-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>{achievementData?.achievements?.length ?? 0} matches</span>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
