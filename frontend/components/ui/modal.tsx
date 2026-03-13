"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-panel")}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn-secondary h-9 w-9 p-0" type="button" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
