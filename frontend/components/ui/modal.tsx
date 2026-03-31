"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

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
  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .modal-close-btn {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          color: #64748b;
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
          flex-shrink: 0;
        }
        .modal-close-btn:hover {
          border-color: #94a3b8;
          color: #0f172a;
          background: rgba(37,99,235,0.06);
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "modalFadeIn 0.2s ease both",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 51,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        overflowY: "auto",
        padding: "24px 16px",
        pointerEvents: "none",
      }}>
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 18,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          overflow: "hidden",
          padding: "28px",
          boxShadow: "0 40px 100px rgba(15,23,42,0.2)",
          animation: "modalSlideUp 0.28s cubic-bezier(0.22,1,0.36,1) both",
          pointerEvents: "all",
          position: "relative",
          margin: "auto 0",
        }}>

          {/* Ambient glow */}
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(37,99,235,0.12)", filter: "blur(30px)",
            pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 12,
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 99,
                background: "#1e3a8a", flexShrink: 0,
              }} />
              <h2 style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 20, fontWeight: 600,
                color: "#0f172a", margin: 0,
              }}>
                {title}
              </h2>
            </div>

            <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close">
              <X size={14} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #e2e8f0", marginBottom: 24 }} />

          {/* Content */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
