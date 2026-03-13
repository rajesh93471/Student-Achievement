"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { uploadStudentFile } from "@/lib/uploads";

export interface AchievementFormValues {
  title: string;
  description: string;
  date: string;
  category: string;
  academicYear?: string;
  semester?: number;
  activityType?: string;
}

export function AchievementForm({
  onSubmit,
  token,
}: {
  onSubmit: (values: AchievementFormValues) => Promise<unknown>;
  token: string | null;
}) {
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const { register, handleSubmit, reset } = useForm<AchievementFormValues>({
    defaultValues: { category: "hackathon" },
  });

  return (
    <form
      className="card grid gap-4 p-6"
      onSubmit={handleSubmit(async (values) => {
        const certificateInput = document.getElementById("achievement-certificate") as HTMLInputElement | null;
        const file = certificateInput?.files?.[0];
        let payload: AchievementFormValues & { certificateUrl?: string; certificateKey?: string } = values;

        if (file && token) {
          setUploadMessage("Uploading certificate...");
          const uploaded = await uploadStudentFile({
            file,
            token,
            apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
          });
          payload = {
            ...values,
            certificateUrl: uploaded.fileUrl,
            certificateKey: uploaded.fileKey,
          };
          setUploadMessage("Certificate uploaded successfully.");
        }

        await onSubmit(payload);
        reset();
        if (certificateInput) {
          certificateInput.value = "";
        }
      })}
    >
      <h3 className="text-lg font-semibold">Add achievement</h3>
      <label className="text-sm font-medium text-slate">
        Title
        <input className="input mt-2" placeholder="e.g. National Hackathon Finalist" {...register("title", { required: true })} />
      </label>
      <label className="text-sm font-medium text-slate">
        Description
        <textarea className="input mt-2 min-h-28" placeholder="Describe the achievement in 1-2 sentences" {...register("description", { required: true })} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate">
          Date
          <input className="input mt-2" type="date" {...register("date", { required: true })} />
        </label>
        <label className="text-sm font-medium text-slate">
          Category
          <select className="input mt-2" {...register("category", { required: true })}>
            {["academic", "hackathon", "competition", "olympiad", "certification", "internship", "project", "sports", "cultural", "club", "research"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-slate">
          Academic year
          <input className="input mt-2" placeholder="e.g. 2024-2025" {...register("academicYear")} />
        </label>
        <label className="text-sm font-medium text-slate">
          Semester
          <input className="input mt-2" type="number" min={1} max={12} placeholder="e.g. 6" {...register("semester", { valueAsNumber: true })} />
        </label>
        <label className="text-sm font-medium text-slate">
          Activity type
          <input className="input mt-2" placeholder="e.g. Hackathon / Workshop / Sports" {...register("activityType")} />
        </label>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-200 bg-sky/30 p-4">
        <label className="block text-sm font-medium text-ink" htmlFor="achievement-certificate">
          Certificate upload
        </label>
        <input className="mt-3 block w-full text-sm" id="achievement-certificate" type="file" accept=".pdf,.png,.jpg,.jpeg" />
        <p className="mt-2 text-xs text-slate">Supported formats: PDF, JPG, PNG. Maximum size: 5MB.</p>
        {uploadMessage ? <p className="mt-2 text-sm text-slate">{uploadMessage}</p> : null}
      </div>
      <button className="btn-primary" type="submit">
        Save achievement
      </button>
    </form>
  );
}
