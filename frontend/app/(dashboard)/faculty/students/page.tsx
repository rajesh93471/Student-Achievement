"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { Users, Search, Loader2 } from "lucide-react";
import { useState } from "react";

export default function FacultyStudentsPage() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students, isLoading } = useQuery({
    queryKey: ["faculty-students-list"],
    queryFn: () => api<any[]>("/faculty/students", { token }),
    enabled: !!token,
  });

  const filteredStudents = (students || []).filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-surface-200 rounded-[32px] p-6 shadow-panel animate-fade-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <Users size={24} />
             </div>
             <div>
               <h2 className="font-display font-bold text-ink text-lg leading-tight">Assigned Students</h2>
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Manage and monitor your specific mentees</p>
             </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or ID..."
              className="w-full bg-surface-50 border border-surface-200 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-surface-200 rounded-3xl overflow-hidden shadow-panel animate-fade-up" style={{ animationDelay: "100ms" }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-brand-600" size={32} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-24">
             <Search size={64} className="mx-auto mb-4 text-slate-200" />
             <h3 className="font-display font-semibold text-2xl text-ink">No students found</h3>
             <p className="text-sm text-slate-500">No students match your search or you have no students assigned yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50/50">
                <th className="px-6 py-4 font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-100">Reg No</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-100">Student Name</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-surface-100">Stats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="group hover:bg-brand-50/10 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-brand-600">{s.studentId}</td>
                  <td className="px-6 py-4">
                    <div className="font-display font-semibold text-ink text-sm">{s.fullName}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.department} &bull; SEC {s.section || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="flex flex-col items-center">
                         <span className="text-sm font-bold text-ink">{s.achievementsCount || 0}</span>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Achievements</span>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
