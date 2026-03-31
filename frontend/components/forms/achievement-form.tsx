"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { uploadStudentFile } from "@/lib/uploads";

export interface AchievementFormValues {
  title: string;
  description: string;
  category: string;
  date?: string;
  academicYear?: string;
  semester?: number;
  activityType?: string;
}

const YEAR_OPTIONS = Array.from({ length: 16 }, (_, index) => String(new Date().getFullYear() - index));
const ACHIEVEMENT_STREAMS = ["technical", "non-technical"] as const;
const CATEGORY_OPTIONS = {
  technical: [
    { value: "hackathon", label: "Hackathon" },
    { value: "competition", label: "Technical Competition" },
    { value: "olympiad", label: "Olympiad" },
    { value: "certification", label: "Certification" },
    { value: "internship", label: "Internship" },
    { value: "project", label: "Project" },
    { value: "research", label: "Research" },
    { value: "academic", label: "Academic" },
  ],
  "non-technical": [
    { value: "sports", label: "Sports" },
    { value: "cultural", label: "Cultural" },
    { value: "club", label: "Club" },
  ],
} as const;

type AchievementStream = (typeof ACHIEVEMENT_STREAMS)[number];

/* ─── Field label wrapper ─────────────────────────────────────────────────── */
function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block" }}>
      {children}
    </label>
  );
}

function Label({ text }: { text: string }) {
  return (
    <span style={{
      display: "block",
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: 8,
    }}>
      {text}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#0f172a",
  fontFamily: "'Inter', sans-serif",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  appearance: "none" as const,
  transition: "border-color 0.18s",
};

export function AchievementForm({
  onSubmit,
  token,
  defaultAcademicYear,
  defaultSemester,
}: {
  onSubmit: (values: AchievementFormValues) => Promise<unknown>;
  token: string | null;
  defaultAcademicYear?: string;
  defaultSemester?: number;
}) {
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [achievementYear, setAchievementYear] = useState<string>(YEAR_OPTIONS[0]);
  const [selectedStream, setSelectedStream] = useState<AchievementStream>("technical");
  const [step, setStep] = useState<1 | 2>(1);
  const [submitError, setSubmitError] = useState<string>("");

  const { register, handleSubmit, reset } = useForm<AchievementFormValues>({
    defaultValues: {
      category: CATEGORY_OPTIONS.technical[0].value,
      academicYear: defaultAcademicYear,
      semester: defaultSemester,
      date: `${YEAR_OPTIONS[0]}-01-01`,
    },
  });

  useEffect(() => {
    if (defaultAcademicYear || defaultSemester) {
      reset({
        category: CATEGORY_OPTIONS[selectedStream][0].value,
        academicYear: defaultAcademicYear,
        semester: defaultSemester,
        date: `${achievementYear}-01-01`,
      });
    }
  }, [achievementYear, defaultAcademicYear, defaultSemester, reset, selectedStream]);

  const getInputStyle = (name: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === name ? "#2563eb" : "#cbd5e1",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
  });

  const focusProps = (name: string) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField(null),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
        .ach-form-input::placeholder { color: #94a3b8; }
        .ach-form-input option { background: #ffffff; color: #0f172a; }
        .ach-form-input::-webkit-calendar-picker-indicator { filter: invert(0); }
      `}</style>

      <form
        style={{ display: "grid", gap: 18 }}
        onSubmit={handleSubmit(async (values) => {
          setSubmitError("");
          try {
            const certInput = document.getElementById("achievement-certificate") as HTMLInputElement | null;
            const file = certInput?.files?.[0];
            const payloadBase: AchievementFormValues = {
              ...values,
              date: `${achievementYear}-01-01`,
              academicYear: values.academicYear || defaultAcademicYear,
              semester: values.semester ?? defaultSemester,
            };
            let payload: AchievementFormValues & { certificateUrl?: string; certificateKey?: string } = payloadBase;

            if (file && token) {
              setUploadMessage("Uploading certificate...");
              const uploaded = await uploadStudentFile({
                file,
                token,
                apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
              });
              payload = { ...payloadBase, certificateUrl: uploaded.fileUrl, certificateKey: uploaded.fileKey };
              setUploadMessage("Uploaded certificate.");
            }

            await onSubmit(payload);
            reset({
              category: CATEGORY_OPTIONS.technical[0].value,
              academicYear: defaultAcademicYear,
              semester: defaultSemester,
              date: `${YEAR_OPTIONS[0]}-01-01`,
            });
            setAchievementYear(YEAR_OPTIONS[0]);
            setSelectedStream("technical");
            setStep(1);
            setUploadMessage("");
            setSelectedFileName("");
            if (certInput) certInput.value = "";
          } catch (error) {
            setUploadMessage("");
            setSubmitError(error instanceof Error ? error.message : "Unable to save achievement.");
          }
        })}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            background: step >= 1 ? "#1e3a8a" : "#cbd5e1",
          }} />
          <div style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            background: step >= 2 ? "#1e3a8a" : "#cbd5e1",
          }} />
        </div>

        {step === 1 ? (
          <>
            <FieldLabel>
              <Label text="Year of achievement" />
              <select
                className="ach-form-input"
                style={getInputStyle("achievementYear")}
                value={achievementYear}
                onChange={(event) => setAchievementYear(event.target.value)}
                {...focusProps("achievementYear")}
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel>
              <Label text="Achievement type" />
              <select
                className="ach-form-input"
                style={getInputStyle("achievementType")}
                value={selectedStream}
                onChange={(event) => {
                  const stream = event.target.value as AchievementStream;
                  setSelectedStream(stream);
                  reset({
                    title: "",
                    description: "",
                    category: CATEGORY_OPTIONS[stream][0].value,
                    academicYear: defaultAcademicYear,
                    semester: defaultSemester,
                    activityType: "",
                    date: `${achievementYear}-01-01`,
                  });
                }}
                {...focusProps("achievementType")}
              >
                {ACHIEVEMENT_STREAMS.map((stream) => (
                  <option key={stream} value={stream}>
                    {stream === "technical" ? "Technical" : "Non-technical"}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel>
              <Label text={selectedStream === "technical" ? "Technical achievement" : "Non-technical achievement"} />
              <select
                className="ach-form-input"
                style={getInputStyle("category")}
                {...register("category", { required: true })}
                {...focusProps("category")}
              >
                {CATEGORY_OPTIONS[selectedStream].map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FieldLabel>

            <button
              type="button"
              style={{
                background: "#1e3a8a",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </>
        ) : (
          <>
            {/* Title */}
            <FieldLabel>
              <Label text="Title" />
              <input
                className="ach-form-input"
                style={getInputStyle("title")}
                placeholder="e.g. National Hackathon Finalist"
                {...register("title", { required: true })}
                {...focusProps("title")}
              />
            </FieldLabel>

            {/* Description */}
            <FieldLabel>
              <Label text="Description" />
              <textarea
                className="ach-form-input"
                style={{ ...getInputStyle("description"), minHeight: 88, resize: "vertical" }}
                placeholder="Describe the achievement in 1-2 sentences"
                {...register("description", { required: true })}
                {...focusProps("description")}
              />
            </FieldLabel>

            {/* Academic year + Semester + Activity type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <FieldLabel>
                <Label text="Academic year" />
                <select
                  className="ach-form-input"
                  style={getInputStyle("academicYear")}
                  {...register("academicYear")}
                  {...focusProps("academicYear")}
                  disabled
                  title="Auto-filled from your profile"
                >
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                </select>
              </FieldLabel>
              <FieldLabel>
                <Label text="Semester" />
                <select
                  className="ach-form-input"
                  style={getInputStyle("semester")}
                  {...register("semester", { valueAsNumber: true })}
                  {...focusProps("semester")}
                  disabled
                  title="Auto-filled from your profile"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </FieldLabel>
              <FieldLabel>
                <Label text="Activity type" />
                <input
                  className="ach-form-input"
                  style={getInputStyle("activityType")}
                  placeholder="e.g. Workshop"
                  {...register("activityType")}
                  {...focusProps("activityType")}
                />
              </FieldLabel>
            </div>

            {/* Certificate upload drop zone */}
            <div>
              <Label text="Certificate upload" />
              <div
                style={{
                  position: "relative",
                  border: `1px dashed ${isDragging ? "#2563eb" : "#cbd5e1"}`,
                  borderRadius: 10,
                  padding: "20px 16px",
                  textAlign: "center",
                  background: isDragging ? "rgba(37,99,235,0.08)" : "#f8fafc",
                  transition: "border-color 0.2s, background 0.2s",
                  cursor: "pointer",
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={() => setIsDragging(false)}
              >
                <input
                  id="achievement-certificate"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{
                    position: "absolute", inset: 0,
                    opacity: 0, cursor: "pointer",
                    width: "100%", height: "100%",
                  }}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setSelectedFileName(file ? file.name : "");
                  }}
                />
                <p style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 16,
                  color: isDragging ? "#1e3a8a" : "#475569",
                  margin: "0 0 5px",
                  pointerEvents: "none",
                  transition: "color 0.2s",
                }}>
                  {isDragging ? "Drop it here" : "Drag & drop or click to browse"}
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: "#64748b",
                  margin: 0,
                  pointerEvents: "none",
                  letterSpacing: "0.04em",
                }}>
                  PDF - JPG - PNG - max 5 MB
                </p>
              </div>
              {selectedFileName ? (
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#1e3a8a",
                  margin: "8px 0 0",
                  letterSpacing: "0.02em",
                }}>
                  Selected file: {selectedFileName}
                </p>
              ) : null}

              {uploadMessage && (
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  marginTop: 8,
                  color: uploadMessage.startsWith("Uploaded") ? "#0f766e" : "#64748b",
                  letterSpacing: "0.03em",
                }}>
                  {uploadMessage}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                style={{
                  background: "#ffffff",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="submit"
                style={{
                  background: "#1e3a8a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  flex: 1,
                  transition: "background 0.18s, transform 0.15s, box-shadow 0.18s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "#1d4ed8";
                  el.style.transform = "translateY(-1px)";
                  el.style.boxShadow = "0 10px 28px rgba(37,99,235,0.25)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "#1e3a8a";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                Save achievement
              </button>
            </div>
            {submitError ? (
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#b91c1c",
                margin: "4px 0 0",
                letterSpacing: "0.02em",
              }}>
                {submitError}
              </p>
            ) : null}
          </>
        )}
      </form>
    </>
  );
}
