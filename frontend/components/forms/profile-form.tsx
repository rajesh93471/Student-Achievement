"use client";

import { useForm } from "react-hook-form";
import { StudentProfile } from "@/lib/types";

export function ProfileForm({
  profile,
  onSubmit,
}: {
  profile: StudentProfile;
  onSubmit: (values: Partial<StudentProfile>) => Promise<unknown>;
}) {
  const { register, handleSubmit } = useForm<StudentProfile>({ values: profile });

  return (
    <form className="card grid gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-lg font-semibold">Profile management</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="input" placeholder="Full Name" {...register("fullName")} />
        <input className="input" placeholder="Department" {...register("department")} />
        <input className="input" placeholder="Program" {...register("program")} />
        <input className="input" placeholder="Admission category (e.g. EAMCET)" {...register("admissionCategory")} />
        <input className="input" type="number" placeholder="Year" {...register("year", { valueAsNumber: true })} />
        <input className="input" type="number" placeholder="Semester" {...register("semester", { valueAsNumber: true })} />
        <input className="input" type="email" placeholder="Email" {...register("email")} />
        <input className="input" placeholder="Phone" {...register("phone")} />
        <input className="input" placeholder="Address" {...register("address")} />
        <input className="input" type="number" step="0.01" placeholder="CGPA" {...register("cgpa", { valueAsNumber: true })} />
        <input className="input" type="number" placeholder="Backlogs" {...register("backlogs", { valueAsNumber: true })} />
        <input className="input" placeholder="Profile photo URL" {...register("profilePhotoUrl")} />
      </div>
      <button className="btn-primary" type="submit">
        Update profile
      </button>
    </form>
  );
}
