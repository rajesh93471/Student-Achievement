"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { uploadStudentFile } from "@/lib/uploads";
import { Select } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

export interface AchievementFormValues {
  title: string;
  description?: string;
  category: string;
  date?: string;
  academicYear?: string;
  semester?: number;
  organizedBy?: string;
  position?: string;
}

const DEFAULT_ACHIEVEMENT_DATE = new Date().toISOString().slice(0, 10);
const ACHIEVEMENT_STREAMS = ["technical", "non-technical"] as const;
const ORGANIZED_BY_OPTIONS = ["University", "NO / Outside Campus"] as const;
const ACADEMIC_YEAR_OPTIONS = [
  { value: "Year 1", label: "I" },
  { value: "Year 2", label: "II" },
  { value: "Year 3", label: "III" },
  { value: "Year 4", label: "IV" },
] as const;
const POSITION_OPTIONS = [
  "Winner",
  "Runner",
  "1st Runner",
  "2nd Runner",
  "1st Prize",
  "2nd Prize",
  "3rd Prize",
  "Participation",
  "Appreciation",
  "Round 1",
  "Round 2",
  "Round 3",
  "Finalist",
  "Semi Finalist",
  "Quarter Finalist",
  "Top 10",
  "Top 5",
  "Merit",
  "Special Mention",
  "Best Performer",
  "Consolation",
] as const;
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
    { value: "other-technical", label: "Other" },
  ],
  "non-technical": [
    { value: "sports", label: "Sports" },
    { value: "cultural", label: "Cultural" },
    { value: "club", label: "Club" },
    { value: "leadership", label: "Leadership" },
    { value: "volunteering", label: "Volunteering" },
    { value: "social-service", label: "Social Service" },
    { value: "nss", label: "NSS" },
    { value: "ncc", label: "NCC" },
    { value: "entrepreneurship", label: "Entrepreneurship" },
    { value: "arts", label: "Arts" },
    { value: "literary", label: "Literary" },
    { value: "public-speaking", label: "Public Speaking" },
    { value: "community", label: "Community Engagement" },
    { value: "other-non-technical", label: "Other" },
  ],
} as const;

type AchievementStream = (typeof ACHIEVEMENT_STREAMS)[number];

/* ─── Field label wrapper ─────────────────────────────────────────────────── */
function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block w-full text-left">
      {children}
    </label>
  );
}

function Label({ text }: { text: string }) {
  return (
    <span className="block font-sans text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
      {text}
    </span>
  );
}

const inputClasses = "w-full bg-white border border-surface-300 rounded-xl px-4 py-3 text-ink font-sans text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-surface-50 disabled:text-slate-500 disabled:cursor-not-allowed";

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
  const safeDefaultAchievementDate = DEFAULT_ACHIEVEMENT_DATE || "";
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedStream, setSelectedStream] = useState<AchievementStream>("technical");
  const [step, setStep] = useState<1 | 2>(1);
  const [submitError, setSubmitError] = useState<string>("");
  const buildFormDefaults = (stream: AchievementStream, dateValue = safeDefaultAchievementDate) => ({
    title: "",
    description: "",
    category: CATEGORY_OPTIONS[stream][0].value,
    date: dateValue,
    academicYear: defaultAcademicYear,
    semester: defaultSemester,
    organizedBy: ORGANIZED_BY_OPTIONS[0],
    position: POSITION_OPTIONS[0],
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<AchievementFormValues>({
    defaultValues: buildFormDefaults("technical"),
  });
  const achievementDate = watch("date") || safeDefaultAchievementDate;

  useEffect(() => {
    if (defaultAcademicYear !== undefined) {
      setValue("academicYear", defaultAcademicYear);
    }
    if (defaultSemester !== undefined) {
      setValue("semester", defaultSemester);
    }
  }, [defaultAcademicYear, defaultSemester, setValue]);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError("");
        try {
          const certInput = document.getElementById("achievement-certificate") as HTMLInputElement | null;
          const file = certInput?.files?.[0];
          if (!file) {
            setSubmitError("Please upload an achievement certificate before saving.");
            return;
          }
          const payloadBase: AchievementFormValues = {
            ...values,
            title: values.title?.trim() || "",
            description: values.description?.trim() || "",
            date: achievementDate || safeDefaultAchievementDate,
            academicYear: values.academicYear || defaultAcademicYear,
            semester: values.semester ?? defaultSemester,
            organizedBy: values.organizedBy || ORGANIZED_BY_OPTIONS[0],
            position: values.position || POSITION_OPTIONS[0],
          };
          let payload: AchievementFormValues & { certificateUrl?: string; certificateKey?: string } = payloadBase;

          if (file && token) {
            setUploadMessage("Uploading certificate...");
            const uploaded = await uploadStudentFile({
              file,
              token,
              apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
            });
            payload = { ...payloadBase, certificateUrl: uploaded.fileUrl, certificateKey: uploaded.fileKey };
            setUploadMessage("Uploaded certificate.");
          }

          await onSubmit(payload);
          reset({
            title: "",
            description: "",
            category: CATEGORY_OPTIONS.technical[0].value,
            date: safeDefaultAchievementDate,
            academicYear: defaultAcademicYear,
            semester: defaultSemester,
            organizedBy: ORGANIZED_BY_OPTIONS[0],
            position: POSITION_OPTIONS[0],
          });
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
      <div className="flex gap-2">
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? "bg-brand-600" : "bg-surface-200"}`} />
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? "bg-brand-600" : "bg-surface-200"}`} />
      </div>

      {step === 1 ? (
        <div className="flex flex-col gap-6 animate-fade-up">
          <FieldLabel>
            <Label text="Date of achievement" />
            <input
              className={inputClasses}
              type="date"
              {...register("date")}
            />
          </FieldLabel>

          <FieldLabel>
            <Label text="Achievement type" />
            <Select
              value={selectedStream}
              onChange={(event) => {
                const stream = event.target.value as AchievementStream;
                setSelectedStream(stream);
                reset(buildFormDefaults(stream, achievementDate));
              }}
            >
              {ACHIEVEMENT_STREAMS.map((stream) => (
                <option key={stream} value={stream}>
                  {stream === "technical" ? "Technical" : "Non-technical"}
                </option>
              ))}
            </Select>
          </FieldLabel>

          <FieldLabel>
            <Label text={selectedStream === "technical" ? "Technical achievement" : "Non-technical achievement"} />
            <Select
              {...register("category", { required: true })}
            >
              {CATEGORY_OPTIONS[selectedStream].map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </FieldLabel>

          <button
            type="button"
            className="w-full bg-brand-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-md transition-all mt-4"
            onClick={() => setStep(2)}
          >
            Next Step
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-fade-up">
          {/* Title */}
          <FieldLabel>
            <Label text="Title" />
            <input
              className={inputClasses}
              placeholder="e.g. National Hackathon Finalist"
              {...register("title", { required: true })}
            />
          </FieldLabel>

          {/* Description */}
          <FieldLabel>
            <Label text="Description" />
            <textarea
              className={`${inputClasses} min-h-[88px] resize-y`}
              placeholder="Optional: describe the achievement in 1-2 sentences"
              {...register("description")}
            />
          </FieldLabel>

          {/* Academic year + Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldLabel>
              <Label text="Academic year" />
              <Select
                {...register("academicYear")}
                disabled
                title="Auto-filled from your profile"
              >
                {ACADEMIC_YEAR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FieldLabel>
            <FieldLabel>
              <Label text="Semester" />
              <Select
                {...register("semester", { valueAsNumber: true })}
                disabled
                title="Auto-filled from your profile"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </Select>
            </FieldLabel>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldLabel>
              <Label text="Organized by" />
              <Select
                {...register("organizedBy")}
              >
                {ORGANIZED_BY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </FieldLabel>
            <FieldLabel>
              <Label text="Position" />
              <Select
                {...register("position")}
              >
                {POSITION_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </FieldLabel>
          </div>

          {/* Certificate upload drop zone */}
          <div>
            <Label text="Certificate upload" />
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? "border-brand-500 bg-brand-50/50" : "border-surface-300 bg-surface-50 hover:bg-surface-100 hover:border-surface-400"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={() => setIsDragging(false)}
            >
              <input
                id="achievement-certificate"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  setSelectedFileName(file ? file.name : "");
                }}
              />
              <p className={`font-display text-lg font-bold mb-2 transition-colors ${isDragging ? "text-brand-600" : "text-slate-600"}`}>
                {isDragging ? "Drop it here" : "Drag & drop or click to browse"}
              </p>
              <p className="font-sans text-sm text-slate-500">
                PDF &bull; JPG &bull; PNG &bull; max 5 MB &bull; required
              </p>
            </div>
            {selectedFileName && (
              <p className="text-sm font-semibold text-brand-700 mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span> {selectedFileName}
              </p>
            )}
            {uploadMessage && (
              <p className={`text-sm mt-3 font-medium ${uploadMessage.startsWith("Uploaded") ? "text-emerald-600" : "text-slate-500"}`}>
                {uploadMessage}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              type="button"
              className="flex-1 bg-white border border-surface-300 text-slate-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-surface-50 transition-colors"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              Save achievement
            </button>
          </div>
          {submitError && (
            <p className="text-sm font-medium text-red-600 text-center bg-red-50 py-2 rounded-lg mt-2 border border-red-100">
              {submitError}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
