"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { readExcelFile } from "@/lib/excel";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  Users, 
  Search, 
  Filter, 
  Upload, 
  Save, 
  Trash2, 
  FileText, 
  Award, 
  ExternalLink,
  ChevronRight,
  Info,
  Loader2,
  ChevronDown
} from "lucide-react";
import { Select } from "@/components/ui/select";

const inputClasses = "w-full bg-white border border-surface-300 rounded-xl px-4 py-3 text-ink font-sans text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2";

export default function AdminStudentsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "manage">("manage");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [bulkMessage, setBulkMessage] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["admin-students"],
    queryFn: () => api<{ students: any[] }>("/students", { token }),
    enabled: !!token,
  });

  const { data: selectedData } = useQuery({
    queryKey: ["admin-student-details", selectedStudentId],
    queryFn: () => api<{ student: any; achievements: any[]; documents: any[] }>(`/students/${selectedStudentId}`, { token }),
    enabled: !!token && !!selectedStudentId,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => api("/admin/students", { method: "POST", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      setFormError("");
      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setActiveTab("manage");
    },
    onError: (error: any) => {
      setFormError(error?.message || "Unable to create student.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      api(`/students/${id}`, { method: "PUT", token, body: JSON.stringify(values) }),
    onSuccess: async () => {
      setSaveMessage("Student details saved successfully.");
      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/admin/students/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      setSelectedStudentId("");
      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const students = data?.students || [];
  const normalizedSearch = search.trim().toLowerCase();
  const normalizedDepartment = department.trim().toLowerCase();
  
  const filteredStudents = students.filter((student) => {
    const studentId = String(student.studentId || "").toLowerCase();
    const fullName = String(student.fullName || "").toLowerCase();
    const dept = String(student.department || "").toLowerCase();
    return (
      (!normalizedSearch || studentId.includes(normalizedSearch) || fullName.includes(normalizedSearch)) &&
      (!normalizedDepartment || dept.includes(normalizedDepartment))
    );
  });

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  return (
    <DashboardShell
      title="Student Directory"
      subtitle="Comprehensive management of student profiles, academic records, and achievement history."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Student achievements", href: "/admin/student-achievements" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      {/* ── Tabs & Search ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2 animate-fade-up">
        <div className="flex bg-white border border-surface-200 rounded-2xl p-1 shadow-sm shrink-0">
          <button
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
              activeTab === "manage" ? "bg-brand-50 text-brand-700 shadow-sm" : "text-slate-500 hover:text-brand-600"
            )}
            onClick={() => setActiveTab("manage")}
          >
            <Users size={14} />
            DIRECTORY
          </button>
          <button
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
              activeTab === "add" ? "bg-brand-50 text-brand-700 shadow-sm" : "text-slate-500 hover:text-brand-600"
            )}
            onClick={() => setActiveTab("add")}
          >
            <UserPlus size={14} />
            ENROLL
          </button>
        </div>

        {activeTab === "manage" && (
          <div className="flex flex-1 items-center gap-2 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
              <input
                className="w-full bg-white border border-surface-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100 shadow-sm tracking-tight"
                placeholder="Search Student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative group shrink-0 hidden sm:block">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={14} />
              <input
                className="bg-white border border-surface-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100 shadow-sm w-40 tracking-tight"
                placeholder="Dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {activeTab === "add" ? (
        /* ── ENROLL TAB ── */
        <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-panel animate-fade-up">
           <div className="px-6 py-4 border-b border-surface-50 bg-surface-50/30 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-ink">New Enrollment</h2>
              <label className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm uppercase tracking-widest">
                <Upload size={14} />
                UPLOAD EXCEL
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBulkMessage("Processing Excel upload...");
                    try {
                      const rows = await readExcelFile(file);
                      await api("/admin/students/bulk", { method: "POST", token, body: JSON.stringify({ rows }) });
                      setBulkMessage("Students enrolled successfully from Excel.");
                      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
                    } catch (err) {
                      setFormError("Excel upload failed. Check format.");
                    }
                  }}
                />
              </label>
           </div>
           
           <div className="p-8">
              {formError && <div className="mb-6"><Alert tone="error">{formError}</Alert></div>}
              {bulkMessage && <div className="mb-6"><Alert tone="success">{bulkMessage}</Alert></div>}
              
              <form 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  await createMutation.mutateAsync(Object.fromEntries(fd.entries()));
                }}
              >
                  {[
                    { n: "name", l: "Full Name", p: "e.g. Ananya Sharma", r: true },
                    { n: "email", l: "Email Address", p: "e.g. ananya@vignan.edu", r: true, t: "email" },
                    { n: "password", l: "Temporary Password", p: "Set a password", r: true, t: "password" },
                    { n: "studentId", l: "Reg Number", p: "e.g. 231FA04023", r: true },
                    { n: "department", l: "Department", p: "e.g. CSE", r: true },
                    { n: "program", l: "Program", p: "e.g. B.Tech", r: true },
                  ].map(f => (
                    <div key={f.n}>
                      <label className={labelClasses}>{f.l}</label>
                      <input name={f.n} className={inputClasses} placeholder={f.p} required={f.r} type={f.t || "text"} />
                    </div>
                  ))}
                  
                  <div>
                    <label className={labelClasses}>Year of Study</label>
                    <Select name="year" required>
                       {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </Select>
                  </div>
                  <div>
                    <label className={labelClasses}>Current Semester</label>
                    <Select name="semester" required>
                       <option value={1}>Semester 1</option>
                       <option value={2}>Semester 2</option>
                    </Select>
                  </div>
                  <div>
                    <label className={labelClasses}>Graduation Year</label>
                    <input name="graduationYear" className={inputClasses} type="number" placeholder="e.g. 2027" />
                  </div>

                  <div className="lg:col-span-3 pt-6 border-t border-surface-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Info size={16} />
                      <span className="text-xs font-medium italic">All credentials will be sent to the student via email.</span>
                    </div>
                    <button type="submit" className="bg-brand-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-lg active:translate-y-0">
                      COMPLETE ENROLLMENT
                    </button>
                  </div>
              </form>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 items-start">
          
          {/* List Sidebar */}
          <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col max-h-[700px]">
            <div className="p-5 border-b border-surface-50 flex items-center justify-between bg-surface-50/30">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing {filteredStudents.length} Students
               </span>
               {isFetching && <Loader2 size={14} className="text-brand-500 animate-spin" />}
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
               {filteredStudents.map(s => (
                 <button
                   key={s._id}
                   className={cn(
                     "w-full text-left p-4 rounded-2xl transition-all border group",
                     selectedStudentId === s._id 
                       ? "bg-brand-50 border-brand-200" 
                       : "bg-transparent border-transparent hover:bg-surface-50"
                   )}
                   onClick={() => setSelectedStudentId(s._id)}
                 >
                    <div className="flex items-center justify-between mb-1">
                       <span className={cn("text-xs font-semibold tracking-tight", selectedStudentId === s._id ? "text-brand-700" : "text-slate-400 group-hover:text-ink")}>{s.studentId}</span>
                       <ChevronRight size={14} className={cn("transition-transform", selectedStudentId === s._id ? "text-brand-500 translate-x-1" : "text-slate-300")} />
                    </div>
                    <div className="text-sm font-semibold text-ink leading-none">{s.fullName}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.department}</div>
                 </button>
               ))}
            </div>
          </div>

          {/* Details View */}
          <div className="flex flex-col gap-8">
            {!selectedStudentId ? (
              <div className="bg-white border-2 border-dashed border-surface-200 rounded-[32px] p-24 text-center">
                 <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-slate-300" />
                 </div>
                 <h3 className="font-display font-bold text-xl text-ink mb-2">Student Inspector</h3>
                 <p className="text-sm text-slate-500 max-w-xs mx-auto">Select a student from the directory to view academic history, achievements, and documents.</p>
              </div>
            ) : (
              <>
                {/* Profile Edit Card */}
                <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-panel animate-fade-up">
                  <div className="p-6 border-b border-surface-50 bg-gradient-to-br from-brand-50/50 to-white flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-brand-600 text-white flex items-center justify-center rounded-xl text-xl font-bold font-display shadow-lg border-2 border-white">
                          {selectedStudent?.fullName?.[0]}
                        </div>
                        <div>
                           <h2 className="font-display font-bold text-xl text-ink leading-tight">{selectedStudent?.fullName}</h2>
                           <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{selectedStudent?.studentId}</p>
                        </div>
                     </div>
                     <button
                       className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                       onClick={() => deleteMutation.mutate(selectedStudentId)}
                       title="Delete Profile"
                     >
                        <Trash2 size={24} />
                     </button>
                  </div>

                  <div className="p-6">
                    {saveMessage && <div className="mb-4"><Alert tone="success">{saveMessage}</Alert></div>}
                    <form 
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        await updateMutation.mutateAsync({ id: selectedStudentId, values: Object.fromEntries(fd.entries()) });
                      }}
                    >
                       <div><label className={labelClasses}>Full Name</label><input name="fullName" className={cn(inputClasses, "py-2 px-3")} defaultValue={selectedStudent?.fullName} /></div>
                       <div><label className={labelClasses}>Email</label><input name="email" className={cn(inputClasses, "py-2 px-3")} defaultValue={selectedStudent?.email} /></div>
                       <div><label className={labelClasses}>Dept</label><input name="department" className={cn(inputClasses, "py-2 px-3")} defaultValue={selectedStudent?.department} /></div>
                       <div><label className={labelClasses}>Program</label><input name="program" className={cn(inputClasses, "py-2 px-3")} defaultValue={selectedStudent?.program} /></div>
                       <div><label className={labelClasses}>Year</label>
                         <Select name="year" className="py-2 px-3" defaultValue={selectedStudent?.year}>
                           {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                         </Select>
                       </div>
                       <div><label className={labelClasses}>Sem</label>
                          <Select name="semester" className="py-2 px-3" defaultValue={selectedStudent?.semester}>
                            <option value={1}>Sem 1</option><option value={2}>Sem 2</option>
                          </Select>
                       </div>
                       <div><label className={labelClasses}>CGPA</label><input name="cgpa" className={cn(inputClasses, "py-2 px-3")} type="number" step="0.01" defaultValue={selectedStudent?.cgpa} /></div>
                       <div><label className={labelClasses}>Phone</label><input name="phone" className={cn(inputClasses, "py-2 px-3")} defaultValue={selectedStudent?.phone} /></div>
                       <div><label className={labelClasses}>Graduation Year</label><input name="graduationYear" className={cn(inputClasses, "py-2 px-3")} type="number" placeholder="2027" defaultValue={selectedStudent?.graduationYear} /></div>
                       
                       <div className="sm:col-span-2 lg:col-span-4 pt-4 border-t border-surface-50 flex justify-end">
                          <button type="submit" className="bg-brand-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-md flex items-center gap-2">
                             <Save size={14} />
                             UPDATE PROFILE
                          </button>
                       </div>
                    </form>
                  </div>
                </div>

                {/* History & Documents */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-surface-50 flex items-center gap-2 font-sans text-xs font-bold text-ink uppercase tracking-widest">
                         <Award size={16} className="text-brand-500" />
                         Achievement History
                      </div>
                      <div className="p-4 flex flex-col gap-3 min-h-[200px]">
                         {selectedData?.achievements?.length === 0 ? (
                           <div className="m-auto text-slate-400 text-xs font-medium italic">No entries found.</div>
                         ) : (
                           selectedData?.achievements?.map((a: any) => (
                             <div key={a._id} className="p-4 border border-surface-100 rounded-2xl bg-surface-50 shadow-sm flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-bold text-ink line-clamp-1">{a.title}</div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{a.category} &bull; {a.academicYear}</div>
                                </div>
                                {a.certificateUrl && (
                                  <button onClick={() => window.open(a.certificateUrl, "_blank")} className="p-2 text-brand-600 hover:bg-white rounded-lg transition-colors">
                                    <ExternalLink size={18} />
                                  </button>
                                )}
                             </div>
                           ))
                         )}
                      </div>
                   </div>

                   <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-surface-50 flex items-center gap-2 font-sans text-xs font-bold text-ink uppercase tracking-widest">
                         <FileText size={16} className="text-brand-500" />
                         Uploaded Documents
                      </div>
                      <div className="p-4 flex flex-col gap-3 min-h-[200px]">
                         {selectedData?.documents?.length === 0 ? (
                           <div className="m-auto text-slate-400 text-xs font-medium italic">No files found.</div>
                         ) : (
                           selectedData?.documents?.map((d: any) => (
                             <div key={d._id} className="p-4 border border-surface-100 rounded-2xl bg-surface-50 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-10 bg-white border border-surface-200 rounded-lg flex items-center justify-center font-bold text-[9px] text-slate-400 uppercase tracking-tighter shadow-sm">FILE</div>
                                   <div>
                                      <div className="text-sm font-bold text-ink line-clamp-1">{d.title}</div>
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{d.type}</div>
                                   </div>
                                </div>
                                <button
                                  className="text-brand-600 font-bold text-[10px] hover:underline"
                                  onClick={async () => {
                                    const { downloadUrl } = await api<{ downloadUrl: string }>(`/documents/${d._id}/download-url`, { token });
                                    window.open(downloadUrl, "_blank");
                                  }}
                                >
                                   VIEW →
                                </button>
                             </div>
                           ))
                         )}
                      </div>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
