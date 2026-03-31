import { SignInForm } from "@/components/forms/sign-in-form";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "#f6f8fa",
        fontFamily: "'Geist', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgb(251, 251, 251) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgb(255, 255, 255) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Card wrapper */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid #d0d7de",
          borderRadius: "24px",
          boxShadow:
            "0 8px 32px rgba(31,35,40,0.10), 0 2px 8px rgba(31,35,40,0.06)",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: "4px",
            background: "linear-gradient(90deg, #1a56db 0%, #3b82f6 100%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "32px 36px 24px",
            borderBottom: "1px solid #eaeef2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "#1a56db",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              boxShadow: "0 2px 8px rgba(26,86,219,0.25)",
            }}
          >
            U
          </div>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#8b949e",
                marginBottom: "4px",
              }}
            >
              University Portal
            </p>
            <h1
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "26px",
                fontWeight: 400,
                color: "#0d1117",
                lineHeight: 1.1,
              }}
            >
              Welcome <em style={{ fontStyle: "italic", color: "#1a56db" }}>back</em>
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#57606a",
                marginTop: "6px",
              }}
            >
              Sign in to your account to continue
            </p>
          </div>
        </div>

        {/* Form area */}
        <div style={{ padding: "28px 36px 32px" }}>
          <SignInForm />
        </div>
      </div>
    </main>
  );
}