"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const stats = [
  { value: "3 Roles", label: "Students, Admins, Parents", sub: "role-based access" },
  { value: "Live", label: "AI Assistant", sub: "answers with real data" },
  { value: "Structured", label: "Achievements", sub: "year, semester, activity" },
  { value: "Secure", label: "Document Vault", sub: "verified uploads" },
];

const features = [
  {
    icon: "PM",
    accent: "#1e3a8a",
    title: "Student Profile Management",
    body: "Centralize personal, registration, contact, admission category, and academic program details with admin-controlled updates.",
  },
  {
    icon: "DR",
    accent: "#2563eb",
    title: "Official Document Repository",
    body: "Secure storage for mark memos, Aadhaar, PAN, voter ID, APAAR/ABC ID, and verification documents.",
  },
  {
    icon: "AT",
    accent: "#0f766e",
    title: "Achievement Repository",
    body: "Track hackathons, internships, publications, competitions, cultural, sports, workshops, and seminars.",
  },
  {
    icon: "AR",
    accent: "#f59e0b",
    title: "Analytics & AI Insights",
    body: "Department summaries, top achievers, and AI explanations for leadership reviews and accreditation.",
  },
];

const workflows = [
  {
    step: "01",
    accent: "#f59e0b",
    title: "Profile Onboarding",
    body: "Capture admission category, registration, and academic program details in a structured flow.",
  },
  {
    step: "02",
    accent: "#3b82f6",
    title: "Documents and Achievements",
    body: "Upload official documents and achievements with year, semester, and activity type tagging.",
  },
  {
    step: "03",
    accent: "#10b981",
    title: "Admin Access and Reports",
    body: "Search by registration number, verify records, and export evidence for accreditation.",
  },
];

const students = [
  { name: "Priya Sharma",  dept: "Computer Science - 3rd Year", badge: "Approved", badgeColor: "#0f766e", bg: "#1e3a8a" },
  { name: "Arjun Reddy",   dept: "Electronics - 2nd Year",      badge: "Verified", badgeColor: "#2563eb", bg: "#0f172a" },
  { name: "Nisha Patel",   dept: "Civil Engineering - 4th Year", badge: "Pending", badgeColor: "#f59e0b", bg: "#b45309" },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:          #0f172a;
          --ink-dim:      #334155;
          --slate:        #64748b;
          --border:       #e2e8f0;
          --border-soft:  #edf2f7;
          --border-hard:  #cbd5e1;
          --surface:      #ffffff;
          --surface-low:  #f8fafc;
          --bg:           #f8fafc;
          --amber:        #1e3a8a;
          --amber-dim:    rgba(30,58,138,0.08);
          --amber-border: rgba(30,58,138,0.2);
          --gold:         #f59e0b;
          --font-display: 'Poppins', 'Inter', sans-serif;
          --font-body:    'Inter', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: var(--font-body);
          background: var(--bg);
          color: var(--ink);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          background-image:
            radial-gradient(ellipse at 20% 0%,  rgba(30,58,138,0.08) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 10%, rgba(37,99,235,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 95%, rgba(245,158,11,0.05) 0%, transparent 50%);
          background-attachment: fixed;
        }

        /* ── SCROLLBAR ── */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* ── NAV ── */
        .lp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 0 48px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.3s, border-color 0.3s;
          border-bottom: 1px solid transparent;
        }
        .lp-nav.scrolled {
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-color: var(--border);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
        }

        .lp-brand {
          display: flex; align-items: center; gap: 14px;
          text-decoration: none;
        }
        .lp-logo {
          width: 44px; height: 44px;
          background: #fff;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
        }
        .lp-logo-img {
          width: 30px; height: 30px; object-fit: contain;
        }
        .lp-brand-name {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 400;
          color: var(--ink);
          line-height: 1.1;
        }
        .lp-brand-sub {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--slate);
        }

        .lp-nav-links {
          display: flex; align-items: center; gap: 36px; list-style: none;
        }
        .lp-nav-links a {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: var(--slate);
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-nav-links a:hover { color: var(--ink); }

        .lp-nav-actions { display: flex; align-items: center; gap: 10px; }

        .lp-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          border-radius: 8px;
          padding: 9px 20px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .lp-btn-ghost {
          background: #fff;
          color: var(--slate);
          border: 1px solid var(--border-hard);
        }
        .lp-btn-ghost:hover { border-color: #94a3b8; color: var(--ink); }

        .lp-btn-primary {
          background: var(--amber);
          color: #fff;
          font-weight: 600;
        }
        .lp-btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.22);
        }
        .lp-btn-lg { padding: 13px 30px; font-size: 13px; border-radius: 10px; }
        .lp-btn-outline-lg {
          background: #fff; color: var(--slate);
          border: 1px solid var(--border-hard); font-size: 13px;
          padding: 12px 28px; border-radius: 10px;
          font-family: var(--font-body);
          display: inline-flex; align-items: center;
          cursor: pointer; text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .lp-btn-outline-lg:hover { border-color: #94a3b8; color: var(--ink); }

        /* ── LAYOUT ── */
        .lp-page { padding-top: 68px; }
        .lp-container { max-width: 1160px; margin: 0 auto; padding: 0 40px; }

        /* ── HERO ── */
        .lp-hero {
          padding: 104px 0 88px;
          position: relative;
          overflow: hidden;
        }

        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }

        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--amber-dim);
          border: 1px solid var(--amber-border);
          border-radius: 100px;
          padding: 6px 14px 6px 8px;
          font-size: 11px;
          font-family: var(--font-body);
          letter-spacing: 0.07em;
          color: var(--amber);
          margin-bottom: 28px;
        }
        .lp-eyebrow-dot {
          width: 5px; height: 5px;
          background: var(--amber);
          border-radius: 50%;
        }

        .lp-hero h1 {
          font-family: var(--font-display);
          font-size: 56px;
          line-height: 1.07;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-bottom: 24px;
        }
        .lp-hero h1 em {
          font-style: italic;
          color: var(--amber);
        }

        .lp-hero-desc {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--slate);
          line-height: 1.8;
          max-width: 460px;
          margin-bottom: 28px;
          letter-spacing: 0.01em;
        }

        .lp-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

        .lp-trust {
          display: flex; align-items: center; gap: 10px;
          margin-top: 24px;
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--slate);
          letter-spacing: 0.02em;
        }
        .lp-trust-dot { width: 3px; height: 3px; background: #cbd5e1; border-radius: 50%; }
        .lp-trust-item { color: var(--slate); }

        /* ── HERO VISUAL ── */
        .lp-hero-visual { position: relative; }

        .lp-hero-photo {
          width: 100%;
          height: 260px;
          border-radius: 18px;
          object-fit: cover;
          border: 1px solid var(--border);
          box-shadow: 0 20px 40px rgba(15,23,42,0.12);
          margin-bottom: 18px;
        }
        .lp-hero-photo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 14px;
        }
        .lp-hero-photo-sm {
          width: 100%;
          height: 140px;
          border-radius: 14px;
          object-fit: cover;
          border: 1px solid var(--border);
          box-shadow: 0 14px 28px rgba(15,23,42,0.1);
        }
        .lp-hero-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 32px 60px rgba(15, 23, 42, 0.12);
        }

        .lp-card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .lp-card-label {
          font-family: var(--font-body);
          font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--slate);
        }
        .lp-card-live {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--font-body);
          font-size: 11px; color: #10b981;
        }
        .lp-live-dot {
          width: 5px; height: 5px;
          background: #10b981; border-radius: 50%;
          box-shadow: 0 0 6px #10b981;
        }

        .lp-student-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px;
          border-radius: 10px;
          background: var(--surface-low);
          margin-bottom: 8px;
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .lp-student-row:hover { border-color: var(--border); }

        .lp-avatar {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 16px; color: white; flex-shrink: 0;
        }
        .lp-student-name {
          font-family: var(--font-body);
          font-size: 13px; color: var(--ink); font-weight: 600;
        }
        .lp-student-dept {
          font-family: var(--font-body);
          font-size: 12px; color: var(--slate); margin-top: 1px;
        }
        .lp-badge {
          font-family: var(--font-body);
          font-size: 11px; letter-spacing: 0.04em;
          padding: 3px 10px;
          border-radius: 5px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .lp-mini-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-top: 10px;
        }
        .lp-mini-card {
          background: var(--surface-low);
          border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px;
        }
        .lp-mini-value {
          font-family: var(--font-display);
          font-size: 26px; color: var(--amber);
          line-height: 1;
        }
        .lp-mini-label {
          font-family: var(--font-body);
          font-size: 11px; color: var(--slate); margin-top: 4px;
          letter-spacing: 0.05em;
        }

        /* Float card */
        .lp-float {
          position: absolute;
          bottom: -18px; right: -20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
          display: flex; align-items: center; gap: 10px;
          white-space: nowrap;
        }
        .lp-float-icon {
          width: 30px; height: 30px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #10b981;
        }
        .lp-float-main {
          font-family: var(--font-body);
          font-size: 12px; color: var(--ink); font-weight: 600;
        }
        .lp-float-sub {
          font-family: var(--font-body);
          font-size: 11px; color: var(--slate); margin-top: 1px; letter-spacing: 0.02em;
        }

        /* ── STATS BAND ── */
        .lp-stats {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 52px 0;
          background: var(--surface-low);
        }
        .lp-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .lp-stat {
          padding: 0 36px;
          border-right: 1px solid var(--border);
          text-align: center;
        }
        .lp-stat:first-child { padding-left: 0; text-align: left; border-left: none; }
        .lp-stat:last-child  { padding-right: 0; text-align: right; border-right: none; }

        .lp-stat-value {
          font-family: var(--font-display);
          font-size: 44px; color: var(--amber); line-height: 1;
        }
        .lp-stat-label {
          font-family: var(--font-body);
          font-size: 13px; color: var(--ink);
          margin-top: 8px; letter-spacing: 0.02em;
          font-weight: 600;
        }
        .lp-stat-sub {
          font-family: var(--font-body);
          font-size: 12px; color: var(--slate); margin-top: 2px;
          letter-spacing: 0.02em;
        }

        /* ── SECTION SHARED ── */
        .lp-section { padding: 104px 0; }
        .lp-section-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--font-body);
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: var(--amber); margin-bottom: 18px;
        }
        .lp-section-eyebrow::before {
          content: '';
          display: block; width: 18px; height: 1.5px;
          background: var(--amber);
        }
        .lp-section-title {
          font-family: var(--font-display);
          font-size: 44px; line-height: 1.1;
          letter-spacing: -0.02em; color: var(--ink);
          max-width: 520px;
        }
        .lp-section-title em { font-style: italic; color: var(--amber); }
        .lp-section-body {
          font-family: var(--font-body);
          font-size: 15px; color: var(--slate);
          line-height: 1.8; max-width: 480px;
          margin-top: 16px; letter-spacing: 0.01em;
        }

        /* ── FEATURES ── */
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px; margin-top: 52px;
        }
        .lp-feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px; padding: 28px;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
          animation: lp-fadeUp 0.4s ease both;
        }
        .lp-feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
          border-color: var(--border-hard);
        }
        .lp-feature-icon {
          width: 42px; height: 42px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; margin-bottom: 18px;
        }
        .lp-feature-title {
          font-family: var(--font-display);
          font-size: 18px; color: var(--ink); font-weight: 600;
          margin-bottom: 10px;
        }
        .lp-feature-body {
          font-family: var(--font-body);
          font-size: 14px; color: var(--slate);
          line-height: 1.75; letter-spacing: 0.01em;
        }

        /* ── BENTO ── */
        .lp-bento-section { padding: 0 0 104px; }
        .lp-bento-header { text-align: center; margin-bottom: 56px; }
        .lp-bento-header .lp-section-title { max-width: none; }
        .lp-bento-header .lp-section-body { max-width: 480px; margin: 16px auto 0; text-align: center; }

        .lp-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .lp-bento-cell {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px; padding: 30px;
          position: relative; overflow: hidden;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
        }
        .lp-bento-cell:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          border-color: var(--border-hard);
        }
        .lp-bento-cell-wide {
          grid-column: span 2;
          background: var(--surface-low);
        }
        .lp-bento-step {
          font-family: var(--font-body);
          font-size: 11px; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--slate);
          margin-bottom: 14px;
        }
        .lp-bento-cell-wide .lp-bento-step { color: var(--slate); }
        .lp-bento-title {
          font-family: var(--font-display);
          font-size: 20px; color: var(--ink); font-weight: 600; margin-bottom: 10px;
        }
        .lp-bento-body {
          font-family: var(--font-body);
          font-size: 14px; color: var(--slate);
          line-height: 1.75; letter-spacing: 0.01em;
        }
        .lp-bento-ghost { display: none; }

        /* Mini bar chart */
        .lp-bars {
          display: flex; align-items: flex-end; gap: 5px;
          height: 44px; margin-top: 22px;
        }
        .lp-bar {
          flex: 1; border-radius: 3px 3px 0 0;
          background: #dbeafe;
          transition: background 0.2s;
        }
        .lp-bar:hover { background: #bfdbfe; }
        .lp-bar.lit { background: var(--amber); }

        /* ── ABOUT ── */
        .lp-about-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }
        .lp-pills {
          display: flex; flex-wrap: wrap; gap: 8px; margin: 28px 0;
        }
        .lp-pill {
          display: flex; align-items: center; gap: 7px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px; padding: 7px 14px;
          font-family: var(--font-body);
          font-size: 12px; color: var(--slate);
          letter-spacing: 0.02em;
          transition: border-color 0.18s, color 0.18s;
        }
        .lp-pill:hover { border-color: #94a3b8; color: var(--ink); }
        .lp-pill-dot { width: 5px; height: 5px; background: var(--amber); border-radius: 50%; }

        .lp-quote {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px; padding: 28px; margin-top: 24px;
          border-left: 3px solid var(--amber);
        }
        .lp-quote-text {
          font-family: var(--font-display);
          font-size: 18px; font-style: italic;
          color: var(--ink); line-height: 1.55; margin-bottom: 14px;
        }
        .lp-quote-source {
          font-family: var(--font-body);
          font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--slate);
        }

        .lp-about-tiles {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .lp-about-tile {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px; padding: 22px;
          transition: border-color 0.2s;
        }
        .lp-about-tile:hover { border-color: var(--border-hard); }
        .lp-about-tile-wide {
          grid-column: span 2;
          background: var(--surface-low);
          border-left: 3px solid var(--amber);
        }
        .lp-about-big {
          font-family: var(--font-display);
          font-size: 42px; color: var(--amber); line-height: 1; margin-bottom: 6px;
        }
        .lp-about-tile-title {
          font-family: var(--font-body);
          font-size: 12px; color: var(--ink);
          letter-spacing: 0.04em; font-weight: 600;
        }
        .lp-about-tile-body {
          font-family: var(--font-body);
          font-size: 12px; color: var(--slate);
          margin-top: 5px; line-height: 1.6; letter-spacing: 0.02em;
        }
        .lp-about-tile-icon { font-size: 20px; margin-bottom: 10px; }

        /* ── CTA ── */
        .lp-cta { padding: 0 0 104px; }
        .lp-cta-inner {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px; padding: 72px;
          display: grid; grid-template-columns: 1fr auto;
          gap: 48px; align-items: center;
          position: relative; overflow: hidden;
        }
        .lp-cta-inner::before {
          content: '';
          position: absolute; top: -80px; right: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .lp-cta-eyebrow {
          font-family: var(--font-body);
          font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--amber); margin-bottom: 14px;
        }
        .lp-cta-title {
          font-family: var(--font-display);
          font-size: 40px; color: var(--ink); line-height: 1.1; max-width: 460px;
        }
        .lp-cta-body {
          font-family: var(--font-body);
          font-size: 15px; color: var(--slate);
          margin-top: 12px; line-height: 1.8; letter-spacing: 0.01em;
        }
        .lp-cta-actions { display: flex; flex-direction: column; gap: 10px; flex-shrink: 0; }
        .lp-btn-amber-lg {
          background: var(--amber); color: #fff;
          font-family: var(--font-body); font-size: 14px; font-weight: 600;
          letter-spacing: 0.02em; padding: 14px 30px; border-radius: 10px;
          border: none; cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
          white-space: nowrap;
        }
        .lp-btn-amber-lg:hover {
          background: #1d4ed8; transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.22);
        }
        .lp-btn-ghost-lg {
          background: #fff; color: var(--slate);
          border: 1px solid var(--border-hard); font-family: var(--font-body);
          font-size: 14px; padding: 13px 28px; border-radius: 10px;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; justify-content: center;
          transition: border-color 0.18s, color 0.18s; white-space: nowrap;
        }
        .lp-btn-ghost-lg:hover { border-color: #94a3b8; color: var(--ink); }

        /* ── FOOTER ── */
        .lp-footer {
          border-top: 1px solid var(--border);
          padding: 28px 0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .lp-footer-brand {
          font-family: var(--font-display);
          font-size: 15px; color: var(--ink);
        }
        .lp-footer-copy {
          font-family: var(--font-body);
          font-size: 12px; color: var(--slate); letter-spacing: 0.02em;
        }

        /* ── ANIMATIONS ── */
        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .lp-hero-grid, .lp-about-grid { grid-template-columns: 1fr; }
          .lp-float { display: none; }
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-stat { padding: 18px; border: none; border-bottom: 1px solid var(--border); text-align: center; }
          .lp-stat:first-child, .lp-stat:last-child { text-align: center; padding-left: 18px; padding-right: 18px; }
          .lp-bento-grid { grid-template-columns: 1fr; }
          .lp-bento-cell-wide { grid-column: span 1; }
          .lp-cta-inner { grid-template-columns: 1fr; padding: 44px; }
          .lp-cta-actions { flex-direction: row; }
          .lp-nav-links { display: none; }
          .lp-container { padding: 0 20px; }
          .lp-hero { padding: 72px 0 56px; }
          .lp-hero h1 { font-size: 40px; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-about-tiles { grid-template-columns: 1fr; }
          .lp-about-tile-wide { grid-column: span 1; }
        }
      `}</style>

      <div className="lp-page">

        {/* ── NAV ── */}
        <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
          <a href="#" className="lp-brand">
            <div className="lp-logo">
              <img className="lp-logo-img" src="/brand/university-logo.svg" alt="University logo" />
            </div>
            <div>
              <div className="lp-brand-name">UniPortal</div>
              <div className="lp-brand-sub">Achievement System</div>
            </div>
          </a>
          <ul className="lp-nav-links">
            {["Home", "Features", "Workflows", "About"].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`}>{item}</a>
              </li>
            ))}
          </ul>
          <div className="lp-nav-actions">
            <Link href="/signin" className="lp-btn lp-btn-ghost">Sign in</Link>
            <Link href="/signup" className="lp-btn lp-btn-primary">Get started -&gt;</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section id="home" className="lp-hero">
          <div className="lp-container">
            <div className="lp-hero-grid">

              {/* Left copy */}
              <div>
                <div className="lp-eyebrow">
                  <span className="lp-eyebrow-dot" />
                  NAAC &amp; Accreditation Ready
                </div>
                <h1>
                  Student achievement<br />
                  and <em>profile</em><br />
                  management.
                </h1>
                <p className="lp-hero-desc">
                  A centralized university portal to manage student profiles, documents, achievements, and approvals with AI that answers using real system data.
                </p>
                <div className="lp-trust">
                  <span className="lp-trust-item">Role-based access</span>
                  <span className="lp-trust-dot" />
                  <span className="lp-trust-item">Secure document vault</span>
                  <span className="lp-trust-dot" />
                  <span className="lp-trust-item">AI insights</span>
                </div>
              </div>

              {/* Right visual card */}
              <div className="lp-hero-visual">
                <div className="lp-hero-card">
                  <div className="lp-card-header">
                    <span className="lp-card-label">Active students</span>
                    <span className="lp-card-live">
                      <span className="lp-live-dot" /> System live
                    </span>
                  </div>

                  {students.map((s) => (
                    <div className="lp-student-row" key={s.name}>
                      <div className="lp-avatar" style={{ background: s.bg }}>{s.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div className="lp-student-name">{s.name}</div>
                        <div className="lp-student-dept">{s.dept}</div>
                      </div>
                      <span className="lp-badge" style={{
                        background: `${s.badgeColor}15`,
                        color: s.badgeColor,
                        border: `1px solid ${s.badgeColor}30`,
                      }}>
                        {s.badge}
                      </span>
                    </div>
                  ))}

                  <div className="lp-mini-grid">
                    <div className="lp-mini-card">
                      <div className="lp-mini-value">847</div>
                      <div className="lp-mini-label">Students enrolled</div>
                    </div>
                    <div className="lp-mini-card">
                      <div className="lp-mini-value">12.4k</div>
                      <div className="lp-mini-label">Documents stored</div>
                    </div>
                  </div>
                </div>

                <div className="lp-float">
                  <div className="lp-float-icon">✓</div>
                  <div>
                    <div className="lp-float-main">Request sent</div>
                    <div className="lp-float-sub">Admin notified just now</div>
                  </div>
                </div>

                <div className="lp-hero-photo-grid">
                  <img
                    className="lp-hero-photo-sm"
                    src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1200&auto=format&fit=crop"
                    alt="Students collaborating in campus library"
                  />
                  <img
                    className="lp-hero-photo-sm"
                    src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop"
                    alt="Graduation ceremony"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="lp-stats">
          <div className="lp-container">
            <div className="lp-stats-grid">
              {stats.map((s) => (
                <div className="lp-stat" key={s.value}>
                  <div className="lp-stat-value">{s.value}</div>
                  <div className="lp-stat-label">{s.label}</div>
                  <div className="lp-stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section id="features" className="lp-section">
          <div className="lp-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 40, flexWrap: "wrap" }}>
              <div>
                <div className="lp-section-eyebrow">Core capabilities</div>
                <h2 className="lp-section-title">
                  Every workflow a<br /><em>modern university</em><br />needs in one place.
                </h2>
              </div>
              <p className="lp-section-body" style={{ paddingTop: 8 }}>
                From admission to graduation, maintain complete digital records with audit-ready history, verified documents, and structured achievements.
              </p>
            </div>

            <div className="lp-features-grid">
              {features.map((f, i) => (
                <div className="lp-feature-card" key={f.title} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="lp-feature-icon" style={{
                    background: `${f.accent}12`,
                    border: `1px solid ${f.accent}25`,
                    color: f.accent,
                  }}>
                    {f.icon}
                  </div>
                  <div className="lp-feature-title">{f.title}</div>
                  <p className="lp-feature-body">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENTO / WORKFLOWS ── */}
        <section id="workflows" className="lp-bento-section">
          <div className="lp-container">
            <div className="lp-bento-header">
              <div className="lp-section-eyebrow">Workflows</div>
              <h2 className="lp-section-title">Designed for how universities actually work.</h2>
              <p className="lp-section-body">Three core workflows that take students from onboarding to accreditation-ready records.</p>
            </div>

            <div className="lp-bento-grid">
              {/* Wide cell */}
              <div className="lp-bento-cell lp-bento-cell-wide">
                <div className="lp-bento-step" style={{ color: "#f59e0b44" }}>{workflows[0].step}</div>
                <div className="lp-bento-title">{workflows[0].title}</div>
                <p className="lp-bento-body">{workflows[0].body}</p>
                <div className="lp-bars">
                  {[60, 45, 80, 55, 90, 70, 85, 75, 95, 65].map((h, i) => (
                    <div key={i} className={`lp-bar${i === 8 ? " lit" : ""}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="lp-bento-ghost">WF</div>
              </div>

              {/* Narrow cells */}
              {workflows.slice(1).map((w) => (
                <div className="lp-bento-cell" key={w.step}>
                  <div className="lp-bento-step">{w.step}</div>
                  <div className="lp-bento-title">{w.title}</div>
                  <p className="lp-bento-body">{w.body}</p>
                  {/* Accent line */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: 3, background: w.accent, borderRadius: "0 0 16px 16px",
                    opacity: 0.6,
                  }} />
                  <div className="lp-bento-ghost">{w.step === "02" ? "WF" : "OK"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="lp-section" style={{ paddingTop: 0 }}>
          <div className="lp-container">
            <div className="lp-about-grid">
              <div>
                <div className="lp-section-eyebrow">About the platform</div>
                <h2 className="lp-section-title">
                  Built for <em>accreditation</em>, compliance, and student success.
                </h2>
                <p className="lp-section-body">
                  Centralize student documents, achievements, and profile history with tools that let administrators retrieve and verify records instantly.
                </p>
                <div className="lp-pills">
                  {["Verification-ready", "NAAC compliant", "Audit trails", "Exportable evidence", "Role-based access", "Encrypted storage"].map((p) => (
                    <div className="lp-pill" key={p}>
                      <span className="lp-pill-dot" />{p}
                    </div>
                  ))}
                </div>
                <div className="lp-quote">
                  <div className="lp-quote-text">"We can retrieve any student record in seconds and share verified evidence for accreditation reviews."</div>
                  <div className="lp-quote-source">Academic Affairs Office - University Portal</div>
                </div>
              </div>

              <div className="lp-about-tiles">
                <div className="lp-about-tile lp-about-tile-wide">
                  <div className="lp-about-big">98%</div>
                  <div className="lp-about-tile-title">Profile completion</div>
                  <div className="lp-about-tile-body">Average within the first week of onboarding for new students.</div>
                </div>
                {[
                { icon: "DOC", title: "Document repository", body: "Secure uploads for Aadhaar, PAN, APAAR, mark sheets, and more." },
                { icon: "ACH", title: "Achievement insights",  body: "Track approvals, activity types, and department participation." },
                { icon: "REP", title: "Leadership reports",    body: "Top achievers and department analytics in PDF or Excel." },
              ].map((t) => (
                  <div className="lp-about-tile" key={t.title}>
                    <div className="lp-about-tile-icon">{t.icon}</div>
                    <div className="lp-about-tile-title">{t.title}</div>
                    <div className="lp-about-tile-body">{t.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="lp-cta">
          <div className="lp-container">
            <div className="lp-cta-inner">
              <div>
                <div className="lp-cta-eyebrow">Get started today</div>
                <h2 className="lp-cta-title">Ready to modernize your university operations?</h2>
                <p className="lp-cta-body">
                  Launch student onboarding, document verification, and achievement tracking in one secure, accreditation-ready platform.
                </p>
              </div>
              <div className="lp-cta-actions">
                <Link href="/signup" className="lp-btn-amber-lg">Create account -&gt;</Link>
                <Link href="/signin" className="lp-btn-ghost-lg">Sign in</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer>
          <div className="lp-container">
            <div className="lp-footer">
              <div className="lp-footer-brand">UniPortal - Student Achievement System</div>
              <div className="lp-footer-copy">© {new Date().getFullYear()} University Portal. All rights reserved.</div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
