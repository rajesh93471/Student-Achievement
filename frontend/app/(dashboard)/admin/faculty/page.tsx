"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  Users, 
  Search, 
  Upload, 
  Trash2, 
  Info, 
  Loader2,
  ListRestart,
  UserCheck,
  X,
  Save,
  ChevronRight,
  Filter,
  AlertTriangle,
  ChevronDown,
  FileText,
  Award,
  ExternalLink,
  Calendar,
  Layers,
  GraduationCap
} from "lucide-react";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

const inputClasses = "w-full bg-white border border-surface-300 rounded-xl px-4 py-3.5 text-ink font-sans text-base outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100 placeholder:text-slate-400";
const labelClasses = "block text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-2.5";

export default function AdminFacultyPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"manage" | "add" | "assignments">("manage");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedFacultyId, setExpandedFacultyId] = useState("");
  const [inspectorStudentId, setInspectorStudentId] = useState("");
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const { data: facultyData, isLoading: loadingFaculty } = useQuery({
    queryKey: ["admin-faculty"],
    queryFn: () => api<any[]>("/admin/faculty", { token }),
    enabled: !!token,
  });

  const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
    queryKey: ["admin-assignments"],
    queryFn: () => api<any[]>("/admin/assignments", { token }),
    enabled: !!token && activeTab === "assignments",
  });

  const { data: inspectorData, isLoading: loadingInspector } = useQuery({
    queryKey: ["admin-student-details", inspectorStudentId],
    queryFn: () => api<any>(`/students/${inspectorStudentId}`, { token }),
    enabled: !!token && !!inspectorStudentId && isInspectorOpen,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => api("/admin/faculty", { method: "POST", token, body: JSON.stringify(values) }),
    onSuccess: () => {
      setSuccessMessage("Faculty created successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-faculty"] });
      setActiveTab("manage");
    },
    onError: (err: any) => setFormError(err.message || "Failed to create faculty"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/admin/faculty/${id}`, { method: "DELETE", token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-faculty"] }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api("/admin/faculty/upload", { method: "POST", token, body: fd });
    },
    onSuccess: (res: any) => {
      setSuccessMessage(`Upload complete: ${res.success} succeeded, ${res.failed} failed.`);
      queryClient.invalidateQueries({ queryKey: ["admin-faculty"] });
    },
    onError: (err: any) => setFormError(err.message || "Upload failed"),
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => api(`/admin/faculty/${selectedFacultyId}`, { method: "PUT", token, body: JSON.stringify(values) }),
    onSuccess: () => {
      setSuccessMessage("Faculty profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-faculty"] });
    },
    onError: (err: any) => setFormError(err.message || "Failed to update faculty"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api("/admin/faculty/bulk-delete", { method: "POST", token, body: JSON.stringify({ ids }) }),
    onSuccess: () => {
      setSuccessMessage("Selected faculty accounts deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-faculty"] });
      setSelectedIds(new Set());
    },
    onError: (err: any) => setFormError(err.message || "Bulk delete failed"),
  });

  const toggleFaculty = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredFaculty.length && filteredFaculty.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFaculty.map(f => f.id)));
    }
  };

  const faculty = facultyData || [];
  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          f.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !department || f.department.toLowerCase() === department.toLowerCase();
    return matchesSearch && matchesDept;
  });

  const selectedFaculty = faculty.find(f => f.id === selectedFacultyId);

  const syncMutation = useMutation({
    mutationFn: () => api("/admin/assignments/sync", { method: "POST", token }),
    onSuccess: (res: any) => {
      setSuccessMessage(`Sync complete: ${res.count} students were successfully assigned.`);
      queryClient.invalidateQueries({ queryKey: ["admin-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-faculty"] });
    },
    onError: (err: any) => setFormError(err.message || "Sync failed"),
  });

  return (
    <DashboardShell
      title="Faculty Management"
      subtitle="Coordinate faculty assignments and manage departmental supervisors."
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
      <div className="p-4 lg:p-6 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
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
              ADD NEW
            </button>
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "assignments" ? "bg-brand-50 text-brand-700 shadow-sm" : "text-slate-500 hover:text-brand-600"
              )}
              onClick={() => setActiveTab("assignments")}
            >
              <UserCheck size={14} />
              ASSIGNMENTS
            </button>
          </div>

          {(activeTab === "manage" || activeTab === "assignments") && (
            <div className="flex flex-wrap items-center gap-3 lg:gap-4 lg:justify-end flex-1">
              <div className="relative flex-1 lg:flex-none lg:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  className={cn(inputClasses, "pl-11 pr-4 py-2.5 text-sm font-semibold")}
                  placeholder="Search Faculty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {activeTab === "manage" && (
                <button 
                  onClick={() => setInfoModalOpen(true)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-surface-200 rounded-xl text-brand-600 hover:bg-brand-50 transition-all shadow-sm"
                >
                  <Info size={18} />
                </button>
              )}
              
              {activeTab === "manage" && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 lg:py-1.5 bg-white text-slate-600 border border-surface-200 rounded-xl text-[10px] font-bold hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all cursor-pointer shadow-sm uppercase tracking-widest shrink-0 group">
                    <Upload size={14} className="text-slate-400 group-hover:text-brand-500" />
                    <span className="hidden sm:inline">Bulk Update</span>
                    <span className="sm:hidden">Update</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSuccessMessage("Processing bulk update...");
                          const fd = new FormData();
                          fd.append("file", file);
                          api("/admin/faculty/upload?mode=update", { 
                            method: "POST", 
                            token, 
                            body: fd 
                          }).then((res: any) => {
                            setSuccessMessage(`Update complete: ${res.success} succeeded, ${res.failed} failed.`);
                            queryClient.invalidateQueries({ queryKey: ["admin-faculty"] });
                          }).catch(err => setFormError(err.message));
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
                      {Array.from(new Set(faculty?.map((f: any) => f.department).filter(Boolean) || [])).sort().map((d: any) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                  </div>

                  {(selectedFacultyId || selectedIds.size > 0) && (
                    <button
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-red-100 flex items-center justify-center shrink-0 gap-2 px-3 animate-fade-in"
                      onClick={() => selectedIds.size > 0 ? setIsBulkDeleteModalOpen(true) : setIsDeleteModalOpen(true)}
                    >
                      <Trash2 size={18} />
                      {selectedIds.size > 0 && <span className="text-[10px] font-bold">{selectedIds.size}</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {successMessage && <div className="mb-4"><Alert tone="success" onClose={() => setSuccessMessage("")}>{successMessage}</Alert></div>}
        {formError && <div className="mb-4"><Alert tone="error" onClose={() => setFormError("")}>{formError}</Alert></div>}

        {activeTab === "add" && (
          <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-panel animate-fade-up">
            <div className="px-6 py-4 border-b border-surface-50 bg-surface-50/30 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-ink">Register Faculty</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setInfoModalOpen(true)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-surface-200 rounded-xl text-brand-600 hover:bg-brand-50 transition-all shadow-sm"
                >
                  <Info size={18} />
                </button>
                <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm uppercase tracking-widest shrink-0">
                  <Upload size={14} />
                  UPLOAD EXCEL
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadMutation.mutate(file);
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="p-8">
              <form 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  createMutation.mutate(Object.fromEntries(fd.entries()));
                }}
              >
                <div><label className={labelClasses}>Full Name</label><input name="fullName" className={inputClasses} placeholder="e.g. Dr. Satish Kumar" required /></div>
                <div><label className={labelClasses}>Employee ID</label><input name="employeeId" className={inputClasses} placeholder="e.g. EMP1024" required /></div>
                <div><label className={labelClasses}>Email</label><input name="email" type="email" className={inputClasses} placeholder="e.g. satish@vignan.ac.in" required /></div>
                <div><label className={labelClasses}>Department</label><input name="department" className={inputClasses} placeholder="e.g. CSE" required /></div>
                <div><label className={labelClasses}>Section</label><input name="section" className={inputClasses} placeholder="e.g. A" required /></div>
                <div><label className={labelClasses}>Temporary Password</label><input name="password" type="password" className={inputClasses} placeholder="Defaults to temp123" /></div>
                <div className="md:col-span-2 pt-6 flex justify-end">
                  <button type="submit" className="bg-brand-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-brand-700 transition-all shadow-lg">
                    CREATE FACULTY ACCOUNT
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "manage" && (
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 items-start">
            
            {/* List Sidebar */}
            <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col max-h-[700px]">
              <div className="p-5 border-b border-surface-50 flex items-center justify-between bg-surface-50/30">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-3">
                     <div 
                       className={cn(
                         "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer",
                         selectedIds.size === filteredFaculty.length && filteredFaculty.length > 0
                          ? "bg-brand-600 border-brand-600 shadow-sm" 
                          : "border-surface-300 bg-white hover:border-brand-400"
                       )}
                       onClick={(e) => {
                         e.stopPropagation();
                         toggleAll();
                       }}
                     >
                        {selectedIds.size === filteredFaculty.length && filteredFaculty.length > 0 && <span className="text-white text-[10px]">✓</span>}
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Showing {filteredFaculty.length} Faculty</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
                 {loadingFaculty ? (
                   <div className="p-12 text-center text-slate-400 italic">Loading...</div>
                 ) : filteredFaculty.length === 0 ? (
                   <div className="p-12 text-center text-slate-400 italic">No matches.</div>
                 ) : filteredFaculty.map(f => (
                    <div key={f.id} className="relative group">
                      <button
                        className={cn(
                          "w-full text-left p-4 rounded-2xl transition-all border",
                          selectedFacultyId === f.id 
                            ? "bg-brand-50 border-brand-200" 
                            : "bg-transparent border-transparent hover:bg-surface-50"
                        )}
                        onClick={() => setSelectedFacultyId(f.id)}
                      >
                         <div className="flex items-center justify-between mb-1.5 pl-8">
                            <span className={cn("text-[13px] font-semibold tracking-tight", selectedFacultyId === f.id ? "text-brand-700" : "text-slate-400 group-hover:text-ink")}>{f.employeeId}</span>
                            <ChevronRight size={16} className={cn("transition-transform", selectedFacultyId === f.id ? "text-brand-500 translate-x-1" : "text-slate-300")} />
                         </div>
                         <div className="text-base font-bold text-ink leading-none pl-8">{f.fullName}</div>
                         <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2.5 pl-8">{f.department} &bull; SEC {f.section}</div>
                      </button>
                      <div 
                        className={cn(
                          "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer z-10",
                          selectedIds.has(f.id)
                            ? "bg-brand-600 border-brand-600 shadow-sm" 
                            : "border-surface-300 bg-white hover:border-brand-400 opacity-0 group-hover:opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFaculty(f.id);
                        }}
                      >
                         {selectedIds.has(f.id) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Details Inspector */}
            <div className="flex flex-col gap-8 scroll-mt-6">
              {!selectedFacultyId ? (
                <div className="bg-white border-2 border-dashed border-surface-200 rounded-[32px] p-24 text-center">
                   <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Search size={32} className="text-slate-300" />
                   </div>
                   <h3 className="font-display font-bold text-xl text-ink mb-2">Faculty Inspector</h3>
                   <p className="text-sm text-slate-500 max-w-xs mx-auto">Select a faculty member from the directory to update their profile or manage assignments.</p>
                </div>
              ) : (
                <div className="animate-fade-up">
                  <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-panel mb-8">
                    <div className="p-6 border-b border-surface-50 bg-gradient-to-br from-brand-50/50 to-white flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-brand-600 text-white flex items-center justify-center rounded-xl text-xl font-bold font-display shadow-lg border-2 border-white">
                            {selectedFaculty?.fullName?.[0]}
                          </div>
                          <div>
                             <h2 className="font-display font-bold text-xl text-ink leading-tight">{selectedFaculty?.fullName}</h2>
                             <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{selectedFaculty?.employeeId}</p>
                          </div>
                       </div>
                       <button
                         className="p-3 text-slate-400 hover:text-ink hover:bg-surface-100 rounded-xl transition-all"
                         onClick={() => setSelectedFacultyId("")}
                       >
                          <X size={24} />
                       </button>
                    </div>

                    <div className="p-8">
                      <form 
                        key={selectedFacultyId}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          updateMutation.mutate(Object.fromEntries(fd.entries()));
                        }}
                      >
                         <div><label className={labelClasses}>Full Name</label><input name="fullName" className={inputClasses} defaultValue={selectedFaculty?.fullName} required /></div>
                         <div><label className={labelClasses}>Email Address</label><input name="email" className={inputClasses} defaultValue={selectedFaculty?.email} required type="email" /></div>
                         <div><label className={labelClasses}>Employee ID</label><input name="employeeId" className={inputClasses} defaultValue={selectedFaculty?.employeeId} required /></div>
                         <div><label className={labelClasses}>Department</label><input name="department" className={inputClasses} defaultValue={selectedFaculty?.department} required /></div>
                         <div><label className={labelClasses}>Section</label><input name="section" className={inputClasses} defaultValue={selectedFaculty?.section} required /></div>
                         
                         <div className="sm:col-span-2 pt-6 border-t border-surface-100 flex justify-end">
                            <button type="submit" disabled={updateMutation.isPending} className="bg-brand-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-brand-700 transition-all shadow-lg flex items-center gap-2">
                               {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
                               UPDATE PROFILE
                            </button>
                         </div>
                      </form>
                    </div>
                  </div>

                  <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-sm p-8">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Assigned Students</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-brand-50 rounded-[24px] border border-brand-100 flex flex-col items-center justify-center text-center">
                           <Users size={32} className="text-brand-600 mb-3" />
                           <div className="text-3xl font-display font-bold text-ink mb-1">{selectedFaculty?._count?.assignments || 0}</div>
                           <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Active Assignments</div>
                        </div>
                        <div className="p-6 bg-surface-50 rounded-[24px] border border-surface-100 flex items-center justify-center flex-col text-center">
                           <div className="text-xs text-slate-500 leading-relaxed max-w-[140px]">
                              Mapped via matching <strong>Employee ID</strong> (Strict Mode enabled).
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-sm animate-fade-up">
              <div className="px-6 py-4 border-b border-surface-50 bg-surface-50/30 flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-ink">Strict Identity Mapping</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {syncMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <ListRestart size={14} />}
                    RE-SYNC & PURGE
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Strict ID Mode Active</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex flex-col gap-4">
                {filteredFaculty.length === 0 ? (
                  <div className="py-20 text-center bg-surface-50 border-2 border-dashed border-surface-200 rounded-[32px]">
                    <div className="w-16 h-16 bg-white border border-surface-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Search size={24} className="text-slate-300" />
                    </div>
                    <p className="text-base font-bold text-ink mb-1">No faculty found</p>
                    <p className="text-xs text-slate-500">Try adjusting your search or department filter.</p>
                  </div>
                ) : filteredFaculty.map(f => {
                  const assignedStudents = (assignmentsData || []).filter((a: any) => a.facultyId === f.id);
                  const isExpanded = expandedFacultyId === f.id;

                  return (
                    <div key={f.id} className={cn("border rounded-3xl transition-all", isExpanded ? "border-brand-200 bg-brand-50/20" : "border-surface-100 bg-white")}>
                      <div 
                        className="p-5 flex items-center justify-between cursor-pointer group"
                        onClick={() => setExpandedFacultyId(isExpanded ? "" : f.id)}
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center font-bold text-brand-600 transition-colors group-hover:bg-brand-50 shadow-inner">
                              {f.fullName[0]}
                           </div>
                           <div>
                              <div className="font-bold text-ink leading-none mb-1 group-hover:text-brand-600 transition-colors">{f.fullName}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.employeeId} &bull; {f.department}</div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <div className="text-sm font-bold text-ink leading-none mb-1">{assignedStudents.length}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Linked Students</div>
                           </div>
                           <div className="flex items-center gap-2">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!token) return;
                                  const response = await fetch(`/achieve/api/admin/reports/export?report=faculty-assignments&facultyId=${f.id}`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  if (!response.ok) {
                                    throw new Error("Export failed");
                                  }
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `faculty-assignments-${f.employeeId || f.id}.xlsx`;
                                  link.click();
                                  window.URL.revokeObjectURL(url);
                                }}
                                className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-white rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-brand-100 shadow-sm hover:shadow-md"
                                title="Download Excel"
                              >
                                 <Upload size={16} className="rotate-180" />
                                 <span className="text-[10px] font-black uppercase tracking-widest px-1">Excel</span>
                              </button>
                              <div className={cn("p-1.5 rounded-lg transition-transform", isExpanded ? "rotate-180 bg-brand-100 text-brand-600" : "text-slate-300 group-hover:text-brand-400")}>
                                 <ChevronDown size={20} />
                              </div>
                           </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                           {assignedStudents.length === 0 ? (
                             <div className="py-8 text-center bg-surface-50/50 rounded-2xl border border-dashed border-surface-200">
                                <p className="text-xs font-medium text-slate-400 italic">No students linked to this ID yet.</p>
                             </div>
                           ) : (
                             <div className="overflow-hidden rounded-2xl border border-surface-100 bg-white shadow-sm transition-all hover:border-brand-100">
                                <table className="w-full text-left border-collapse">
                                   <thead>
                                      <tr className="bg-surface-50/50 border-b border-surface-100">
                                         <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                         <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reg Number</th>
                                         <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Context</th>
                                         <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                      </tr>
                                   </thead>
                                   <tbody className="divide-y divide-surface-50">
                                      {assignedStudents.map((a: any) => (
                                         <tr 
                                            key={a.id} 
                                            className="hover:bg-brand-50/30 transition-all cursor-pointer group"
                                            onClick={() => {
                                              setInspectorStudentId(a.student.id);
                                              setIsInspectorOpen(true);
                                            }}
                                         >
                                            <td className="px-4 py-3 text-sm font-bold text-ink group-hover:text-brand-600">
                                               <div className="flex items-center gap-2">
                                                  {a.student.fullName}
                                                  <Info size={12} className="opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity" />
                                               </div>
                                            </td>
                                            <td className="px-4 py-3 text-[11px] font-bold text-brand-600 font-mono underline decoration-brand-100 underline-offset-4">{a.student.studentId}</td>
                                            <td className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{a.student.department} &bull; SEC {a.student.section}</td>
                                            <td className="px-4 py-3 text-right">
                                               <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                                                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                  Verified
                                               </span>
                                            </td>
                                         </tr>
                                      ))}
                                   </tbody>
                                </table>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modals */}
      <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Security Check">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6 rotate-3 shadow-inner border border-red-100/50">
            <AlertTriangle size={40} strokeWidth={1.5} />
          </div>
          <h3 className="font-display font-bold text-2xl text-ink mb-3 tracking-tight">Confirm Deletion</h3>
          <p className="text-sm text-slate-500 mb-10 max-w-[340px] text-center leading-relaxed font-medium">
            Permanent removal of <span className="text-red-600 font-bold underline decoration-red-200 underline-offset-4">{selectedFaculty?.fullName}</span> will also remove their student mappings.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full">
            <button className="px-6 py-4 rounded-2xl bg-surface-50 text-slate-500 font-bold" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className="px-6 py-4 rounded-2xl bg-red-600 text-white font-bold" onClick={() => { deleteMutation.mutate(selectedFacultyId); setIsDeleteModalOpen(false); setSelectedFacultyId(""); }}>Yes, Delete</button>
          </div>
        </div>
      </Modal>

      {/* Student Details Inspector Modal */}
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
             <div className="py-20 text-center text-slate-400 italic">No student found.</div>
           ) : (
             <div className="space-y-6">
                <div className="bg-brand-50 border border-brand-100 rounded-[28px] p-6 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white border-2 border-brand-200 rounded-2xl flex items-center justify-center text-2xl font-bold font-display text-brand-700 shadow-sm transition-transform hover:rotate-3">
                         {inspectorData.student.fullName[0]}
                      </div>
                      <div>
                         <h3 className="text-2xl font-display font-bold text-ink leading-tight">{inspectorData.student.fullName}</h3>
                         <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-black text-brand-600 bg-white border border-brand-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{inspectorData.student.studentId}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inspectorData.student.department} &bull; SEC {inspectorData.student.section}</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-2xl font-display font-bold text-brand-600 leading-none mb-1">{inspectorData.student.cgpa || "N/A"}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current CGPA</div>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {[
                     { label: "Phone", value: inspectorData.student.phone || "N/A", icon: <Info size={14} /> },
                     { label: "Year", value: `${inspectorData.student.year} Year`, icon: <Calendar size={14} /> },
                     { label: "Grad Year", value: inspectorData.student.graduationYear || "N/A", icon: <GraduationCap size={14} /> },
                     { label: "Program", value: inspectorData.student.program, icon: <Layers size={14} /> },
                   ].map((spec, i) => (
                     <div key={i} className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm border-b-2 transition-all hover:-translate-y-1">
                        <div className="text-slate-300 mb-2">{spec.icon}</div>
                        <div className="text-[14px] font-bold text-ink leading-tight mb-0.5">{spec.value}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{spec.label}</div>
                     </div>
                   ))}
                </div>

                <div className="bg-surface-50 border border-surface-100 rounded-[32px] overflow-hidden">
                   <div className="px-6 py-4 border-b border-surface-200 flex items-center gap-2">
                      <Award size={16} className="text-brand-500" />
                      <span className="text-[10px] font-black text-ink uppercase tracking-widest">Achievement Record</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-400">{inspectorData.achievements?.length || 0} Entries</span>
                   </div>
                   <div className="p-4 flex flex-col gap-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                      {inspectorData.achievements?.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs italic">No achievements recorded yet.</div>
                      ) : (
                        inspectorData.achievements.map((a: any) => (
                          <div key={a.id} className="bg-white border border-surface-100 rounded-2xl p-4 flex items-center justify-between group hover:border-brand-200 hover:shadow-sm transition-all shadow-sm">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white transition-all shadow-inner">
                                   <Award size={18} />
                                </div>
                                <div>
                                   <div className="text-sm font-bold text-ink leading-tight">{a.title}</div>
                                   <div className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-tighter">{a.category} &bull; {new Date(a.date).toLocaleDateString()}</div>
                                </div>
                             </div>
                             {a.certificateUrl && (
                               <a 
                                 href={a.certificateUrl} 
                                 target="_blank" 
                                 className="w-8 h-8 flex items-center justify-center bg-surface-50 text-slate-400 hover:bg-brand-600 hover:text-white rounded-lg transition-all shadow-sm"
                               >
                                  <ExternalLink size={14} />
                               </a>
                             )}
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="bg-slate-900 rounded-[32px] overflow-hidden text-white shadow-2xl">
                   <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-brand-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Library Vault</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-500">{inspectorData.documents?.length || 0} Files</span>
                   </div>
                   <div className="p-4 flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {inspectorData.documents?.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs italic">No documents uploaded.</div>
                      ) : (
                        inspectorData.documents.map((d: any) => (
                          <div key={d.id} className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-800 transition-all shadow-sm">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-brand-400 shadow-inner">
                                   <FileText size={18} />
                                </div>
                                <div>
                                   <div className="text-sm font-bold text-slate-100 leading-tight">{d.title}</div>
                                   <div className="text-[10px] font-medium text-slate-500 mt-0.5 uppercase tracking-tighter">{d.type} &bull; {(d.size / 1024).toFixed(1)} KB</div>
                                </div>
                             </div>
                             <a 
                               href={d.fileUrl} 
                               target="_blank" 
                               className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                             >
                                 Download
                             </a>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
           )}
        </div>
      </Modal>

      <Modal open={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Mass Action Risk">
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 rotate-3 shadow-xl bg-red-50">
            <AlertTriangle size={48} strokeWidth={1.5} color="#dc2626" />
          </div>
          <h3 className="font-display font-bold text-2xl text-ink mb-3 tracking-tight">Mass Deletion?</h3>
          <p className="text-sm text-slate-500 mb-10 max-w-[360px] text-center leading-relaxed font-medium">
            You are about to permanently remove <span className="text-red-600 font-extrabold">{selectedIds.size} faculty profiles</span>. This cannot be undone.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full">
            <button className="px-6 py-4 rounded-2xl bg-surface-50 text-slate-500 font-bold" onClick={() => setIsBulkDeleteModalOpen(false)}>Cancel</button>
            <button className="px-6 py-4 rounded-2xl bg-red-600 text-white font-bold" onClick={() => { bulkDeleteMutation.mutate(Array.from(selectedIds)); setIsBulkDeleteModalOpen(false); }}>Exterminate</button>
          </div>
        </div>
      </Modal>

      {/* Excel Format Info Modal */}
      <Modal 
        open={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        title="Faculty Excel Format"
      >
        <div className="py-2">
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-6 shadow-inner">
            <p className="text-xs text-brand-800 leading-relaxed font-medium">
              To bulk enroll faculty, upload an Excel (.xlsx) file with the following column headers. Header names are case-insensitive.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white border border-surface-200 rounded-2xl shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Required Columns</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { tag: "employeeId", desc: "Unique faculty identifier (e.g. EMP101)" },
                  { tag: "fullName", desc: "Full name of the faculty member" },
                  { tag: "email", desc: "Official email address" },
                  { tag: "department", desc: "e.g. CSE, ECE, MECH" },
                  { tag: "section", desc: "e.g. 15, A" },
                ].map((col, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
                    <code className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md shadow-sm">{col.tag}</code>
                    <span className="text-[11px] text-slate-500 font-medium">{col.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-surface-50 border border-surface-200 rounded-2xl flex items-start gap-3 shadow-inner">
              <Info size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The default password for all uploaded faculty accounts will be <span className="font-bold text-ink">temp123</span>. Faculty can change this post-login.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
