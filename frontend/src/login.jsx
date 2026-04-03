import { useState } from "react";

const GLOBAL_CSS = `
  :root {
    --bg: #0b0d12; --surface: #111318; --card: #16191f;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
    --indigo: #6366f1; --muted: #6b7280; --text: #e4e7ee; --subtext: #9ca3af;
    --body: "Inter", sans-serif; --display: "Syne", sans-serif;
  }
  .light { --bg: #f4f5f7; --surface: #ffffff; --card: #f9fafb; --border: rgba(0,0,0,0.07); --border2: rgba(0,0,0,0.13); --text: #111318; --subtext: #5a6172; --muted: #9ca3af; }
`;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recruiter");

  if (!document.getElementById("hb-login-style")) {
    const s = document.createElement("style");
    s.id = "hb-login-style";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }

  const inputStyle = {
    width: "100%", padding: "11px 14px", marginBottom: "12px",
    borderRadius: "10px", border: "1px solid var(--border2)",
    background: "rgba(255,255,255,.04)", color: "var(--text)",
    fontSize: "14px", fontFamily: "var(--body)", outline: "none",
    boxSizing: "border-box",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      email,
      role: role === "admin" ? "Admin" : "Recruiter",
      isLoggedIn: true,
    });
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)", fontFamily: "var(--body)",
    }}>
      <div style={{
        background: "var(--card)", padding: "36px 32px", borderRadius: "20px",
        width: "100%", maxWidth: "400px", border: "1px solid var(--border2)",
        boxShadow: "0 32px 64px rgba(0,0,0,.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: "24px", fontWeight: 800, color: "var(--text)" }}>HireBlind</div>
          <div style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, marginTop: 4 }}>EU AI Act · Enterprise</div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Email</label>
          <input type="email" placeholder="demo@hireblind.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required
            onFocus={e => e.target.style.borderColor = "var(--indigo)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"} />

          <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" placeholder="Any password (demo)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required
            onFocus={e => e.target.style.borderColor = "var(--indigo)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"} />

          <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer", marginBottom: "22px" }}
            onFocus={e => e.target.style.borderColor = "var(--indigo)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" style={{
            width: "100%", padding: "12px", background: "var(--indigo)", border: "none",
            borderRadius: "10px", color: "white", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", boxShadow: "0 0 20px rgba(99,102,241,.4)",
          }}>
            Sign In (Demo)
          </button>
        </form>

        <div style={{ fontSize: "11px", color: "var(--muted)", textAlign: "center", marginTop: "18px", lineHeight: 1.6 }}>
          Any email + any password · role determines PII access
        </div>
      </div>
    </div>
  );
}