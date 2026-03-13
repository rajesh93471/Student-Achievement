"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useAuth } from "@/components/layout/providers";
import { AuthUser } from "@/lib/types";

type SignUpValues = {
  name: string;
  email: string;
  password: string;
  studentId: string;
  department: string;
  program: string;
  year: number;
  semester: number;
  phone?: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<SignUpValues>({
    defaultValues: {
      year: 1,
      semester: 1,
    },
  });

  const onSubmit = async (values: SignUpValues) => {
    try {
      setError(null);
      const response = await api<{ token: string; user: AuthUser }>("/auth/register/student", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSession(response);
      router.push("/student");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-2xl p-8">
        <p className="text-sm font-medium text-coral">Student onboarding</p>
        <h1 className="mt-2 text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-slate">Set up your academic profile and start building your verified achievement portfolio.</p>
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate">
              Full name
              <input className="input mt-2" placeholder="e.g. Ananya Sharma" {...register("name", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Email
              <input className="input mt-2" type="email" placeholder="e.g. ananya@example.edu" {...register("email", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Password
              <input className="input mt-2" type="password" placeholder="Create a strong password" {...register("password", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Student ID
              <input className="input mt-2" placeholder="e.g. CSE2023001" {...register("studentId", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Department
              <input className="input mt-2" placeholder="e.g. Computer Science" {...register("department", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Program
              <input className="input mt-2" placeholder="e.g. B.Tech CSE" {...register("program", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Admission category
              <input className="input mt-2" placeholder="e.g. EAMCET / JEE / VSAT" {...register("admissionCategory")} />
            </label>
            <label className="text-sm font-medium text-slate">
              Year
              <input className="input mt-2" type="number" min={1} max={6} placeholder="e.g. 3" {...register("year", { valueAsNumber: true, required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Semester
              <input className="input mt-2" type="number" min={1} max={12} placeholder="e.g. 6" {...register("semester", { valueAsNumber: true, required: true })} />
            </label>
            <label className="text-sm font-medium text-slate md:col-span-2">
              Phone number
              <input className="input mt-2" placeholder="e.g. 9876543210" {...register("phone")} />
            </label>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="btn-primary" type="submit">
            Sign up
          </button>
        </form>
        <p className="mt-5 text-sm text-slate">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-ink hover:text-coral">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
