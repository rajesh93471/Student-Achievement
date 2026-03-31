"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/layout/providers";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { readExcelFile } from "@/lib/excel";

export default function AdminStudentsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");
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
    },
    onError: (error: any) => {
      const message = error?.message || "Unable to create student.";
      setFormError(message);
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
      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => api<{ downloadUrl: string }>(`/documents/${id}/download-url`, { token }),
    onSuccess: (payload) => {
      if (payload?.downloadUrl) window.open(payload.downloadUrl, "_blank", "noopener,noreferrer");
    },
  });

  const students = data?.students || [];
  const normalizedSearch = search.trim().toLowerCase();
  const normalizedDepartment = department.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    const studentId = String(student.studentId || "").toLowerCase();
    const fullName = String(student.fullName || "").toLowerCase();
    const dept = String(student.department || "").toLowerCase();
    const program = String(student.program || "").toLowerCase();
    const matchesSearch = !normalizedSearch
      || studentId.includes(normalizedSearch)
      || fullName.includes(normalizedSearch)
      || dept.includes(normalizedSearch)
      || program.includes(normalizedSearch);
    const matchesDepartment = !normalizedDepartment
      || dept.includes(normalizedDepartment)
      || studentId.includes(normalizedDepartment)
      || program.includes(normalizedDepartment);
    return matchesSearch && matchesDepartment;
  });
  const selectedStudent = students.find((student) => student._id === selectedStudentId);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .st-wrap {
          --ink: #0d1117;
          --slate: #57606a;
          --slate-light: #8b949e;
          --brand: #1a56db;
          --brand-light: #eef2ff;
          --green: #16a34a;
          --green-light: #dcfce7;
          --red: #b91c1c;
          --red-light: #fee2e2;
          --surface: #f6f8fa;
          --white: #ffffff;
          --border: #d0d7de;
          --border-light: #eaeef2;
          --radius: 10px;
          --radius-lg: 18px;
          --radius-xl: 24px;
          --shadow: 0 3px 12px rgba(31,35,40,0.08), 0 1px 3px rgba(31,35,40,0.04);
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body: 'Geist', system-ui, sans-serif;
          font-family: var(--font-body);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* PAGE HEADER */
        .st-page-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 24px;
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .st-breadcrumb {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--slate-light); margin-bottom: 8px;
          display: flex; align-items: center; gap: 5px;
        }
        .st-page-title {
          font-family: var(--font-display);
          font-size: 30px; font-weight: 400; color: var(--ink); line-height: 1.1;
        }
        .st-page-title em { font-style: italic; color: var(--brand); }
        .st-page-sub { font-size: 14px; color: var(--slate); margin-top: 5px; }

        /* TAB SWITCHER */
        .st-tabs {
          display: inline-flex;
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 12px; padding: 4px; gap: 4px;
          margin-bottom: 20px;
        }
        .st-tab {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 8px 18px; border-radius: 9px;
          border: none; cursor: pointer;
          transition: all 0.18s;
          background: transparent; color: var(--slate);
        }
        .st-tab.active {
          background: var(--white); color: var(--brand);
          box-shadow: 0 1px 4px rgba(31,35,40,0.10);
        }
        .st-tab:not(.active):hover { color: var(--ink); }

        /* CARD */
        .st-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .st-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px 14px;
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap; gap: 10px;
        }
        .st-card-title {
          font-size: 14px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }
        .st-card-title-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); }
        .st-card-body { padding: 20px 24px; }

        /* FORM GRID */
        .st-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;
        }
        .st-field { display: flex; flex-direction: column; gap: 6px; }
        .st-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--slate-light);
        }
        .st-input {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 14px; color: var(--ink);
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: var(--radius); padding: 9px 13px;
          outline: none; width: 100%;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .st-input::placeholder { color: var(--slate-light); }
        .st-input:focus {
          border-color: var(--brand); background: var(--white);
          box-shadow: 0 0 0 3px rgba(26,86,219,0.10);
        }
        select.st-input { cursor: pointer; }

        .st-hint {
          font-size: 12px; color: var(--slate-light);
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: 8px; padding: 10px 14px; margin-bottom: 4px;
          line-height: 1.6;
        }

        /* BUTTONS */
        .st-btn {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 13px; font-weight: 600;
          border: none; border-radius: 9px;
          padding: 8px 16px; cursor: pointer;
          transition: all 0.15s;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .st-btn-primary {
          background: var(--brand); color: white;
          box-shadow: 0 2px 6px rgba(26,86,219,0.2);
        }
        .st-btn-primary:hover { background: #1140b8; transform: translateY(-1px); }
        .st-btn-ghost {
          background: var(--surface); color: var(--ink);
          border: 1.5px solid var(--border);
        }
        .st-btn-ghost:hover { border-color: var(--ink); }
        .st-btn-danger {
          background: var(--red-light); color: var(--red);
        }
        .st-btn-danger:hover { background: #fecaca; }
        .st-btn-excel {
          background: var(--green-light); color: var(--green);
          cursor: pointer;
        }
        .st-btn-excel:hover { background: #bbf7d0; }

        /* SEARCH ROW */
        .st-search-row {
          display: flex; flex-wrap: wrap; gap: 10px;
          margin-bottom: 20px; align-items: center;
        }
        .st-search-input {
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 13px; color: var(--ink);
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: var(--radius); padding: 8px 13px;
          outline: none; flex: 1; min-width: 180px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .st-search-input::placeholder { color: var(--slate-light); }
        .st-search-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(26,86,219,0.10);
          background: var(--white);
        }

        /* SELECT STUDENT */
        .st-select-hint {
          display: flex; align-items: center; gap: 10px;
          background: var(--brand-light);
          border: 1px solid rgba(26,86,219,0.15);
          border-radius: var(--radius-lg); padding: 14px 18px;
          font-size: 13px; color: var(--brand); font-weight: 500;
        }
        .st-select-hint-icon { font-size: 16px; }
        .st-loading-row {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--slate-light);
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 999px;
          padding: 6px 12px;
          margin-left: auto;
        }
        .st-loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
          animation: st-pulse 1.2s infinite ease-in-out;
        }
        @keyframes st-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        .st-skeleton {
          background: linear-gradient(90deg, #eef1f6 25%, #f7f8fb 37%, #eef1f6 63%);
          background-size: 400% 100%;
          animation: st-skeleton 1.3s ease infinite;
          border-radius: 10px;
          height: 36px;
        }
        .st-skeleton-row { height: 44px; }
        @keyframes st-skeleton {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }

        /* EDIT FORM */
        .st-edit-card {
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 20px; margin-bottom: 16px;
        }
        .st-edit-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;
        }
        .st-edit-actions {
          display: flex; gap: 8px; flex-wrap: wrap;
          padding-top: 14px; border-top: 1px solid var(--border-light);
        }

        /* DETAIL GRID */
        .st-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .st-detail-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow: hidden;
        }
        .st-detail-header {
          padding: 14px 18px 12px; border-bottom: 1px solid var(--border-light);
          font-size: 13px; font-weight: 600; color: var(--ink);
          display: flex; align-items: center; gap: 7px;
        }
        .st-detail-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand); }
        .st-detail-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; }

        .st-ach-item {
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: var(--radius); padding: 12px 14px;
        }
        .st-ach-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .st-ach-title { font-size: 13px; font-weight: 600; color: var(--ink); }
        .st-ach-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
        .st-meta-pill {
          font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--slate-light); background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: 100px; padding: 2px 8px;
        }
        .st-ach-btn {
          font-size: 11px; font-weight: 600; color: var(--brand);
          background: var(--brand-light); border: none;
          border-radius: 7px; padding: 5px 10px; cursor: pointer;
          transition: background 0.15s; white-space: nowrap;
        }
        .st-ach-btn:hover { background: rgba(26,86,219,0.15); }

        .st-doc-item {
          display: flex; align-items: center; gap: 10px;
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: var(--radius); padding: 10px 14px;
        }
        .st-doc-icon {
          width: 32px; height: 32px; border-radius: 7px;
          background: var(--white); border: 1px solid var(--border-light);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .st-doc-info { flex: 1; min-width: 0; }
        .st-doc-title { font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .st-doc-type { font-size: 11px; color: var(--slate-light); margin-top: 1px; }
        .st-doc-btn {
          font-size: 12px; font-weight: 600; color: var(--brand);
          background: var(--brand-light); border: none;
          border-radius: 7px; padding: 5px 10px; cursor: pointer;
          transition: background 0.15s; flex-shrink: 0;
        }
        .st-doc-btn:hover { background: rgba(26,86,219,0.15); }

        .st-empty { font-size: 13px; color: var(--slate-light); padding: 12px 0; text-align: center; }

        @media (max-width: 700px) {
          .st-form-grid, .st-edit-form-grid, .st-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="st-wrap">
        <DashboardShell
          title="Admin dashboard"
          subtitle="Add, edit, search, and remove student profiles."
          nav={[
            { label: "Overview", href: "/admin" },
            { label: "Students", href: "/admin/students" },
            { label: "Student achievements", href: "/admin/student-achievements" },
            { label: "Approvals", href: "/admin/approvals" },
            { label: "Analytics", href: "/admin/analytics" },
            { label: "Reports", href: "/admin/reports" },
          ]}
        >
          {/* PAGE HEADER */}
          <div className="st-page-header">
            <div>
              <div className="st-breadcrumb">
                <span>Admin</span><span>›</span>
                <span style={{ color: "var(--ink)" }}>Students</span>
              </div>
              <h1 className="st-page-title">Student <em>management</em></h1>
              <p className="st-page-sub">Add, edit, search, and remove student profiles.</p>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="st-tabs">
            <button
              className={`st-tab${activeTab === "add" ? " active" : ""}`}
              type="button"
              onClick={() => setActiveTab("add")}
            >
              + Add student
            </button>
            <button
              className={`st-tab${activeTab === "manage" ? " active" : ""}`}
              type="button"
              onClick={() => setActiveTab("manage")}
            >
              Manage students
            </button>
          </div>

          {/* ── ADD TAB ── */}
          {activeTab === "add" ? (
            <div className="st-card">
              <div className="st-card-header">
                <span className="st-card-title">
                  <span className="st-card-title-dot" />
                  Add new student
                </span>
                <label className="st-btn st-btn-excel">
                  ↑ Upload Excel
                  <input
                    className="hidden"
                    type="file"
                    accept=".xlsx"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setBulkMessage("Uploading Excel...");
                      const rows = await readExcelFile(file);
                      await api("/admin/students/bulk", { method: "POST", token, body: JSON.stringify({ rows }) });
                      setBulkMessage("Bulk upload completed.");
                      event.target.value = "";
                      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
                    }}
                  />
                </label>
              </div>
              <div className="st-card-body">
                {bulkMessage ? <Alert tone="success">{bulkMessage}</Alert> : null}
                {formError ? <Alert tone="error">{formError}</Alert> : null}
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setFormError("");
                    const formEl = event.currentTarget;
                    const formData = new FormData(formEl);
                    await createMutation.mutateAsync({
                      name: formData.get("name"),
                      email: formData.get("email"),
                      password: formData.get("password"),
                      studentId: formData.get("studentId"),
                      department: formData.get("department"),
                      program: formData.get("program"),
                      admissionCategory: formData.get("admissionCategory"),
                      year: Number(formData.get("year")),
                      semester: Number(formData.get("semester")),
                      graduationYear: formData.get("graduationYear") ? Number(formData.get("graduationYear")) : undefined,
                      phone: formData.get("phone"),
                    });
                    formEl.reset();
                  }}
                >
                  <div className="st-form-grid">
                    <div className="st-field">
                      <label className="st-label">Full name</label>
                      <input className="st-input" name="name" placeholder="e.g. Ananya Sharma" required />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Email</label>
                      <input className="st-input" name="email" type="email" placeholder="e.g. ananya@example.edu" required />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Temporary password</label>
                      <input className="st-input" name="password" type="password" placeholder="Set a temporary password" required />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Registration number</label>
                      <input className="st-input" name="studentId" placeholder="e.g. 231FA04023" required />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Department</label>
                      <input className="st-input" name="department" placeholder="e.g. Computer Science" required />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Program</label>
                      <input className="st-input" name="program" placeholder="e.g. B.Tech" required />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Admission category</label>
                      <input className="st-input" name="admissionCategory" placeholder="e.g. EAMCET / JEE / VSAT" />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Phone number</label>
                      <input className="st-input" name="phone" placeholder="e.g. 9876543210" />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Year</label>
                      <select className="st-input" name="year" required>
                        {[1, 2, 3, 4].map((year) => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="st-field">
                      <label className="st-label">Semester</label>
                      <select className="st-input" name="semester" required>
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                      </select>
                    </div>
                    <div className="st-field">
                      <label className="st-label">Graduation year</label>
                      <input className="st-input" name="graduationYear" type="number" placeholder="e.g. 2027" />
                    </div>
                  </div>
                  <p className="st-hint">
                    Excel headers supported: <code>name</code>, <code>email</code>, <code>studentId</code>, <code>department</code>, <code>program</code>, <code>admissionCategory</code>, <code>year</code>, <code>semester</code>, <code>graduationYear</code>, <code>phone</code>, <code>cgpa</code>, <code>password</code>. Registration number example: <code>231FA04023</code>.
                  </p>
                  <button className="st-btn st-btn-primary" type="submit">
                    Create student →
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* ── MANAGE TAB ── */
            <div className="st-card">
            <div className="st-card-header">
              <span className="st-card-title">
                <span className="st-card-title-dot" />
                Manage students
              </span>
              {isFetching ? (
                <span className="st-loading-row">
                  <span className="st-loading-dot" />
                  Updating list...
                </span>
              ) : null}
              <label className="st-btn st-btn-excel">
                  ↑ Bulk update
                  <input
                    className="hidden"
                    type="file"
                    accept=".xlsx"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setBulkMessage("Uploading Excel...");
                      const rows = await readExcelFile(file);
                      await api("/admin/students/bulk", { method: "PUT", token, body: JSON.stringify({ rows }) });
                      setBulkMessage("Bulk update completed.");
                      event.target.value = "";
                      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
                    }}
                  />
                </label>
              </div>
              <div className="st-card-body">
                {/* SEARCH */}
                <div className="st-search-row">
                  <input
                    className="st-search-input"
                    placeholder="Search by registration number"
                    value={search}
                    onChange={(event) => { setSearch(event.target.value); setSelectedStudentId(""); }}
                  />
                  <input
                    className="st-search-input"
                    placeholder="Filter by department"
                    value={department}
                    onChange={(event) => { setDepartment(event.target.value); setSelectedStudentId(""); }}
                  />
                </div>

                {/* SELECT */}
                <div className="st-field" style={{ marginBottom: 16 }}>
                  <label className="st-label">Select student</label>
                  {isLoading ? (
                    <div className="st-skeleton st-skeleton-row" />
                  ) : (
                    <select
                    className="st-input"
                    value={selectedStudentId}
                    onChange={(event) => setSelectedStudentId(event.target.value)}
                  >
                    <option value="">Choose a student</option>
                    {filteredStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.studentId} — {student.fullName}
                      </option>
                    ))}
                    </select>
                  )}
                </div>

                {error ? <Alert tone="error">Unable to load students. Please refresh.</Alert> : null}
                {saveMessage ? <Alert tone="success">{saveMessage}</Alert> : null}
                {bulkMessage ? <Alert tone="success">{bulkMessage}</Alert> : null}

                {!isLoading && filteredStudents.length === 0 ? (
                  <div className="st-select-hint">
                    <span className="st-select-hint-icon">ðŸ”Ž</span>
                    No students match your search. Try clearing filters.
                  </div>
                ) : selectedStudentId ? (
                  <>
                    {selectedStudent ? (
                      <div className="st-edit-card" key={selectedStudent._id}>
                        <form
                          onSubmit={async (event) => {
                            event.preventDefault();
                            setSaveMessage("");
                            const formData = new FormData(event.currentTarget);
                            await updateMutation.mutateAsync({
                              id: selectedStudent._id,
                              values: {
                                fullName: formData.get("fullName"),
                                email: formData.get("email"),
                                department: formData.get("department"),
                                program: formData.get("program"),
                                admissionCategory: formData.get("admissionCategory"),
                                year: Number(formData.get("year")),
                                semester: Number(formData.get("semester")),
                                graduationYear: formData.get("graduationYear") ? Number(formData.get("graduationYear")) : undefined,
                                cgpa: Number(formData.get("cgpa")),
                                phone: formData.get("phone"),
                              },
                            });
                          }}
                        >
                          <div className="st-edit-form-grid">
                            <div className="st-field">
                              <label className="st-label">Full name</label>
                              <input className="st-input" name="fullName" defaultValue={selectedStudent.fullName} placeholder="e.g. Ananya Sharma" />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Email</label>
                              <input className="st-input" name="email" defaultValue={selectedStudent.email} placeholder="e.g. ananya@example.edu" />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Department</label>
                              <input className="st-input" name="department" defaultValue={selectedStudent.department} placeholder="e.g. Computer Science" />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Program</label>
                              <input className="st-input" name="program" defaultValue={selectedStudent.program} placeholder="e.g. B.Tech" />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Admission category</label>
                              <input className="st-input" name="admissionCategory" defaultValue={selectedStudent.admissionCategory ?? ""} placeholder="e.g. EAMCET / JEE / VSAT" />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Year</label>
                              <select className="st-input" name="year" defaultValue={selectedStudent.year}>
                                {[1, 2, 3, 4].map((year) => (
                                  <option key={year} value={year}>Year {year}</option>
                                ))}
                              </select>
                            </div>
                            <div className="st-field">
                              <label className="st-label">Semester</label>
                              <select className="st-input" name="semester" defaultValue={selectedStudent.semester}>
                                <option value={1}>Semester 1</option>
                                <option value={2}>Semester 2</option>
                              </select>
                            </div>
                            <div className="st-field">
                              <label className="st-label">CGPA</label>
                              <input className="st-input" name="cgpa" type="number" step="0.01" defaultValue={selectedStudent.cgpa ?? ""} placeholder="e.g. 8.4" />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Graduation year</label>
                              <input className="st-input" name="graduationYear" type="number" defaultValue={selectedStudent.graduationYear ?? ""} placeholder="e.g. 2027" />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Phone</label>
                              <input className="st-input" name="phone" defaultValue={selectedStudent.phone ?? ""} placeholder="e.g. 9876543210" />
                            </div>
                          </div>
                          <div className="st-edit-actions">
                            <button className="st-btn st-btn-primary" type="submit">Save changes</button>
                            <button
                              className="st-btn st-btn-danger"
                              type="button"
                              onClick={() => deleteMutation.mutate(selectedStudent._id)}
                            >
                              Remove student
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : null}

                    {selectedData ? (
                      <div className="st-detail-grid">
                        {/* ACHIEVEMENTS */}
                        <div className="st-detail-card">
                          <div className="st-detail-header">
                            <span className="st-detail-dot" />
                            Achievement history
                          </div>
                          <div className="st-detail-body">
                            {(selectedData.achievements || []).length === 0 ? (
                              <p className="st-empty">No achievements recorded.</p>
                            ) : (
                              selectedData.achievements.map((item: any) => (
                                <div className="st-ach-item" key={item._id}>
                                  <div className="st-ach-actions">
                                    <div className="st-ach-title">{item.title}</div>
                                    {item.certificateUrl ? (
                                      <button
                                        className="st-ach-btn"
                                        type="button"
                                        onClick={() => window.open(item.certificateUrl, "_blank", "noopener,noreferrer")}
                                      >
                                        View
                                      </button>
                                    ) : null}
                                  </div>
                                  <div className="st-ach-meta">
                                    <span className="st-meta-pill">{item.category}</span>
                                    <span className="st-meta-pill">{item.academicYear || "N/A"}</span>
                                    <span className="st-meta-pill">Sem {item.semester || "-"}</span>
                                    {item.activityType && <span className="st-meta-pill">{item.activityType}</span>}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* DOCUMENTS */}
                        <div className="st-detail-card">
                          <div className="st-detail-header">
                            <span className="st-detail-dot" />
                            Uploaded documents
                          </div>
                          <div className="st-detail-body">
                            {(selectedData.documents || []).length === 0 ? (
                              <p className="st-empty">No documents uploaded.</p>
                            ) : (
                              selectedData.documents.map((item: any) => (
                                <div className="st-doc-item" key={item._id}>
                                  <div className="st-doc-icon">📄</div>
                                  <div className="st-doc-info">
                                    <div className="st-doc-title">{item.title}</div>
                                    <div className="st-doc-type">{item.type}</div>
                                  </div>
                                  <button
                                    className="st-doc-btn"
                                    type="button"
                                    onClick={() => downloadMutation.mutate(item._id)}
                                  >
                                    View →
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="st-select-hint">
                    <span className="st-select-hint-icon">🔍</span>
                    Search by registration number and select a student to edit.
                  </div>
                )}
              </div>
            </div>
          )}
        </DashboardShell>
      </div>
    </>
  );
}
