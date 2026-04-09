"use client";

const TONE_STYLES = {
  info: {
    border:     "rgba(59,130,246,0.25)",
    background: "rgba(59,130,246,0.07)",
    color:      "#3b82f6",
    icon:       "ℹ",
    accent:     "#3b82f6",
  },
  success: {
    border:     "rgba(16,185,129,0.25)",
    background: "rgba(16,185,129,0.07)",
    color:      "#10b981",
    icon:       "✓",
    accent:     "#10b981",
  },
  error: {
    border:     "rgba(244,63,94,0.25)",
    background: "rgba(244,63,94,0.07)",
    color:      "#f43f5e",
    icon:       "✕",
    accent:     "#f43f5e",
  },
} as const;

export function Alert({
  tone = "info",
  children,
  onClose,
}: {
  tone?: "info" | "success" | "error";
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const s = TONE_STYLES[tone];

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      borderRadius: 10,
      border: `1px solid ${s.border}`,
      background: s.background,
      padding: "11px 14px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      color: s.color,
      letterSpacing: "0.02em",
      lineHeight: 1.65,
      position: "relative",
    }}>
      {/* Left accent bar */}
      <div style={{
        width: 2,
        alignSelf: "stretch",
        borderRadius: 99,
        background: s.accent,
        flexShrink: 0,
        minHeight: 16,
      }} />

      {/* Icon */}
      <span style={{
        fontSize: 13,
        lineHeight: 1.4,
        flexShrink: 0,
        marginTop: 1,
      }}>
        {s.icon}
      </span>

      {/* Content */}
      <span style={{ flex: 1, paddingRight: onClose ? 24 : 0 }}>{children}</span>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "none",
            border: "none",
            color: s.color,
            cursor: "pointer",
            fontSize: 14,
            padding: 4,
            opacity: 0.6,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
        >
          ✕
        </button>
      )}
    </div>
  );
}