import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
  icon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, children, icon, ...props }, ref) => {
    return (
      <div className={cn("relative group w-full", containerClassName)}>
        <select
          ref={ref}
          className={cn(
            "w-full bg-white border border-surface-300 rounded-xl px-4 py-2.5 text-ink font-sans text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-100 cursor-pointer shadow-sm appearance-none pr-10",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-brand-500 transition-colors">
          {icon || <ChevronDown size={16} />}
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
