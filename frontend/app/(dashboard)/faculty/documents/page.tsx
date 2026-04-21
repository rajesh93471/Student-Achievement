"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/layout/providers";
import { api } from "@/lib/api";
import { 
  Search, 
  FileText, 
  FileSpreadsheet,
  ExternalLink,
  Layers,
  Loader2,
  FileIcon,
  Archive
} from "lucide-react";
import { Select } from "@/components/ui/select";

const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2";

export default function FacultyDocumentsPage() {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [downloadState, setDownloadState] = useState("");

  const { data: documents, isLoading } = useQuery({
    queryKey: ["faculty-documents-explorer"],
    queryFn: () => api<any[]>("/faculty/documents", { token }),
    enabled: !!token,
  });

  const docList = documents || [];

  const typeOptions = useMemo(() => {
    const types = docList.map((item) => item.type).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [docList]);

  const filteredDocuments = docList.filter((item) => {
    const studentName = String(item.student?.fullName || "").toLowerCase();
    const studentId = String(item.student?.studentId || "").toLowerCase();
    const searchTerm = studentSearch.trim().toLowerCase();
    return (
      (selectedType === "all" || item.type === selectedType) &&
      (!searchTerm || studentName.includes(searchTerm) || studentId.includes(searchTerm))
    );
  });

  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, any>();
    filteredDocuments.forEach((item) => {
      const key = item.student?.studentId || item.id;
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
  }, [filteredDocuments]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/achieve/api";

  const handleExport = async (format: "pdf" | "excel" | "zip") => {
    if (!token) return;
    setDownloadState(`Preparing ${format.toUpperCase()}...`);
    try {
      const params = new URLSearchParams({
        report: "student-documents",
        format,
        type: selectedType,
        student: studentSearch,
      });
      const response = await fetch(`${apiUrl}/faculty/reports/export?${params.toString()}`, {
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
      link.download = `faculty-documents-report.${extension}`;
      link.click();
      window.URL.revokeObjectURL(url);
      setDownloadState("");
    } catch {
      setDownloadState("Export failed.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-surface-200 rounded-[32px] p-6 shadow-panel animate-fade-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className={labelClasses}>
              <Search size={14} className="inline mr-1" />
              Search by Student
            </label>
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="NAME OR REG NO"
              className="w-full bg-white border border-surface-300 rounded-xl px-4 py-3 text-ink font-sans text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className={labelClasses}>
              <Layers size={14} className="inline mr-1" />
              Document Type
            </label>
            <Select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              <option value="all">ALL TYPES</option>
              {typeOptions.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </Select>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-surface-100 flex flex-col sm:flex-row items-center justify-between gap-3">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
             {isLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
             Found: {filteredDocuments.length} Documents
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
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-[10px] font-bold hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                onClick={() => handleExport("zip")}
              >
                <Archive size={14} />
                ZIP
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedDocuments.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-white border border-surface-200 rounded-[32px]">
             <Search size={64} className="mx-auto mb-4 text-slate-200" />
             <h3 className="font-display font-semibold text-2xl text-ink">No documents found</h3>
             <p className="text-sm text-slate-500">Your assigned students haven&apos;t uploaded documents matching these filters.</p>
          </div>
        ) : (
          groupedDocuments.map((group) => (
            <div key={group.studentId} className="bg-white border border-surface-200 rounded-[32px] overflow-hidden shadow-sm animate-fade-up">
              <div className="p-5 border-b border-surface-50 bg-surface-50/50">
                <h3 className="font-display font-bold text-ink leading-tight">{group.studentName}</h3>
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-1">{group.studentId} &bull; {group.department}</p>
              </div>
              <div className="p-4 space-y-3">
                {group.items.map((doc: any) => (
                  <div key={doc.id} className="group flex items-center justify-between p-3 rounded-2xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                        <FileIcon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink leading-none mb-1">{doc.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                      className="p-2 text-slate-300 hover:text-brand-600 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
