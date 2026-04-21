"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  X
} from "lucide-react";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle } from "lucide-react";

const inputClasses = "w-full bg-white border border-surface-300 rounded-xl px-4 py-3.5 text-ink font-sans text-base outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100 placeholder:text-slate-400";
const labelClasses = "block text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-2.5";
const romanYears: Record<number, string> = { 1: "I", 2: "II", 3: "III", 4: "IV" };

export default function AdminStudentsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "manage">("manage");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [bulkMessage, setBulkMessage] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [showManageHelp, setShowManageHelp] = useState(false);
  const [showEnrollHelp, setShowEnrollHelp] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const inspectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedStudentId && window.innerWidth < 1280) {
      setTimeout(() => {
        inspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedStudentId]);

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

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api("/admin/students/bulk-delete", { method: "POST", token, body: JSON.stringify({ ids }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setSelectedIds(new Set());
      setBulkMessage("Selected students deleted successfully.");
    },
    onError: () => setFormError("Failed to delete selected students."),
  });

  const toggleStudent = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s._id)));
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/admin/students/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      setSelectedStudentId("");
      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const students = data?.students || [];
  
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || 
                         String(s.studentId || "").toLowerCase().includes(search.toLowerCase());
    const matchesDept = !department || String(s.department || "").toLowerCase() === department.toLowerCase();
    const matchesGradYear = !gradYear || String(s.graduationYear || "") === gradYear;
    return matchesSearch && matchesDept && matchesGradYear;
  });

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  return (
    <DashboardShell
      title="Student Directory"
      subtitle="Comprehensive management of student profiles, academic records, and achievement history."
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
      <div 
        className="min-h-full pb-20 cursor-default p-2 sm:p-4 lg:p-6"
        onClick={() => setSelectedStudentId("")}
      >
        <div onClick={(e) => e.stopPropagation()} className="cursor-default">
          {/* ── Tabs & Search ── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2 animate-fade-up relative z-50">
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
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 lg:justify-end flex-1">
            <div className="relative group flex-1 min-w-[200px] lg:flex-none lg:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={14} />
              <input
                className={cn(inputClasses, "pl-11 pr-11 py-3 lg:py-2.5 text-sm font-semibold")}
                placeholder="Search Student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
                 <Info size={12} className="text-slate-300 cursor-help" />
                 <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Search by Name or Registration Number
                 </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button 
                  type="button"
                  className={cn("p-1.5 rounded-lg transition-colors", showManageHelp ? "bg-brand-100 text-brand-600" : "text-slate-400 hover:text-brand-500")}
                  onClick={() => setShowManageHelp(!showManageHelp)}
                >
                  <Info size={16} />
                </button>
                {showManageHelp && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 text-white text-[10px] p-4 rounded-2xl shadow-2xl z-[1000] border border-white/10 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                       <p className="font-bold uppercase tracking-widest text-brand-400">Excel Requirements</p>
                       <button onClick={() => setShowManageHelp(false)} className="text-slate-500 hover:text-white">✕</button>
                    </div>
                    <ul className="list-disc pl-3 space-y-1.5 text-slate-300">
                      <li><strong className="text-white">studentId</strong> (Mandatory, e.g. 231FA04023)</li>
                      <li><strong>fullName</strong>, <strong>email</strong> (Required for new enrollments)</li>
                      <li><strong>department/branch</strong>, <strong>program/course</strong>, <strong>section/sectioncode</strong></li>
                      <li><strong>year</strong> (1-4 or I-IV), <strong>semester</strong> (1-2 or I-II)</li>
                      <li><strong>cgpa</strong>, <strong>graduationYear</strong>, <strong>counsellor_name</strong></li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-white/5 text-[9px] italic text-slate-400 leading-relaxed">
                      Columns map automatically (e.g. "Reg Number" → studentId).
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 px-3 py-2 lg:py-1.5 bg-white text-slate-600 border border-surface-200 rounded-xl text-[10px] font-bold hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all cursor-pointer shadow-sm uppercase tracking-widest shrink-0 group">
                <Upload size={14} className="text-slate-400 group-hover:text-brand-500" />
                <span className="hidden sm:inline">Bulk Update</span>
                <span className="sm:hidden">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBulkMessage("Processing bulk update...");
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await api<{ success: number; failed: number; errors: string[] }>("/admin/students/upload?mode=update", { 
                        method: "POST", 
                        token, 
                        body: formData 
                      });
                      if (res.failed > 0) {
                        setFormError(`Bulk update partially failed: ${res.failed} rows had issues. First error: ${res.errors[0]}`);
                      }
                      setBulkMessage(`Bulk update: ${res.success} succeeded, ${res.failed} failed.`);
                      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
                    } catch (err: any) {
                      setFormError(err?.message || "Bulk update failed. Check Excel/CSV format.");
                    }
                  }}
                />
              </label>

              <div className="relative group shrink-0">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-brand-500 transition-colors" size={14} />
                <Select 
                  className="w-32 lg:w-36 py-2.5 pl-10 pr-8 text-sm font-semibold" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Depts</option>
                  {Array.from(new Set(data?.students?.map((s: any) => s.department).filter(Boolean) || [])).sort().map((d: any) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </div>
              
              <div className="relative group shrink-0">
                <Select 
                  className="w-32 lg:w-36 py-2.5 px-4 text-sm font-semibold" 
                  value={gradYear} 
                  onChange={(e) => setGradYear(e.target.value)}
                >
                  <option value="">Grad Year</option>
                  {Array.from(new Set(data?.students?.map((s: any) => s.graduationYear).filter(Boolean) || [])).sort().map((y: any) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </Select>
              </div>

              {(selectedStudentId || selectedIds.size > 0) && (
                <button
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-red-100 flex items-center justify-center shrink-0 gap-2 px-3 animate-fade-in"
                  onClick={() => selectedIds.size > 0 ? setIsBulkDeleteModalOpen(true) : setIsDeleteModalOpen(true)}
                  title={selectedIds.size > 0 ? `Delete ${selectedIds.size} Students` : "Delete Profile"}
                >
                  <Trash2 size={18} />
                  {selectedIds.size > 0 && <span className="text-[10px] font-bold">{selectedIds.size}</span>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {bulkMessage && (
        <div className="mb-6 animate-fade-up">
           <Alert tone="success" onClose={() => setBulkMessage("")}>{bulkMessage}</Alert>
        </div>
      )}
      {formError && (
        <div className="mb-6 animate-fade-up">
           <Alert tone="error" onClose={() => setFormError("")}>{formError}</Alert>
        </div>
      )}

      {activeTab === "add" ? (
        /* ── ENROLL TAB ── */
        <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-panel animate-fade-up">
           <div className="px-6 py-4 border-b border-surface-50 bg-surface-50/30 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-ink">New Enrollment</h2>
               <div className="flex items-center gap-3 relative">
                  <div className="relative">
                    <button 
                      type="button" 
                      className={cn("p-1.5 rounded-lg transition-colors", showEnrollHelp ? "bg-emerald-100 text-emerald-600" : "text-slate-400 hover:text-emerald-500")}
                      onClick={() => setShowEnrollHelp(!showEnrollHelp)}
                    >
                      <Info size={16} />
                    </button>
                    {showEnrollHelp && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 text-white text-[10px] p-4 rounded-2xl shadow-2xl z-[100] border border-white/10 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                           <p className="font-bold uppercase tracking-widest text-emerald-400">New Enrollment Format</p>
                           <button onClick={() => setShowEnrollHelp(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>
                        <ul className="text-[10px] space-y-1 text-slate-300">
                          <li>• <strong>studentId, fullName</strong> <span className="opacity-50">(Mandatory)</span></li>
                          <li>• <strong>email, dept, program, year</strong> <span className="opacity-50">(Mandatory)</span></li>
                          <li>• <strong>semester, section/sectioncode, counsellor_name, counsellorId, gradYear, password</strong> <span className="opacity-50">(Optional)</span></li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-white/5 text-[9px] italic text-slate-400 leading-relaxed">
                          Field Support: <strong>Year</strong> accepts Roman (I-IV) or Normal (1-4) numbers. <strong>Password</strong> defaults to <span className="text-white">temp123</span> if omitted.
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5 text-[8px] italic text-slate-400 leading-relaxed">
                          All studentId entries must be unique to avoid conflicts.
                        </div>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm uppercase tracking-widest">
                    <Upload size={14} />
                    UPLOAD EXCEL
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.csv"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setBulkMessage("Processing Excel upload...");
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await api<{ success: number; failed: number; errors: string[] }>("/admin/students/upload?mode=enroll", { 
                            method: "POST", 
                            token, 
                            body: formData 
                          });
                          if (res.failed > 0) {
                            setFormError(`Upload partially failed: ${res.failed} rows had issues. First error: ${res.errors[0]}`);
                          }
                          setBulkMessage(`Bulk enrollment: ${res.success} succeeded, ${res.failed} failed.`);
                          await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
                        } catch (err: any) {
                          setFormError(err?.message || "Excel/CSV upload failed. Check format.");
                        }
                      }}
                    />
                  </label>
               </div>
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
                    { n: "password", l: "Temporary Password", p: "Optional: defaults to temp123", r: false, t: "password" },
                    { n: "studentId", l: "Reg Number", p: "e.g. 231FA04023", r: true },
                    { n: "department", l: "Department", p: "e.g. CSE", r: true },
                    { n: "program", l: "Program", p: "e.g. B.Tech", r: true },
                    { n: "section", l: "Section", p: "e.g. A", r: false },
                    { n: "counsellorId", l: "Counsellor ID", p: "Faculty Employee ID (EMP001)", r: false },
                  ].map(f => (
                    <div key={f.n}>
                      <label className={labelClasses}>{f.l}</label>
                      <input name={f.n} className={inputClasses} placeholder={f.p} required={f.r} type={f.t || "text"} />
                    </div>
                  ))}
                  
                  <div>
                    <label className={labelClasses}>Year of Study</label>
                    <Select name="year" required>
                       <option value="">Select Year</option>
                       {[1, 2, 3, 4].map(y => <option key={y} value={y}>{romanYears[y]} ({y})</option>)}
                    </Select>
                  </div>
                  <div>
                    <label className={labelClasses}>Current Semester</label>
                    <Select name="semester">
                       <option value="">Select (Optional)</option>
                       <option value={1}>1</option>
                       <option value={2}>2</option>
                    </Select>
                  </div>
                  <div>
                    <label className={labelClasses}>Graduation Year</label>
                    <input name="graduationYear" className={inputClasses} type="number" placeholder="2027" />
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
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                   <div 
                     className={cn(
                       "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer",
                       selectedIds.size === filteredStudents.length && filteredStudents.length > 0
                        ? "bg-brand-600 border-brand-600 shadow-sm" 
                        : "border-surface-300 bg-white hover:border-brand-400"
                     )}
                     onClick={(e) => {
                       e.stopPropagation();
                       toggleAll();
                     }}
                   >
                      {selectedIds.size === filteredStudents.length && filteredStudents.length > 0 && <span className="text-white text-[10px]">✓</span>}
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Showing {filteredStudents.length} Students</p>
                </div>
              </div>
               {isFetching && <Loader2 size={14} className="text-brand-500 animate-spin" />}
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
               {filteredStudents.map(s => (
                  <div key={s._id} className="relative group">
                    <button
                      className={cn(
                        "w-full text-left p-4 rounded-2xl transition-all border",
                        selectedStudentId === s._id 
                          ? "bg-brand-50 border-brand-200" 
                          : "bg-transparent border-transparent hover:bg-surface-50"
                      )}
                      onClick={() => setSelectedStudentId(s._id)}
                    >
                       <div className="flex items-center justify-between mb-1.5 pl-8">
                          <span className={cn("text-[13px] font-semibold tracking-tight", selectedStudentId === s._id ? "text-brand-700" : "text-slate-400 group-hover:text-ink")}>{s.studentId}</span>
                          <ChevronRight size={16} className={cn("transition-transform", selectedStudentId === s._id ? "text-brand-500 translate-x-1" : "text-slate-300")} />
                       </div>
                       <div className="text-base font-bold text-ink leading-none pl-8">{s.fullName}</div>
                       <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2.5 pl-8">{s.department}</div>
                    </button>
                    <div 
                      className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer z-10",
                        selectedIds.has(s._id)
                          ? "bg-brand-600 border-brand-600 shadow-sm" 
                          : "border-surface-300 bg-white hover:border-brand-400 opacity-0 group-hover:opacity-100"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStudent(s._id);
                      }}
                    >
                       {selectedIds.has(s._id) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Details View */}
          <div ref={inspectorRef} className="flex flex-col gap-8 scroll-mt-6">
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
                     <div className="flex items-center gap-2">
                        <button
                          className="p-3 text-slate-400 hover:text-ink hover:bg-surface-100 rounded-xl transition-all"
                          onClick={() => setSelectedStudentId("")}
                          title="Close Inspector"
                        >
                           <X size={24} />
                        </button>
                     </div>
                  </div>

                  <div className="p-6">
                    {saveMessage && <div className="mb-4"><Alert tone="success">{saveMessage}</Alert></div>}
                    <form 
                      key={selectedStudentId}
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
                           {[1,2,3,4].map(y => <option key={y} value={y}>{romanYears[y]} ({y})</option>)}
                         </Select>
                       </div>
                       <div><label className={labelClasses}>Sem</label>
                          <Select name="semester" className="py-2 px-3" defaultValue={selectedStudent?.semester}>
                            <option value={1}>1</option><option value={2}>2</option>
                          </Select>
                       </div>
                       <div><label className={labelClasses}>CGPA</label><input name="cgpa" className={cn(inputClasses, "py-2 px-3")} type="number" step="0.01" defaultValue={selectedStudent?.cgpa} /></div>
                       <div><label className={labelClasses}>Phone</label><input name="phone" className={cn(inputClasses, "py-2 px-3")} defaultValue={selectedStudent?.phone} /></div>
                       <div><label className={labelClasses}>Section</label><input name="section" className={cn(inputClasses, "py-2 px-3")} defaultValue={selectedStudent?.section} /></div>
                       <div>
                         <label className={labelClasses}>Graduation Year</label>
                         <input name="graduationYear" className={cn(inputClasses, "py-2 px-3")} type="number" placeholder="2027" defaultValue={selectedStudent?.graduationYear} />
                       </div>
                       <div><label className={labelClasses}>Counsellor ID</label><input name="counsellorId" className={cn(inputClasses, "py-2 px-3")} placeholder="EMP001" defaultValue={selectedStudent?.counsellorId} /></div>
                       
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
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{a.category} &bull; {a.academicYear ? a.academicYear.replace(/Year \d/i, (m: string) => `Year ${romanYears[Number(m.split(' ')[1])] || m.split(' ')[1]}`) : "N/A"}</div>
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
    </div>
  </div>

      {/* Single Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Security Check">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6 rotate-3 shadow-inner border border-red-100/50">
            <AlertTriangle size={40} strokeWidth={1.5} />
          </div>
          
          <h3 className="font-display font-bold text-2xl text-ink mb-3 tracking-tight">Confirm Permanent Deletion</h3>
          
          <p className="text-sm text-slate-500 mb-10 max-w-[340px] text-center leading-relaxed font-medium">
            You are about to remove <span className="text-red-600 font-bold underline decoration-red-200 underline-offset-4">{selectedStudent?.fullName}</span>. 
            All documents, medals, and academic records will be purged. <span className="text-ink font-semibold">This cannot be reversed.</span>
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full px-2">
            <button
              className="px-6 py-4 rounded-2xl bg-surface-50 text-slate-500 font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-surface-100 hover:text-ink transition-all active:scale-95"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Wait, Cancel
            </button>
            <button
              style={{ backgroundColor: "#dc2626" }}
              className="px-6 py-4 rounded-2xl text-white font-bold text-[11px] uppercase tracking-[0.15em] shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] hover:scale-[1.02] hover:shadow-[0_15px_25px_-5px_rgba(220,38,38,0.5)] transition-all active:scale-95"
              onClick={() => {
                deleteMutation.mutate(selectedStudentId);
                setIsDeleteModalOpen(false);
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal open={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Mass Deletion Risk">
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 rotate-3 shadow-[0_20px_40px_-15px_rgba(220,38,38,0.3)] border border-[#fee2e2]" style={{ backgroundColor: "#fef2f2" }}>
            <AlertTriangle size={48} strokeWidth={1.5} color="#dc2626" />
          </div>
          
          <h3 className="font-display font-bold text-2xl text-ink mb-3 tracking-tight">Mass Profile Deletion?</h3>
          
          <p className="text-sm text-slate-500 mb-8 max-w-[360px] text-center leading-relaxed font-medium">
            You are about to permanently remove <span style={{ color: "#dc2626" }} className="font-extrabold">{selectedIds.size} student {selectedIds.size === 1 ? 'profile' : 'profiles'}</span>. 
            All achievement histories, medals, and documents will be <span className="text-ink font-bold">purged across the system.</span>
          </p>

          <div className="mb-10">
            <span 
              className="px-6 py-2 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl"
              style={{ backgroundColor: "#dc2626", boxShadow: "0 10px 25px -5px rgba(220,38,38,0.4)" }}
            >
              Irreversible Action
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full px-2">
            <button
              className="px-6 py-4 rounded-2xl bg-[#f8fafc] text-slate-500 font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-slate-100 transition-all active:scale-95 border border-slate-200"
              onClick={() => setIsBulkDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              style={{ backgroundColor: "#dc2626", boxShadow: "0 15px 30px -5px rgba(220,38,38,0.4)" }}
              className="px-6 py-4 rounded-2xl text-white font-bold text-[11px] uppercase tracking-[0.15em] hover:scale-[1.02] transition-all active:scale-95"
              onClick={() => {
                bulkDeleteMutation.mutate(Array.from(selectedIds));
                setIsBulkDeleteModalOpen(false);
              }}
            >
              Exterminate {selectedIds.size} {selectedIds.size === 1 ? 'Profile' : 'Profiles'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
