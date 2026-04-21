"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  GraduationCap,
  Loader2,
  Medal,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";

export default function FacultyAnalyticsPage() {
  const { token } = useAuth();

  const { data: students, isLoading, isFetching } = useQuery({
    queryKey: ["faculty-analytics-students"],
    queryFn: () => api<any[]>("/faculty/students", { token }),
    enabled: !!token,
  });

  const assignedStudents = students || [];

  const analytics = useMemo(() => {
    const topAchievers = [...assignedStudents]
      .sort((left, right) => {
        const achievementDiff =
          (right.achievementsCount || 0) - (left.achievementsCount || 0);
        if (achievementDiff !== 0) return achievementDiff;
        return (right.cgpa || 0) - (left.cgpa || 0);
      })
      .slice(0, 10);

    const topByCgpa = [...assignedStudents]
      .sort((left, right) => (right.cgpa || 0) - (left.cgpa || 0))
      .slice(0, 5);

    const totalAchievements = assignedStudents.reduce(
      (sum, student) => sum + (student.achievementsCount || 0),
      0,
    );
    const cgpaValues = assignedStudents
      .map((student) => Number(student.cgpa))
      .filter((value) => Number.isFinite(value));
    const averageCgpa =
      cgpaValues.length > 0
        ? cgpaValues.reduce((sum, value) => sum + value, 0) / cgpaValues.length
        : 0;

    return {
      topAchievers,
      topByCgpa,
      totalAchievements,
      averageCgpa,
    };
  }, [assignedStudents]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={36} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm">
          <Sparkles size={12} />
          Assigned Student Analytics
        </div>
        {isFetching && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
            Syncing
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-up">
        <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-panel">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
            <Users size={22} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Assigned Students
          </p>
          <p className="text-4xl font-display font-black text-ink leading-none">
            {assignedStudents.length}
          </p>
        </div>

        <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-panel">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
            <Award size={22} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Total Achievements
          </p>
          <p className="text-4xl font-display font-black text-ink leading-none">
            {analytics.totalAchievements}
          </p>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 shadow-panel text-white">
          <div className="w-11 h-11 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center mb-5">
            <TrendingUp size={22} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Average CGPA
          </p>
          <p className="text-4xl font-display font-black leading-none">
            {analytics.averageCgpa.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.9fr] gap-6 animate-fade-up">
        <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-panel">
          <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Medal size={20} />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-ink leading-tight">
                  Top Achievers
                </h2>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Ranked only from your assigned students
                </p>
              </div>
            </div>
          </div>

          {analytics.topAchievers.length === 0 ? (
            <div className="text-center py-24">
              <Search size={56} className="mx-auto mb-4 text-slate-200" />
              <h3 className="font-display font-semibold text-2xl text-ink">
                No students found
              </h3>
              <p className="text-sm text-slate-500">
                Assigned students will appear here after mapping.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-surface-100">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-surface-100">
                      Student
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-surface-100 text-center">
                      CGPA
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-surface-100 text-right">
                      Achievements
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {analytics.topAchievers.map((student, index) => (
                    <tr key={student.id} className="hover:bg-brand-50/10 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-surface-50 border border-surface-100 text-xs font-black text-slate-500">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-display font-semibold text-ink text-sm leading-tight">
                          {student.fullName}
                        </div>
                        <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-0.5">
                          {student.studentId} | {student.graduationYear || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-full text-[10px] font-bold">
                          {student.cgpa ?? "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">
                          {student.achievementsCount || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-panel">
            <div className="flex items-center gap-2 mb-5">
              <GraduationCap size={16} className="text-emerald-500" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Top CGPA
              </h3>
            </div>
            <div className="space-y-3">
              {analytics.topByCgpa.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-50 border border-surface-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{student.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {student.studentId}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                    {student.cgpa ?? "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
