"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Bell, LogOut, MessageSquare, Settings, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/providers";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
  const router   = useRouter();
  const { setSession, user, token } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "bot"; text: string }>>([]);
  const [chatStatus, setChatStatus] = useState<string>("");
  const notifRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data: noticeData } = useQuery({
    queryKey: ["header-notifications"],
    queryFn: () => api<{ notifications: any[] }>("/notifications", { token }),
    enabled: !!token && user?.role === "admin",
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}/read`, { method: "PUT", token }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["header-notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["header-notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      api<{ reply: string }>("/chatbot", { method: "POST", token, body: JSON.stringify({ message }) }),
    onSuccess: (payload) => {
      setChatMessages((prev) => [...prev, { role: "bot", text: payload.reply }]);
      setChatStatus("");
    },
    onError: () => {
      setChatMessages((prev) => [...prev, { role: "bot", text: "Chatbot is unavailable right now." }]);
      setChatStatus("");
    },
  });

  const notifications = noticeData?.notifications || [];
  const unreadCount = notifications.filter((n: any) => n.status === "unread").length;

  const profilePath =
    user?.role === "admin"  ? "/admin/students" :
    user?.role === "parent" ? "/parent"         : "/student/profile";

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!notifRef.current) return;
      if (notifRef.current.contains(event.target as Node)) return;
      setShowNotifications(false);
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!chatRef.current) return;
      if (chatRef.current.contains(event.target as Node)) return;
      setShowChat(false);
    };
    if (showChat) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showChat]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');

        @keyframes shellFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── topbar ── */
        .ds-topbar {
          position: sticky;
          top: 0; z-index: 40;
          background: var(--topbar-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          box-shadow: var(--topbar-shadow);
        }
        .ds-topbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 32px;
          height: 64px;
        }

        /* ── brand ── */
        .ds-brand {
          display: flex; align-items: center; gap: 14px; flex-shrink: 0;
        }
        .ds-logo {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 8px 22px rgba(15,23,42,0.08);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .ds-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
        .ds-portal-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brand-secondary);
          margin-bottom: 2px;
          font-weight: 600;
        }
        .ds-title {
          font-family: 'Poppins', sans-serif;
          font-size: 17px;
          color: var(--text-primary);
          font-weight: 600;
          line-height: 1.2;
        }

        /* ── nav links ── */
        .ds-nav {
          display: flex; align-items: center; gap: 2px;
          flex: 1; justify-content: center;
        }
        @media (max-width: 1024px) { .ds-nav { display: none; } }

        .ds-nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          letter-spacing: 0.02em;
          color: #334155;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 7px;
          transition: color 0.18s, background 0.18s, border-color 0.18s;
          white-space: nowrap;
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }
        .ds-nav-link:hover {
          color: #1d4ed8;
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .ds-nav-link.active {
          color: #1e40af;
          background: #ffffff;
          border-color: #93c5fd;
          box-shadow: 0 1px 8px rgba(30, 58, 138, 0.15);
        }

        /* ── actions ── */
        .ds-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .ds-icon-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--slate);
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
        }
        .ds-icon-btn:hover { border-color: #94a3b8; color: var(--text-primary); background: rgba(37,99,235,0.06); }
        .ds-bell-btn {
          width: 44px;
          height: 44px;
          border-radius: 10px;
        }
        .ds-icon-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 999px;
        }

        .ds-notif-panel {
          position: absolute;
          top: 46px;
          right: 0;
          width: 320px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 18px 40px rgba(15,23,42,0.15);
          z-index: 60;
          padding: 12px;
          display: grid;
          gap: 10px;
        }
        .ds-notif-item {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          display: grid;
          gap: 4px;
        }
        .ds-notif-item.unread {
          border-color: rgba(37,99,235,0.4);
          background: #eef2ff;
        }
        .ds-notif-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }
        .ds-notif-message {
          font-size: 12px;
          color: #475569;
        }
        .ds-notif-meta {
          font-size: 11px;
          color: #94a3b8;
        }
        .ds-notif-btn {
          font-size: 11px;
          font-weight: 600;
          border-radius: 999px;
          padding: 4px 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #1e3a8a;
          cursor: pointer;
          justify-self: start;
        }
        .ds-notif-btn.danger {
          color: #ef4444;
          border-color: rgba(239,68,68,0.3);
        }
        .ds-notif-empty {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          padding: 16px 6px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
        }

        .ds-chat-wrap {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 70;
        }
        .ds-chat-btn {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 18px 36px rgba(30,58,138,0.28);
          cursor: pointer;
        }
        .ds-chat-panel {
          position: absolute;
          bottom: 74px;
          right: 0;
          width: 460px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 18px 40px rgba(15,23,42,0.16);
          display: grid;
          grid-template-rows: auto 1fr auto;
          overflow: hidden;
        }
        .ds-chat-header {
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          background: #f8fafc;
        }
        .ds-chat-body {
          padding: 14px;
          display: grid;
          gap: 8px;
          max-height: 460px;
          overflow: auto;
        }
        .ds-chat-msg {
          font-size: 13px;
          line-height: 1.5;
          padding: 10px 12px;
          border-radius: 12px;
          max-width: 90%;
          white-space: pre-wrap;
        }
        .ds-chat-msg.user {
          background: #1e3a8a;
          color: #ffffff;
          justify-self: end;
        }
        .ds-chat-msg.bot {
          background: #f1f5f9;
          color: #0f172a;
          justify-self: start;
        }
        .ds-chat-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #e2e8f0;
        }
        .ds-chat-input input {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13px;
        }
        .ds-chat-send {
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          cursor: pointer;
        }

        .ds-user-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 7px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: var(--slate);
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s;
          white-space: nowrap;
        }
        .ds-user-btn:hover { border-color: #94a3b8; color: var(--text-primary); }

        @media (max-width: 768px) { .ds-user-btn { display: none; } }

        .ds-logout-btn {
          display: flex; align-items: center; gap: 7px;
          background: var(--surface);
          border: 1px solid rgba(244,63,94,0.22);
          border-radius: 8px;
          padding: 7px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #f43f5e;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s;
          white-space: nowrap;
        }
        .ds-logout-btn:hover {
          background: rgba(244,63,94,0.07);
          border-color: rgba(244,63,94,0.4);
        }

        /* ── subtitle bar ── */
        .ds-subtitle-bar {
          padding: 12px 32px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ds-subtitle-accent { width: 3px; height: 14px; border-radius: 99px; background: var(--brand-secondary); flex-shrink: 0; }
        .ds-subtitle-text {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: var(--slate);
          letter-spacing: 0.02em;
        }

        /* ── shell / content ── */
        .ds-shell {
          min-height: 100vh;
          background: var(--page-bg);
          background-image:
            radial-gradient(ellipse at 15% 0%,  var(--page-grad-1) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 10%, var(--page-grad-2) 0%, transparent 50%);
          background-attachment: fixed;
        }
        .ds-content {
          max-width: none;
          padding: 28px 32px 64px;
          display: grid;
          gap: 20px;
          animation: shellFadeUp 0.4s ease both;
        }
        @media (max-width: 768px) {
          .ds-topbar-inner { padding: 0 16px; }
          .ds-subtitle-bar  { padding: 10px 16px; }
          .ds-content       { padding: 20px 16px 48px; }
        }
      `}</style>

      <div className="ds-shell">
        {/* ── Topbar ── */}
        <header className="ds-topbar">
          <div className="ds-topbar-inner">

            {/* Brand */}
            <div className="ds-brand">
              <div className="ds-logo">
                <img src="/brand/university-logo.svg" alt="University logo"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div>
                <p className="ds-portal-label">University Portal</p>
                <p className="ds-title">{title}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="ds-nav">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("ds-nav-link", pathname === item.href ? "active" : "")}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/settings"
                className={cn("ds-nav-link", pathname === "/settings" ? "active" : "")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Settings size={13} />
                Settings
              </Link>
            </nav>

            {/* Actions */}
            <div className="ds-actions">
              {user?.role === "admin" ? (
                <div style={{ position: "relative" }} ref={notifRef}>
                  <button
                    className="ds-icon-btn ds-bell-btn"
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    style={{ position: "relative" }}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="ds-icon-badge">{unreadCount}</span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="ds-notif-panel">
                      {notifications.length === 0 ? (
                        <div className="ds-notif-empty">No new requests.</div>
                      ) : (
                        notifications.slice(0, 5).map((note: any) => (
                          <div
                            key={note._id}
                            className={`ds-notif-item${note.status === "unread" ? " unread" : ""}`}
                          >
                            <div className="ds-notif-name">{note.senderName || "Student"}</div>
                            <div className="ds-notif-message">{note.message}</div>
                            <div className="ds-notif-meta">
                              {note.senderEmail || "Unknown email"} • {new Date(note.createdAt).toLocaleString()}
                            </div>
                            {note.status === "unread" && (
                              <button
                                className="ds-notif-btn"
                                type="button"
                                onClick={() => markReadMutation.mutate(note._id)}
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              className="ds-notif-btn danger"
                              type="button"
                              onClick={() => deleteMutation.mutate(note._id)}
                            >
                              Delete
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              <button
                className="ds-user-btn"
                type="button"
                onClick={() => router.push(profilePath)}
              >
                <UserCircle2 size={15} style={{ color: "var(--brand-accent)" }} />
                {user?.name || "Signed in user"}
              </button>

              <button
                className="ds-logout-btn"
                type="button"
                onClick={() => {
                  setSession(null);
                  router.push("/signin");
                }}
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* ── Subtitle bar ── */}
        <div className="ds-subtitle-bar">
          <div className="ds-subtitle-accent" />
          <p className="ds-subtitle-text">{subtitle}</p>
        </div>

        {/* ── Content ── */}
        <div className="ds-content">
          {children}
        </div>
      </div>

      <div className="ds-chat-wrap" ref={chatRef}>
        {showChat && (
          <div className="ds-chat-panel">
            <div className="ds-chat-header">Campus Assistant</div>
            <div className="ds-chat-body">
              {chatMessages.length === 0 && (
                <div className="ds-chat-msg bot">
                  Hi! Ask me about profiles, documents, achievements, or reports.
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={`${msg.role}-${idx}`} className={`ds-chat-msg ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {chatStatus && <div className="ds-chat-msg bot">{chatStatus}</div>}
            </div>
            <form
              className="ds-chat-input"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = chatInput.trim();
                if (!trimmed) return;
                setChatMessages((prev) => [...prev, { role: "user", text: trimmed }]);
                setChatInput("");
                setChatStatus("Thinking...");
                chatMutation.mutate(trimmed);
              }}
            >
              <input
                type="text"
                placeholder="Type your question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button className="ds-chat-send" type="submit">Send</button>
            </form>
          </div>
        )}
        <button
          className="ds-chat-btn"
          type="button"
          aria-label="Open chatbot"
          onClick={() => setShowChat((prev) => !prev)}
        >
          <MessageSquare size={20} />
        </button>
      </div>
    </>
  );
}
