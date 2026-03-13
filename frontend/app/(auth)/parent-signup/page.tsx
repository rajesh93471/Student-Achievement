"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useAuth } from "@/components/layout/providers";
import { AuthUser } from "@/lib/types";

type ParentSignUpValues = {
  name: string;
  email: string;
  password: string;
  studentId: string;
  relation: string;
  phone?: string;
};

export default function ParentSignUpPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<ParentSignUpValues>({
    defaultValues: {
      relation: "Parent",
    },
  });

  const onSubmit = async (values: ParentSignUpValues) => {
    try {
      setError(null);
      const response = await api<{ token: string; user: AuthUser }>("/auth/register/parent", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSession(response);
      router.push("/parent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parent sign up failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-2xl p-8">
        <p className="text-sm font-medium text-coral">Parent onboarding</p>
        <h1 className="mt-2 text-3xl font-semibold">Create parent account</h1>
        <p className="mt-2 text-sm text-slate">
          A parent account can connect to a child only by using that child&apos;s student ID.
        </p>
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate">
              Full name
              <input className="input mt-2" placeholder="e.g. Priya Sharma" {...register("name", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Email
              <input className="input mt-2" type="email" placeholder="e.g. priya@example.com" {...register("email", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Password
              <input className="input mt-2" type="password" placeholder="Create a strong password" {...register("password", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Child student ID
              <input className="input mt-2" placeholder="e.g. CSE2023001" {...register("studentId", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Relation
              <input className="input mt-2" placeholder="e.g. Father / Mother / Guardian" {...register("relation", { required: true })} />
            </label>
            <label className="text-sm font-medium text-slate">
              Phone number
              <input className="input mt-2" placeholder="e.g. 9876543210" {...register("phone")} />
            </label>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="btn-primary" type="submit">
            Create parent account
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
