import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: Array<string | undefined | false | null>) => twMerge(clsx(inputs));

export const formatDate = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "-";
