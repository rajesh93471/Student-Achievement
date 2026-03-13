"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Search, Settings, UserCircle2 } from "lucide-react";
import { useAuth } from "@/components/layout/providers";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

export function DashboardShell({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setSession, user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-sky px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card flex h-full flex-col gap-6 p-6">
          <div>
            <p className="text-sm font-semibold text-brand-700">University Portal</p>
            <h1 className="mt-2 text-xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-slate">{subtitle}</p>
          </div>
          <nav className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate">Navigation</p>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl px-4 py-3 text-sm font-semibold transition",
                  pathname === item.href
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-ink hover:bg-brand-50"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/settings"
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brand-50"
            >
              <span className="inline-flex items-center gap-2">
                <Settings className="h-4 w-4 text-brand-700" />
                Settings
              </span>
            </Link>
          </nav>
          <div className="mt-auto rounded-2xl bg-slate-100 p-4">
            <div className="flex items-center gap-3">
              <UserCircle2 className="h-9 w-9 text-brand-700" />
              <div>
                <p className="text-sm font-semibold">{user?.name || "Signed in user"}</p>
                <p className="text-xs text-slate">Role: {user?.role || "user"}</p>
              </div>
            </div>
            <button
              className="btn-secondary mt-4 w-full"
              type="button"
              onClick={() => {
                setSession(null);
                router.push("/signin");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>
        <main className="space-y-6">
          <div className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-sm text-slate">{subtitle}</p>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
              {user?.role !== "student" ? (
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate" />
                  <input className="input pl-9" placeholder="Search students, IDs, departments" />
                </div>
              ) : null}
              <button className="btn-secondary h-10 w-10 p-0" type="button">
                <Bell className="h-4 w-4 text-brand-700" />
              </button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
