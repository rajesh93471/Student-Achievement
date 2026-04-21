import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: Array<string | undefined | false | null>) => twMerge(clsx(inputs));

export const formatDate = (value?: string) =>
  value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "-";

export const sortSectionsAscending = (sections: string[]) =>
  [...sections].sort((left, right) => {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    const leftIsNumber = Number.isFinite(leftNumber);
    const rightIsNumber = Number.isFinite(rightNumber);

    if (leftIsNumber && rightIsNumber) {
      return leftNumber - rightNumber;
    }

    if (leftIsNumber) return -1;
    if (rightIsNumber) return 1;

    return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
  });
