"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UniversityWordmark } from "@/components/layout/university-wordmark";

const stats = [
  { value: "3 Roles", label: "Student, Faculty, Admin", sub: "separate dashboards for each workflow" },
  { value: "1 Portal", label: "Profiles, Docs, Achievements", sub: "single source of academic records" },
  { value: "Track", label: "Assigned Students and Streams", sub: "technical and non-technical achievement records" },
  { value: "Export", label: "Analytics and Reports", sub: "PDF and Excel-ready summaries" },
];

const features = [
  {
    icon: "SP",
    accent: "text-brand-700 bg-brand-50 border-brand-200",
    title: "Student Profile Records",
    body: "Maintain registration, department, program, semester, phone, admission category, and graduation details in one verified profile.",
  },
  {
    icon: "DV",
    accent: "text-brand-600 bg-brand-50 border-brand-200",
    title: "Student Documents Hub",
    body: "Store mark sheets, Aadhaar, PAN, certificates, and supporting documents with structured access for students, faculty, and admin teams.",
  },
  {
    icon: "AR",
    accent: "text-teal-700 bg-teal-50 border-teal-200",
    title: "Achievement Repository",
    body: "Capture technical and non-technical achievements including hackathons, internships, certifications, sports, clubs, literary events, and entrepreneurship.",
  },
  {
    icon: "RP",
    accent: "text-accent-600 bg-accent-50 border-accent-200",
    title: "Faculty and Admin Analytics",
    body: "Give faculty and admins quick views of assigned students, category-wise achievements, document activity, top performers, and export-ready reports.",
  },
];

const workflows = [
  {
    step: "01",
    accent: "bg-accent-500",
    title: "Profile Setup",
    body: "Students create and maintain their academic profile with registration number, department, program, semester, graduation year, and contact details.",
  },
  {
    step: "02",
    accent: "bg-brand-500",
    title: "Upload Documents and Achievements",
    body: "Students add supporting documents and achievement entries with stream, category, academic year, semester, and certificate files.",
  },
  {
    step: "03",
    accent: "bg-emerald-500",
    title: "Monitor and Report",
    body: "Faculty monitors assigned students while admins manage institution-wide records, analytics dashboards, and downloadable PDF or Excel reports.",
  },
];

const students = [
  { name: "Likitha R.", dept: "CSE - 3rd Year", badge: "4 Documents Uploaded", badgeColor: "text-teal-700 bg-teal-50 border-teal-200", bg: "bg-brand-900" },
  { name: "Sai Charan", dept: "ECE - 2nd Year", badge: "2 Technical Achievements", badgeColor: "text-brand-600 bg-brand-50 border-brand-200", bg: "bg-slate-900" },
  { name: "Harshini M.", dept: "MBA - 1st Year", badge: "Non-technical Finalist", badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-200", bg: "bg-indigo-700" },
];

const heroBenefits = [
  { title: "Role-Based Dashboards", body: "Dedicated workspaces for students, faculty mentors, and administrators." },
  { title: "Structured Uploads", body: "Manage profiles, documents, and technical or non-technical achievements in one flow." },
  { title: "Operational Visibility", body: "Track assigned students, institution-wide activity, and exportable summaries quickly." },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 text-ink bg-grad-radial font-sans">
      
      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-lg border-surface-200 shadow-sm py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-8 max-w-7xl flex items-center justify-between">
          <a href="#" className="flex items-center gap-4 group">
            <div className="w-48 md:w-[260px] bg-white rounded-xl border border-surface-200 shadow-sm p-2 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
              <UniversityWordmark className="w-full h-full object-contain" />
            </div>
            <div className="hidden lg:block">
              <h1 className="font-display text-xl font-bold text-ink leading-tight">Student Achievement System</h1>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-0.5">Vignan&apos;s Deemed to be University</p>
            </div>
          </a>
          <ul className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {["Home", "Features", "Workflows", "About"].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`} className="hover:text-brand-600 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Link 
              href="/signin" 
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-brand-600 rounded-xl shadow-lg shadow-brand-200/50 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-300/50 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              Sign in
            </Link>
            <Link 
              href="/signin" 
              className="sm:hidden inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-all active:scale-95"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
            
            {/* Left Copy */}
            <div className="max-w-2xl animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 text-sm font-semibold tracking-wide mb-8">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
                Student, Faculty, and Admin Record Platform
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-ink mb-6 text-balance">
                Manage <em className="not-italic text-brand-600">profiles</em>, documents,<br className="hidden md:block" /> achievements, and analytics.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                A centralized portal for Vignan&apos;s Deemed to be University to manage student profiles, assigned faculty views, uploaded documents, technical and non-technical achievements, and admin analytics in one place.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-surface-200">
                {heroBenefits.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-display font-semibold text-ink text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative w-full h-full animate-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="bg-white border border-surface-200 rounded-3xl p-6 md:p-8 shadow-card relative z-10 w-full hover:shadow-panel transition-shadow duration-500">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Portal overview</span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Portal active
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {students.map((s) => (
                    <div key={s.name} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-surface-50 border border-surface-200 hover:border-surface-300 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-display font-bold shrink-0 ${s.bg}`}>
                        {s.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-ink">{s.name}</div>
                        <div className="text-sm text-slate-500">{s.dept}</div>
                      </div>
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-md border shrink-0 inline-flex items-center w-max ${s.badgeColor}`}>
                        {s.badge}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-5 rounded-2xl bg-surface-50 border border-surface-200">
                    <div className="font-display text-4xl font-bold text-brand-600 mb-2">3</div>
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Portal roles</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-surface-50 border border-surface-200">
                    <div className="font-display text-4xl font-bold text-accent-500 mb-2">PDF / XLS</div>
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Report exports</div>
                  </div>
                </div>
              </div>
              
              {/* Decorative background blob */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-brand-400/20 rounded-full blur-[80px] -z-10 mix-blend-multiply"></div>
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-accent-400/20 rounded-full blur-[80px] -z-10 mix-blend-multiply"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-16 bg-white border-y border-surface-200">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x divide-surface-200">
            {stats.map((s, i) => (
              <div key={s.value} className={`text-center md:px-6 pt-6 md:pt-0 ${i === 0 ? 'md:pl-0' : ''} ${i === stats.length - 1 ? 'md:pr-0' : ''}`}>
                <div className="font-display text-5xl font-bold text-brand-600 mb-3">{s.value}</div>
                <div className="font-semibold text-ink text-lg">{s.label}</div>
                <div className="text-slate-500 text-sm mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-brand-600 font-bold uppercase tracking-widest text-sm mb-6">
                <span className="w-12 h-0.5 bg-brand-600"></span> Core capabilities
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ink leading-[1.1]">
                Every record that matters for <em className="not-italic text-brand-600">student progress</em> in one system.
              </h2>
            </div>
            <p className="text-lg text-slate-600 max-w-md">
              From onboarding to graduation, the platform keeps profile data, verified files, uploaded proofs, and achievement history ready for day-to-day operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((f, i) => (
              <div key={f.title} className="p-8 md:p-10 bg-white rounded-3xl border border-surface-200 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl mb-6 border ${f.accent}`}>
                  {f.icon}
                </div>
                <h3 className="font-display text-2xl font-bold text-ink mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOWS / BENTO ─── */}
      <section id="workflows" className="py-24 md:py-32 bg-white border-t border-surface-200">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-3 text-accent-600 font-bold uppercase tracking-widest text-sm mb-6">
              <span className="w-8 h-0.5 bg-accent-600"></span> Workflows <span className="w-8 h-0.5 bg-accent-600"></span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-6">Designed for the actual academic record workflow.</h2>
            <p className="text-lg text-slate-600">Three connected flows move data from student entry to admin verification and reporting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wide Cell */}
            <div className="md:col-span-2 bg-slate-50 rounded-3xl border border-surface-200 p-8 md:p-12 relative overflow-hidden group hover:border-surface-300 transition-colors">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{workflows[0].step}</div>
              <h3 className="font-display text-3xl font-bold text-ink mb-4 relative z-10">{workflows[0].title}</h3>
              <p className="text-slate-600 text-lg max-w-md relative z-10">{workflows[0].body}</p>
              
              {/* Fake Data Bars */}
              <div className="flex items-end gap-2 h-24 mt-12 relative z-10">
                {[60, 45, 80, 55, 90, 70, 85, 75, 95, 65].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t-sm transition-all duration-500 hover:opacity-80 ${i === 8 ? 'bg-accent-500' : 'bg-brand-200 hover:bg-brand-300'}`} style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            {/* Narrow Cells */}
            {workflows.slice(1).map((w, i) => (
              <div key={w.step} className="bg-white rounded-3xl border border-surface-200 p-8 md:p-10 relative overflow-hidden hover:-translate-y-1 hover:shadow-card transition-all duration-300">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{w.step}</div>
                <h3 className="font-display text-2xl font-bold text-ink mb-4 relative z-10">{w.title}</h3>
                <p className="text-slate-600 leading-relaxed relative z-10">{w.body}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${w.accent} opacity-80`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <div>
              <div className="flex items-center gap-3 text-brand-600 font-bold uppercase tracking-widest text-sm mb-6">
                <span className="w-12 h-0.5 bg-brand-600"></span> About the platform
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ink leading-[1.1] mb-6">
                Built for <em className="not-italic text-brand-600">institutional visibility</em>, compliance, and student growth.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                This project gives Vignan a single place to manage student academic profiles, supporting documents, achievements, and report-ready evidence.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-10">
                {["Verification-ready", "NAAC compliant", "Audit trails", "Exportable evidence", "Role-based access", "Encrypted storage"].map((p) => (
                  <div key={p} className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 rounded-full text-sm font-semibold text-slate-600 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> {p}
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white border-l-4 border-brand-500 rounded-r-2xl shadow-sm border-y border-surface-200">
                <p className="font-display text-xl leading-relaxed text-ink italic mb-4">
                  "The portal brings profiles, documents, achievements, and records together so academic teams can act faster with confidence."
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Academic Affairs Office - Vignan&apos;s Deemed to be University
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 p-8 bg-slate-50 border-l-4 border-accent-500 border-surface-200 rounded-r-2xl shadow-sm">
                <div className="font-display text-5xl font-bold text-accent-500 mb-4">One View</div>
                <h4 className="font-bold text-ink text-lg mb-2">Complete student record</h4>
                <p className="text-slate-600 leading-relaxed">Profiles, uploaded proofs, and achievements are available together for fast verification and reporting.</p>
              </div>
              {[
                { icon: "📄", title: "Document repository", body: "Keep student proofs and official uploads organized for quick retrieval and review." },
                { icon: "🏆", title: "Achievement tracking",  body: "Monitor competitions, internships, workshops, and academic milestones in a structured format." },
                { icon: "📊", title: "Admin reporting",    body: "Support reviews with searchable records, verification status, and export-friendly summaries." },
              ].map((t) => (
                <div key={t.title} className="p-6 bg-white border border-surface-200 rounded-2xl shadow-sm hover:border-surface-300 transition-colors">
                  <div className="text-2xl mb-4">{t.icon}</div>
                  <h4 className="font-bold text-ink mb-2">{t.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{t.body}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-brand-900 rounded-[2.5rem] p-10 md:p-16 lg:p-20 relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
              <div>
                <div className="text-accent-400 font-bold uppercase tracking-widest text-sm mb-4">Get started today</div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl text-balance">
                  Ready to manage student records in one Vignan platform?
                </h2>
                <p className="text-brand-100 text-lg md:text-xl max-w-xl leading-relaxed">
                  Launch profile onboarding, document uploads, achievement submission, and record management in one connected system.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-4">
                <Link 
                  href="/signin" 
                  className="inline-flex items-center justify-center px-10 py-4 text-brand-900 bg-white font-bold rounded-2xl shadow-2xl hover:bg-brand-50 hover:-translate-y-1 hover:shadow-white/20 transition-all duration-300"
                >
                  Sign in to Dashboard &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-surface-200 bg-white py-10">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-lg font-bold text-ink">
            Vignan&apos;s Student Achievement System
          </div>
          <div className="text-slate-500 text-sm font-semibold">
            &copy; {new Date().getFullYear()} Vignan&apos;s Deemed to be University. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
