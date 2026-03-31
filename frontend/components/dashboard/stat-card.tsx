export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 14,
      padding: "22px 24px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      animation: "statFadeUp 0.4s ease both",
    }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 20px 50px rgba(15,23,42,0.12)";
        el.style.borderColor = "#cbd5e1";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.borderColor = "#e2e8f0";
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
        @keyframes statFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Ambient glow spot */}
      <div style={{
        position: "absolute",
        top: -24, right: -24,
        width: 80, height: 80,
        borderRadius: "50%",
        background: "rgba(37,99,235,0.12)",
        filter: "blur(22px)",
        pointerEvents: "none",
      }} />

      {/* Label */}
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#64748b",
        margin: 0,
        fontWeight: 600,
      }}>
        {label}
      </p>

      {/* Value */}
      <p style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: 38,
        fontWeight: 600,
        color: "#1e3a8a",
        lineHeight: 1,
        margin: "12px 0 8px",
      }}>
        {value}
      </p>

      {/* Helper */}
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        color: "#64748b",
        margin: 0,
        letterSpacing: "0.02em",
      }}>
        {helper}
      </p>
    </div>
  );
}
