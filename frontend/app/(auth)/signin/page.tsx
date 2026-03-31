import { SignInForm } from "@/components/forms/sign-in-form";

export default function SignInPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .signin-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          font-family: 'Geist', system-ui, sans-serif;
          background: #f6f8fa;
          position: relative;
          overflow: hidden;
        }

        .signin-blob-1 {
          position: absolute;
          top: -160px; right: -160px;
          width: 520px; height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .signin-blob-2 {
          position: absolute;
          bottom: -100px; left: -100px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .signin-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(26,86,219,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,86,219,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .signin-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(31,35,40,0.10), 0 2px 8px rgba(31,35,40,0.06);
          overflow: hidden;
        }

        .signin-accent-bar {
          height: 4px;
          background: linear-gradient(90deg, #1a56db 0%, #3b82f6 100%);
        }

        .signin-card-header {
          padding: 32px 36px 24px;
          border-bottom: 1px solid #eaeef2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
        }

        .signin-logo {
          width: 46px; height: 46px;
          background: #1a56db;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          color: white;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: -0.5px;
          box-shadow: 0 2px 10px rgba(26,86,219,0.28);
        }

        .signin-portal-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #8b949e;
          margin-bottom: 2px;
        }

        .signin-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 27px;
          font-weight: 400;
          color: #0d1117;
          line-height: 1.1;
        }
        .signin-title em { font-style: italic; color: #1a56db; }

        .signin-subtitle {
          font-size: 14px;
          color: #57606a;
          line-height: 1.6;
        }

        .signin-card-body {
          padding: 28px 36px 32px;
        }

        @media (max-width: 480px) {
          .signin-card-header,
          .signin-card-body { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      <main className="signin-root">
        <div className="signin-blob-1" />
        <div className="signin-blob-2" />
        <div className="signin-grid-overlay" />

        <div className="signin-card">
          <div className="signin-accent-bar" />

          <div className="signin-card-header">
            <div className="signin-logo">U</div>
            <div>
              <p className="signin-portal-label">University Portal</p>
              <h1 className="signin-title">
                Welcome <em>back</em>
              </h1>
              <p className="signin-subtitle">
                Sign in to access your academic dashboard
              </p>
            </div>
          </div>

          <div className="signin-card-body">
            <SignInForm />
          </div>
        </div>
      </main>
    </>
  );
}