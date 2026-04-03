import { useState } from "react";
import { ShieldCheck } from "lucide-react";

/**
 * LOGIN COMPONENT
 * ===============
 * Demo-only authentication screen.
 * Accepts ANY email/password combination.
 * Stores role selection in state (no backend auth required).
 * 
 * Role-based access control is enforced in the main App.jsx:
 * - Admin: Can reveal PII, perform overrides
 * - Recruiter: Can only view anonymized data
 * 
 * EU AI Act Compliance: Art. 5 (Human Agency & Oversight)
 */

const GLOBAL_CSS = `
  :root {
    --bg: #0b0d12;
    --surface: #111318;
    --card: #16191f;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --indigo: #6366f1;
    --indigo2: #818cf8;
    --emerald: #10b981;
    --text: #e4e7ee;
    --subtext: #9ca3af;
    --muted: #6b7280;
    --body: "Inter", sans-serif;
    --display: "Syne", sans-serif;
    --mono: "DM Mono", monospace;
  }
  .light {
    --bg: #f4f5f7;
    --surface: #ffffff;
    --card: #f9fafb;
    --border: rgba(0,0,0,0.07);
    --border2: rgba(0,0,0,0.13);
    --text: #111318;
    --subtext: #5a6172;
    --muted: #9ca3af;
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; font-family: var(--body); }
`;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recruiter");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inject styles once
  if (!document.getElementById("hb-login-style")) {
    const s = document.createElement("style");
    s.id = "hb-login-style";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);

    // Inject Google Fonts
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid var(--border2)",
    background: "rgba(255,255,255,.04)",
    color: "var(--text)",
    fontSize: "14px",
    fontFamily: "var(--body)",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);

    // Simulate network delay for realism
    setTimeout(() => {
      onLogin({
        email: email.trim(),
        role: role === "admin" ? "Admin" : "Recruiter",
        isLoggedIn: true,
      });
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        fontFamily: "var(--body)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--card)",
          padding: "44px 36px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "420px",
          border: "1px solid var(--border2)",
          boxShadow: "0 32px 64px rgba(0,0,0,.5)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "var(--indigo)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 24px rgba(99,102,241,.5)",
            }}
          >
            <ShieldCheck size={28} color="white" />
          </div>
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--text)",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            HireBlind
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            EU AI Act · Enterprise Screening
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
          {/* Email Field */}
          <label
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              display: "block",
              marginBottom: 7,
            }}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="demo@hireblind.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            style={inputStyle}
            required
            onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
          />

          {/* Password Field */}
          <label
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              display: "block",
              marginBottom: 7,
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="Any password (demo only)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            style={inputStyle}
            required
            onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
          />

          {/* Role Selector */}
          <label
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              display: "block",
              marginBottom: 7,
            }}
          >
            Select Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isSubmitting}
            style={{
              ...inputStyle,
              cursor: "pointer",
              marginBottom: "28px",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236366f1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "32px",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
          >
            <option value="recruiter">🔍 Recruiter — Limited PII Access</option>
            <option value="admin">👤 Admin — Full PII Access</option>
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--indigo)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
              cursor: isSubmitting ? "default" : "pointer",
              boxShadow: "0 0 20px rgba(99,102,241,.4)",
              opacity: isSubmitting ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign In (Demo)"}
          </button>
        </form>

        {/* Info Box */}
        <div
          style={{
            padding: "14px",
            background: "rgba(99,102,241,.08)",
            border: "1px solid rgba(99,102,241,.2)",
            borderRadius: "10px",
            fontSize: "11px",
            color: "var(--subtext)",
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          <strong style={{ color: "var(--indigo2)" }}>Demo Mode:</strong> Any email + any
          password works. Role determines feature access.
        </div>
      </div>
    </div>
  );
}
