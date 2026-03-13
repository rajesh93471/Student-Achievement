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
  const { data } = useQuery({
    queryKey: ["admin-students", search, department],
    queryFn: () =>
      api<{ students: any[] }>(
        `/students?search=${encodeURIComponent(search)}&department=${encodeURIComponent(department)}`,
        { token }
      ),
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
      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
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
      if (payload?.downloadUrl) {
        window.open(payload.downloadUrl, "_blank", "noopener,noreferrer");
      }
    },
  });

  const selectedStudent = (data?.students || []).find((student) => student._id === selectedStudentId);

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Add, edit, search, and remove student profiles."
      nav={[
        { label: "Overview", href: "/admin" },
        { label: "Students", href: "/admin/students" },
        { label: "Approvals", href: "/admin/approvals" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <button
            className={activeTab === "add" ? "btn-primary" : "btn-secondary"}
            type="button"
            onClick={() => setActiveTab("add")}
          >
            Add student
          </button>
          <button
            className={activeTab === "manage" ? "btn-primary" : "btn-secondary"}
            type="button"
            onClick={() => setActiveTab("manage")}
          >
            Manage students
          </button>
        </div>
      </div>

      {activeTab === "add" ? (
        <form
          className="card grid gap-4 p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
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
              phone: formData.get("phone"),
            });
            event.currentTarget.reset();
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Add student</h2>
            <label className="btn-secondary cursor-pointer">
              Upload Excel
              <input
                className="hidden"
                type="file"
                accept=".xlsx"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setBulkMessage("Uploading Excel...");
                  const rows = await readExcelFile(file);
                  await api("/admin/students/bulk", {
                    method: "POST",
                    token,
                    body: JSON.stringify({ rows }),
                  });
                  setBulkMessage("Bulk upload completed.");
                  event.target.value = "";
                  await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
                }}
              />
            </label>
          </div>
          {bulkMessage ? <Alert tone="success">{bulkMessage}</Alert> : null}
          <label className="text-sm font-medium text-slate">
            Full name
            <input className="input mt-2" name="name" placeholder="e.g. Ananya Sharma" required />
          </label>
          <label className="text-sm font-medium text-slate">
            Email
            <input className="input mt-2" name="email" type="email" placeholder="e.g. ananya@example.edu" required />
          </label>
          <label className="text-sm font-medium text-slate">
            Temporary password
            <input className="input mt-2" name="password" type="password" placeholder="Set a temporary password" required />
          </label>
          <label className="text-sm font-medium text-slate">
            Student ID
            <input className="input mt-2" name="studentId" placeholder="e.g. CSE2023001" required />
          </label>
          <label className="text-sm font-medium text-slate">
            Department
            <input className="input mt-2" name="department" placeholder="e.g. Computer Science" required />
          </label>
          <label className="text-sm font-medium text-slate">
            Program
            <input className="input mt-2" name="program" placeholder="e.g. B.Tech CSE" required />
          </label>
          <label className="text-sm font-medium text-slate">
            Admission category
            <input className="input mt-2" name="admissionCategory" placeholder="e.g. EAMCET / JEE / VSAT" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate">
              Year
              <input className="input mt-2" name="year" type="number" min={1} max={6} placeholder="e.g. 3" required />
            </label>
            <label className="text-sm font-medium text-slate">
              Semester
              <input className="input mt-2" name="semester" type="number" min={1} max={12} placeholder="e.g. 6" required />
            </label>
          </div>
          <label className="text-sm font-medium text-slate">
            Phone number
            <input className="input mt-2" name="phone" placeholder="e.g. 9876543210" />
          </label>
          <p className="text-xs text-slate">
            Excel headers supported: `name`, `email`, `studentId`, `department`, `program`, `admissionCategory`, `year`, `semester`, `phone`, `cgpa`, `password`.
          </p>
          <button className="btn-primary" type="submit">
            Create student
          </button>
        </form>
      ) : (
        <div className="card p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Manage students</h2>
              <div className="flex w-full flex-wrap gap-3 md:w-auto">
                <input
                  className="input md:w-72"
                  placeholder="Search by registration number"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSelectedStudentId("");
                  }}
                />
                <input
                  className="input md:w-52"
                  placeholder="Filter by department"
                  value={department}
                  onChange={(event) => {
                    setDepartment(event.target.value);
                    setSelectedStudentId("");
                  }}
                />
                <label className="btn-secondary cursor-pointer">
                  Upload Excel
                  <input
                    className="hidden"
                    type="file"
                    accept=".xlsx"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setBulkMessage("Uploading Excel...");
                      const rows = await readExcelFile(file);
                      await api("/admin/students/bulk", {
                        method: "PUT",
                        token,
                        body: JSON.stringify({ rows }),
                      });
                      setBulkMessage("Bulk update completed.");
                      event.target.value = "";
                      await queryClient.invalidateQueries({ queryKey: ["admin-students"] });
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <label className="text-sm font-medium text-slate">
              Select student
              <select
                className="input mt-2"
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
              >
                <option value="">Choose a student</option>
                {(data?.students || []).map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.studentId} - {student.fullName}
                  </option>
                ))}
              </select>
            </label>

            {saveMessage ? <Alert tone="success">{saveMessage}</Alert> : null}
            {bulkMessage ? <Alert tone="success">{bulkMessage}</Alert> : null}

            {selectedStudentId ? (
              <>
                {selectedStudent ? (
                  <form
                    className="rounded-2xl border border-slate-100 p-4"
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
                          cgpa: Number(formData.get("cgpa")),
                          phone: formData.get("phone"),
                        },
                      });
                    }}
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-sm font-medium text-slate">
                        Full name
                        <input className="input mt-2" name="fullName" defaultValue={selectedStudent.fullName} placeholder="e.g. Ananya Sharma" />
                      </label>
                      <label className="text-sm font-medium text-slate">
                        Email
                        <input className="input mt-2" name="email" defaultValue={selectedStudent.email} placeholder="e.g. ananya@example.edu" />
                      </label>
                      <label className="text-sm font-medium text-slate">
                        Department
                        <input className="input mt-2" name="department" defaultValue={selectedStudent.department} placeholder="e.g. Computer Science" />
                      </label>
                      <label className="text-sm font-medium text-slate">
                        Program
                        <input className="input mt-2" name="program" defaultValue={selectedStudent.program} placeholder="e.g. B.Tech CSE" />
                      </label>
                      <label className="text-sm font-medium text-slate">
                        Admission category
                        <input className="input mt-2" name="admissionCategory" defaultValue={selectedStudent.admissionCategory ?? ""} placeholder="e.g. EAMCET / JEE / VSAT" />
                      </label>
                      <label className="text-sm font-medium text-slate">
                        Year
                        <input className="input mt-2" name="year" type="number" defaultValue={selectedStudent.year} placeholder="e.g. 3" />
                      </label>
                      <label className="text-sm font-medium text-slate">
                        Semester
                        <input className="input mt-2" name="semester" type="number" defaultValue={selectedStudent.semester} placeholder="e.g. 6" />
                      </label>
                      <label className="text-sm font-medium text-slate">
                        CGPA
                        <input className="input mt-2" name="cgpa" type="number" step="0.01" defaultValue={selectedStudent.cgpa ?? ""} placeholder="e.g. 8.4" />
                      </label>
                      <label className="text-sm font-medium text-slate">
                        Phone
                        <input className="input mt-2" name="phone" defaultValue={selectedStudent.phone ?? ""} placeholder="e.g. 9876543210" />
                      </label>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button className="btn-primary" type="submit">
                        Save
                      </button>
                      <button className="btn-secondary" type="button" onClick={() => deleteMutation.mutate(selectedStudent._id)}>
                        Remove
                      </button>
                    </div>
                  </form>
                ) : null}
                {selectedData ? (
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <h3 className="text-base font-semibold">Achievement history</h3>
                      <div className="mt-3 space-y-3 text-sm text-slate">
                        {(selectedData.achievements || []).length === 0 ? (
                          <p>No achievements recorded.</p>
                        ) : (
                          selectedData.achievements.map((item: any) => (
                            <div key={item._id} className="rounded-xl border border-slate-100 p-3">
                              <p className="font-semibold text-ink">{item.title}</p>
                              <p className="mt-1 text-xs uppercase tracking-wide text-slate">
                                {item.category} | {item.academicYear || "Academic year N/A"} | Semester {item.semester || "-"}
                              </p>
                              <p className="mt-1 text-xs text-slate">{item.activityType || "Activity type not set"}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <h3 className="text-base font-semibold">Uploaded documents</h3>
                      <div className="mt-3 space-y-3 text-sm text-slate">
                        {(selectedData.documents || []).length === 0 ? (
                          <p>No documents uploaded.</p>
                        ) : (
                          selectedData.documents.map((item: any) => (
                            <div key={item._id} className="rounded-xl border border-slate-100 p-3">
                              <p className="font-semibold text-ink">{item.title}</p>
                              <p className="mt-1 text-xs text-slate">{item.type}</p>
                              <button
                                className="mt-2 inline-flex text-sm font-medium text-coral"
                                type="button"
                                onClick={() => downloadMutation.mutate(item._id)}
                              >
                                View file
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
              <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
                Search by registration number and select a student to edit.
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
