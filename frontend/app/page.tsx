import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-soft">
            Modern university portal
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-ink md:text-6xl">
              Student Achievement and Profile Management System
            </h1>
            <p className="max-w-2xl text-lg text-slate">
              Securely manage academic profiles, achievements, documents, analytics, reports, and role-based workflows for students, administrators, and faculty.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signin" className="btn-primary">
              Sign in
            </Link>
            <Link href="/signup" className="btn-secondary">
              Student sign up
            </Link>
            <Link href="/parent-signup" className="btn-secondary">
              Parent sign up
            </Link>
            <a href="#features" className="btn-secondary">
              Explore features
            </a>
          </div>
        </section>
        <section className="card p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["3 Roles", "Students, Admins, and Faculty with RBAC"],
              ["Cloud Storage", "S3-based certificate and document flow"],
              ["Analytics", "Department, category, and growth charts"],
              ["Exports", "PDF and Excel reporting for leadership teams"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl bg-brand-50 p-5">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-slate">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
