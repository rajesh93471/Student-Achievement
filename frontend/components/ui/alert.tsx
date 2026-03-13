"use client";

import { cn } from "@/lib/utils";

export function Alert({ tone = "info", children }: { tone?: "info" | "success" | "error"; children: React.ReactNode }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-brand-200 bg-brand-50 text-brand-700";
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", toneClass)}>
      {children}
    </div>
  );
}
