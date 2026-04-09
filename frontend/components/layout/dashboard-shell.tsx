"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Bell, LogOut, MessageSquare, Settings, UserCircle2, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/providers";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UniversityWordmark } from "@/components/layout/university-wordmark";

interface NavItem {
  label: string;
  href: string;
}

export function DashboardShell({
  title,
  subtitle,
  nav,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { setSession, user, token } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    "/student/profile";

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 w-full relative">
      
      {/* ── Mobile Menu Overlay ── */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-[260px] bg-white border-r border-surface-200 flex flex-col transition-transform duration-300 lg:translate-x-0 shrink-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Area */}
        <div className="p-4 border-b border-surface-200 flex flex-col items-center justify-center shrink-0 min-h-[120px] gap-2 bg-gradient-to-b from-surface-50/50 to-white">
          <div className="w-[150px] bg-white rounded-xl flex items-center justify-center transition-all">
             <UniversityWordmark className="w-full h-auto object-contain" />
          </div>
          <p className="font-sans text-[9px] font-black tracking-[0.2em] text-brand-600 uppercase text-center leading-tight px-2 opacity-80">VIGNAN&apos;S UNIVERSITY</p>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3.5 flex flex-col gap-1.5 scrollbar-hide">
          <div className="mb-1 px-3">
            <p className="font-sans text-[9px] font-bold tracking-widest uppercase text-slate-400 opacity-50">Navigation</p>
          </div>
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "font-sans text-[15px] font-semibold px-4 py-3 rounded-xl transition-all border flex items-center w-full uppercase tracking-tight",
                  isActive 
                    ? "bg-brand-50 text-brand-700 border-brand-100 shadow-sm" 
                    : "bg-transparent text-slate-500 border-transparent hover:bg-surface-50 hover:text-brand-600"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Nav */}
        <div className="p-3 border-t border-surface-200 flex flex-col gap-1.5 shrink-0 bg-surface-50/50">
           <Link
              href="/settings"
              className={cn(
                "font-sans text-[15px] font-semibold px-4 py-3 rounded-xl transition-all border flex items-center gap-2 uppercase tracking-tight",
                pathname === "/settings" 
                  ? "bg-white text-brand-700 border-brand-100 shadow-sm" 
                  : "bg-transparent text-slate-500 border-transparent hover:bg-white hover:text-brand-600 hover:border-surface-200"
              )}
            >
              <Settings size={16} />
              Settings
            </Link>
        </div>
      </aside>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 pb-20">
        
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-surface-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 lg:min-h-[52px]">
            <div className="flex items-center gap-2.5">
              <button 
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-brand-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
              <h1 className="font-display font-bold text-lg sm:text-xl text-ink leading-tight truncate">{title}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {actions}
              {user?.role === "admin" && (
                <div className="relative" ref={notifRef}>
                  <button
                    className="w-10 h-10 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors relative"
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setShowNotifications((prev) => !prev)}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white border border-surface-200 rounded-2xl shadow-panel p-3 z-50 flex flex-col gap-2">
                      {notifications.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center py-6 px-4 border border-dashed border-surface-300 rounded-xl">No new requests.</div>
                      ) : (
                        notifications.slice(0, 5).map((note: any) => (
                          <div
                            key={note._id}
                            className={cn(
                              "rounded-xl p-3 flex flex-col gap-1 border",
                              note.status === "unread" ? "border-brand-300 bg-brand-50/50" : "border-surface-200 bg-surface-50"
                            )}
                          >
                            <div className="text-sm font-semibold text-ink">{note.senderName || "Student"}</div>
                            <div className="text-xs text-slate-600">{note.message}</div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              {note.senderEmail || "Unknown email"} • {new Date(note.createdAt).toLocaleString()}
                            </div>
                            <div className="flex gap-2 mt-2">
                              {note.status === "unread" && (
                                <button
                                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-surface-300 bg-white text-brand-700 hover:border-brand-300 transition-colors"
                                  type="button"
                                  onClick={() => markReadMutation.mutate(note._id)}
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-red-200 bg-white text-red-600 hover:border-red-300 transition-colors"
                                type="button"
                                onClick={() => deleteMutation.mutate(note._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:border-surface-300 transition-colors max-w-[140px] truncate"
                type="button"
                onClick={() => router.push("/settings")}
                title="Account Settings"
              >
                <UserCircle2 size={16} className="text-brand-500 shrink-0" />
                <span className="truncate hidden sm:inline">{user?.name || "User"}</span>
              </button>

              <button
                className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 bg-white border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shrink-0"
                type="button"
                onClick={() => {
                  setSession(null);
                  router.push("/signin");
                }}
                title="Logout"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline ml-1.5">Logout</span>
              </button>
            </div>
          </div>
          
          {/* Subtitle bar */}
          <div className="bg-white border-b border-surface-100 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-2">
            <div className="w-0.5 h-2.5 rounded-full bg-accent-500 shrink-0"></div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest truncate">{subtitle}</p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 grid gap-3 sm:gap-4 animate-fade-up">
          {children}
        </main>
      </div>

      {/* ── Chatbot ── */}
      <div className="fixed right-6 bottom-6 z-50" ref={chatRef}>
        {showChat && (
           <div className="absolute bottom-20 right-0 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] bg-white border border-surface-200 rounded-2xl shadow-panel flex flex-col overflow-hidden">
            <div className="bg-brand-50 p-4 border-b border-surface-200 flex items-center justify-between">
              <span className="font-semibold text-brand-900 text-sm">Campus Assistant</span>
              <button 
                onClick={() => setShowChat(false)}
                className="text-brand-700 hover:text-brand-900 font-semibold text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-white">
              {chatMessages.length === 0 && (
                <div className="bg-surface-100 text-ink text-sm rounded-2xl rounded-tl-sm p-3 max-w-[85%] self-start">
                  Hi! Ask me about profiles, documents, achievements, or reports.
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div 
                  key={`${msg.role}-${idx}`} 
                  className={cn(
                    "text-sm rounded-2xl p-3 max-w-[85%] whitespace-pre-wrap",
                    msg.role === "user" 
                      ? "bg-brand-600 text-white rounded-tr-sm self-end"
                      : "bg-surface-100 text-ink border border-surface-200 rounded-tl-sm self-start"
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {chatStatus && (
                <div className="bg-surface-100 text-slate-500 text-sm rounded-2xl rounded-tl-sm p-3 max-w-[85%] self-start flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
            </div>
            <form
              className="p-3 bg-white border-t border-surface-200 flex gap-2"
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
                className="flex-1 bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-shadow"
                placeholder="Type your question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-brand-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
              >
                Send
              </button>
            </form>
          </div>
        )}
        <button
          className="w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-card flex items-center justify-center hover:bg-brand-700 hover:-translate-y-1 transition-all duration-300"
          type="button"
          aria-label="Open chatbot"
          onClick={() => setShowChat((prev) => !prev)}
        >
          <MessageSquare size={24} />
        </button>
      </div>
    </div>
  );
}
