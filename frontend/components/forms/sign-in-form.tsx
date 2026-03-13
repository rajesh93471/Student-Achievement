"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useAuth } from "@/components/layout/providers";
import { AuthUser, Role } from "@/lib/types";

type LoginValues = {
  email: string;
  password: string;
};

export function SignInForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<LoginValues>();

  const onSubmit = async (values: LoginValues) => {
    try {
      setError(null);
      const response = await api<{ token: string; user: AuthUser & { role: Role } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSession(response);
      const role = response.user.role;
      router.push(
        role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : role === "parent" ? "/parent" : "/student"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  return (
    <div className="card w-full max-w-md p-8">
      <p className="text-sm font-medium text-brand-700">University Portal</p>
      <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-slate">Students, admins, and faculty can access their role-specific workspace here.</p>
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input className="input" type="email" placeholder="Email" {...register("email", { required: true })} />
        <input className="input" type="password" placeholder="Password" {...register("password", { required: true })} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="btn-primary" type="submit">
          Sign in
        </button>
      </form>
      <p className="mt-5 text-sm text-slate">
        New student account?{" "}
        <Link href="/signup" className="font-semibold text-ink hover:text-coral">
          Student sign up
        </Link>
        {" "}or{" "}
        <Link href="/parent-signup" className="font-semibold text-ink hover:text-coral">
          Parent sign up
        </Link>
      </p>
    </div>
  );
}
