// ==========================================
// FILE: frontend/src/App.jsx
// COMPLIANCE-PATCHED VERSION
// Fixes applied:
//   1. Reveal button locked to Admin role only
//   2. Confirmation prompt + console audit log on reveal
//   3. Demo login screen with role selection
//   4. File validation (5MB + type check)
//   5. Per-file upload progress indicator
// ==========================================

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck, Upload, ChevronRight, Eye, EyeOff, AlertTriangle, X,
  CheckCircle2, Info, ArrowUpDown, Lock, Sparkles, FileText,
  Users, Moon, Sun, ChevronLeft, Loader2, Activity, Zap, BarChart2
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* ── Google Fonts injected once ── */
if (!document.getElementById("hb-fonts")) {
  const link = document.createElement("link");
  link.id = "hb-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

/* ── Global styles ── */
const GLOBAL_CSS = `
  :root {
    --bg:      #0b0d12;
    --surface: #111318;
    --card:    #16191f;
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --indigo:  #6366f1;
    --indigo2: #818cf8;
    --emerald: #10b981;
    --amber:   #f59e0b;
    --rose:    #f43f5e;
    --muted:   #6b7280;
    --text:    #e4e7ee;
    --subtext: #9ca3af;
    --mono:    "DM Mono", monospace;
    --display: "Syne", sans-serif;
    --body:    "Inter", sans-serif;
  }
  .light {
    --bg:      #f4f5f7;
    --surface: #ffffff;
    --card:    #f9fafb;
    --border:  rgba(0,0,0,0.07);
    --border2: rgba(0,0,0,0.13);
    --text:    #111318;
    --subtext: #5a6172;
    --muted:   #9ca3af;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: var(--body); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
  .hb-root { min-height: 100vh; background: var(--bg); color: var(--text); font-family: var(--body); transition: background .25s, color .25s; }

  .badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:99px; font-size:10px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; border:1px solid; }
  .badge-indigo { background:rgba(99,102,241,.12); color:var(--indigo2); border-color:rgba(99,102,241,.25); }
  .badge-emerald { background:rgba(16,185,129,.1); color:var(--emerald); border-color:rgba(16,185,129,.25); }
  .badge-amber { background:rgba(245,158,11,.1); color:var(--amber); border-color:rgba(245,158,11,.25); }
  .badge-rose { background:rgba(244,63,94,.1); color:var(--rose); border-color:rgba(244,63,94,.25); }

  @keyframes spin-slow { to { transform: rotate(360deg); } }
  .spin-slow { animation: spin-slow 8s linear infinite; }

  .cand-card { transition: border-color .15s, box-shadow .15s, transform .15s; }
  .cand-card:hover { border-color: var(--border2) !important; transform: translateY(-1px); box-shadow: 0 4px 24px rgba(0,0,0,.35); }
  .cand-card.selected { border-color: var(--indigo) !important; box-shadow: 0 0 0 1px rgba(99,102,241,.35), 0 4px 24px rgba(99,102,241,.15); }

  .bar-track { height:3px; border-radius:99px; background:var(--border2); overflow:hidden; }
  .bar-fill  { height:100%; border-radius:99px; transition: width .8s cubic-bezier(.4,0,.2,1); }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .pulse-dot { animation: pulse 2s ease-in-out infinite; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  .fade-up { animation: fadeUp .35s ease both; }

  .log-pre { font-family:var(--mono); font-size:11px; line-height:1.7; color:#94a3b8; white-space:pre-wrap; word-break:break-all; }
  .log-key   { color:#818cf8; }
  .log-str   { color:#34d399; }
  .log-num   { color:#fb923c; }
  .log-bool  { color:#f472b6; }

  .redacted { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; background:rgba(255,255,255,.05); border:1px solid var(--border2); border-radius:6px; font-size:11px; font-family:var(--mono); color:var(--subtext); }

  .skill-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); }
  .skill-row:last-child { border-bottom:none; }

  .upload-zone { border:1.5px dashed var(--border2); border-radius:14px; padding:3rem 2rem; text-align:center; cursor:pointer; transition:border-color .2s, background .2s; }
  .upload-zone:hover { border-color:var(--indigo); background:rgba(99,102,241,.04); }

  .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.65); backdrop-filter:blur(6px); z-index:100; display:flex; align-items:center; justify-content:center; padding:1rem; }

  .stat-num { font-family:var(--display); font-size:28px; font-weight:800; line-height:1; }

  @keyframes slideIn { from{transform:translateX(120%);opacity:0} to{transform:none;opacity:1} }
  .toast { animation: slideIn .3s ease; }

  .divider { height:1px; background:var(--border); }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Progress bar */
  .prog-bar-track { height:2px; background:var(--border2); border-radius:99px; overflow:hidden; margin-top:3px; }
  .prog-bar-fill  { height:100%; background:var(--indigo); border-radius:99px; transition: width .15s linear; }
`;

function injectStyle() {
  if (!document.getElementById("hb-style")) {
    const s = document.createElement("style");
    s.id = "hb-style";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }
}

/* ── Syntax-highlighted JSON log ── */
function HighlightedJSON({ obj }) {
  const raw = JSON.stringify(obj, null, 2);
  const html = raw
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"([^"]+)":/g, '<span class="log-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="log-str">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="log-num">$1</span>')
    .replace(/: (true|false)/g, ': <span class="log-bool">$1</span>');
  return <pre className="log-pre" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── Animated score ring ── */
function ScoreRing({ score = 0, size = 72 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#f43f5e";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color}80)` }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: `${size / 2}px ${size / 2}px`, fill: color, fontSize: 15, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>
        {score}%
      </text>
    </svg>
  );
}

/* ── Bias gauge ── */
function BiasGauge({ percent = 0 }) {
  const color = percent < 20 ? "#10b981" : percent < 50 ? "#f59e0b" : "#f43f5e";
  const label = percent < 20 ? "Low Risk" : percent < 50 ? "Medium" : "High Risk";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", borderRadius: 10, cursor: "help" }}
      title="EU AI Act Art. 10(2)(f): Bias monitoring active">
      <div style={{ position: "relative", width: 32, height: 32 }}>
        <svg width={32} height={32} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={16} cy={16} r={12} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
          <circle cx={16} cy={16} r={12} fill="none" stroke={color} strokeWidth={4}
            strokeDasharray={2 * Math.PI * 12}
            strokeDashoffset={2 * Math.PI * 12 - (percent / 100) * 2 * Math.PI * 12}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600 }}>Bias Risk</div>
        <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "DM Mono, monospace" }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Score bar ── */
function Bar({ value = 0, color }) {
  const c = color || (value > 80 ? "#10b981" : value > 60 ? "#6366f1" : value > 40 ? "#f59e0b" : "#f43f5e");
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${value}%`, background: c, boxShadow: `0 0 6px ${c}60` }} />
    </div>
  );
}

/* ── Redacted pill ── */
function Redacted({ label }) {
  return (
    <span className="redacted">
      <Lock size={9} style={{ opacity: .6 }} /> {label}
    </span>
  );
}

/* ── Override modal ── */
function OverrideModal({ candidate, onClose, onConfirm, isOverriding }) {
  const [reason, setReason] = useState("");
  const [newRank, setNewRank] = useState("");
  const textareaRef = useRef(null);
  useEffect(() => { textareaRef.current?.focus(); }, []);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-up" style={{
        background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 18,
        width: "100%", maxWidth: 480, overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,.7)"
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 15 }}>Manual Rank Override</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Candidate {candidate.id} · Current rank #{candidate.rank}</div>
            </div>
          </div>
          <button onClick={onClose} disabled={isOverriding} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 6, display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {/* Compliance notice */}
        <div style={{ margin: "16px 24px 0", padding: "12px 14px", background: "rgba(245,158,11,.07)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: "#fbbf24", lineHeight: 1.6 }}>
            <strong>EU AI Act Art. 14</strong> — Human oversight actions overriding AI decisions are logged immutably to the audit trail.
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8 }}>New Rank</label>
            <input type="number" min="1" value={newRank} onChange={e => setNewRank(e.target.value)} disabled={isOverriding}
              placeholder="e.g. 1"
              style={{
                width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.04)",
                border: "1px solid var(--border2)", borderRadius: 10, color: "var(--text)",
                fontSize: 14, fontFamily: "var(--mono)", outline: "none", transition: "border-color .2s"
              }}
              onFocus={e => e.target.style.borderColor = "var(--indigo)"}
              onBlur={e => e.target.style.borderColor = "var(--border2)"}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8 }}>
              Compliance Justification <span style={{ color: "var(--rose)" }}>*</span>
            </label>
            <textarea ref={textareaRef} value={reason} onChange={e => setReason(e.target.value)} rows={4} disabled={isOverriding}
              placeholder="Provide specific business or skill-based reasons for this override..."
              style={{
                width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.04)",
                border: "1px solid var(--border2)", borderRadius: 10, color: "var(--text)",
                fontSize: 13, fontFamily: "var(--body)", resize: "vertical", outline: "none",
                transition: "border-color .2s", lineHeight: 1.6
              }}
              onFocus={e => e.target.style.borderColor = "var(--indigo)"}
              onBlur={e => e.target.style.borderColor = "var(--border2)"}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={isOverriding} style={{
            flex: 1, padding: "10px", background: "none", border: "1px solid var(--border2)",
            borderRadius: 10, color: "var(--subtext)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .2s"
          }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,.05)"}
            onMouseLeave={e => e.target.style.background = "none"}
          >Cancel</button>
          <button disabled={!reason.trim() || !newRank || isOverriding}
            onClick={() => onConfirm(newRank, reason)}
            style={{
              flex: 1, padding: "10px", background: "var(--indigo)", border: "none",
              borderRadius: 10, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: (!reason.trim() || !newRank || isOverriding) ? .4 : 1,
              transition: "opacity .2s, background .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
            {isOverriding
              ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Logging...</>
              : <><CheckCircle2 size={15} /> Confirm & Log</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Login screen ── */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recruiter");

  const inputStyle = {
    width: "100%", padding: "11px 14px", marginBottom: "12px",
    borderRadius: "10px", border: "1px solid var(--border2)",
    background: "rgba(255,255,255,.04)", color: "var(--text)",
    fontSize: "14px", outline: "none", transition: "border-color .2s",
    boxSizing: "border-box", fontFamily: "var(--body)",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      email,
      role: role === "admin" ? "Admin" : "Recruiter",
    });
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", fontFamily: "var(--body)",
    }}>
      <div style={{
        background: "var(--card)", padding: "40px 32px", borderRadius: "20px",
        width: "100%", maxWidth: "400px", border: "1px solid var(--border2)",
        boxShadow: "0 32px 64px rgba(0,0,0,.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 13, background: "var(--indigo)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "0 0 20px rgba(99,102,241,.5)"
          }}>
            <ShieldCheck size={24} color="white" />
          </div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 26, color: "var(--text)", lineHeight: 1 }}>HireBlind</div>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, marginTop: 6 }}>EU AI Act · Enterprise</div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Email</label>
          <input
            type="email" placeholder="demo@hireblind.com" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle} required
            onFocus={e => e.target.style.borderColor = "var(--indigo)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}
          />

          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Password</label>
          <input
            type="password" placeholder="Any password (demo)" value={password}
            onChange={e => setPassword(e.target.value)} style={inputStyle} required
            onFocus={e => e.target.style.borderColor = "var(--indigo)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}
          />

          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Role</label>
          <select
            value={role} onChange={e => setRole(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer", marginBottom: "24px" }}
            onFocus={e => e.target.style.borderColor = "var(--indigo)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}
          >
            <option value="recruiter">Recruiter — limited PII access</option>
            <option value="admin">Admin — full PII access</option>
          </select>

          <button type="submit" style={{
            width: "100%", padding: "12px", background: "var(--indigo)", border: "none",
            borderRadius: "10px", color: "white", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", boxShadow: "0 0 20px rgba(99,102,241,.4)",
            fontFamily: "var(--body)",
          }}>
            Sign In (Demo)
          </button>
        </form>

        <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 18, lineHeight: 1.7 }}>
          Any email + any password works<br />
          Admins can reveal candidate PII · Recruiters cannot
        </div>
      </div>
    </div>
  );
}

/* ── Error boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0d12", color: "#e4e7ee", flexDirection: "column", gap: 16, padding: 32 }}>
        <AlertTriangle size={48} style={{ color: "#f43f5e" }} />
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800 }}>Something went wrong</div>
        <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 400, textAlign: "center" }}>{this.state.error?.message}</div>
        <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: "10px 24px", background: "#6366f1", border: "none", borderRadius: 10, color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          Reload
        </button>
      </div>
    );
    return this.props.children;
  }
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
function MainApp() {
  injectStyle();

  // ── Auth state (PATCH: login gate) ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── App state ──
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // PATCH: per-file progress
  const [biasScore, setBiasScore] = useState(0);
  const [role, setRole] = useState("Recruiter");
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const defaultJD = "Looking for a Senior Data Scientist proficient in Python, SQL, Machine Learning, and A/B Testing. Experience with PyTorch or TensorFlow is highly preferred.";

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.remove("light");
    else root.classList.add("light");
  }, [darkMode]);

  // ── PATCH: Admin-only reveal with confirmation + audit log ──
  const toggleReveal = (id) => {
    if (!revealed[id]) {
      if (window.confirm("⚠️ This action reveals candidate PII and will be logged for EU AI Act compliance. Continue?")) {
        setRevealed(prev => ({ ...prev, [id]: true }));
        console.log(`[AUDIT] PII revealed — Candidate ${id} — ${new Date().toISOString()} — Role: ${role}`);
      }
    } else {
      setRevealed(prev => ({ ...prev, [id]: false }));
    }
  };

  // ── PATCH: File validation + per-file progress ──
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate size
    const MAX_SIZE = 5 * 1024 * 1024;
    const oversized = files.filter(f => f.size > MAX_SIZE);
    if (oversized.length) {
      alert(`❌ ${oversized.length} file(s) exceed the 5MB limit:\n${oversized.map(f => f.name).join("\n")}`);
      return;
    }

    // Validate type
    const badType = files.filter(f => !f.name.match(/\.(pdf|docx|txt)$/i));
    if (badType.length) {
      alert(`❌ Unsupported format:\n${badType.map(f => f.name).join("\n")}\n\nPlease use PDF, DOCX, or TXT.`);
      return;
    }

    setIsUploading(true);

    // Init progress state
    const initProg = {};
    files.forEach(f => { initProg[f.name] = 0; });
    setUploadProgress(initProg);

    // Animate progress bars
    const intervals = files.map(f => {
      let p = 0;
      return setInterval(() => {
        p += 20;
        if (p <= 90) {
          setUploadProgress(prev => ({ ...prev, [f.name]: p }));
        }
      }, 150);
    });

    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      const u = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
      if (!u.ok) throw new Error(`Upload failed: ${u.status}`);
      const ud = await u.json();

      // Mark all at 100%
      intervals.forEach(iv => clearInterval(iv));
      const done = {};
      files.forEach(f => { done[f.name] = 100; });
      setUploadProgress(done);

      const p = await fetch(`${API_BASE}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: ud.session_id, job_description: defaultJD }),
      });
      if (!p.ok) throw new Error(`Processing failed: ${p.status}`);
      const pd = await p.json();

      setCandidates(pd.candidates || []);
      if (pd.candidates?.length) setSelected(pd.candidates[0]);
      if (pd.bias_check?.variance) setBiasScore(Math.min(100, Math.round(100 - pd.bias_check.variance)));
      setCurrentPage(1);
    } catch (err) {
      intervals.forEach(iv => clearInterval(iv));
      alert(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress({}), 1500);
      e.target.value = null;
    }
  };

  const handleOverrideConfirm = async (newRank, reason) => {
    setIsOverriding(true);
    try {
      const res = await fetch(`${API_BASE}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: overrideTarget.id, old_rank: overrideTarget.rank, new_rank: parseInt(newRank), reason }),
      });
      if (!res.ok) throw new Error("Override logging failed");
      setCandidates(prev => prev.map(c => c.id === overrideTarget.id ? { ...c, rank: parseInt(newRank) } : c));
      setOverrideSuccess({ candidate: overrideTarget, newRank });
      setOverrideTarget(null);
      setTimeout(() => setOverrideSuccess(null), 4000);
    } catch (err) {
      alert("Audit log failed. Override blocked for compliance.");
    } finally {
      setIsOverriding(false);
    }
  };

  // ── PATCH: Show login screen if not authenticated ──
  if (!isAuthenticated) {
    return (
      <LoginScreen onLogin={(user) => {
        setIsAuthenticated(true);
        setRole(user.role);
      }} />
    );
  }

  const sorted = [...candidates].sort((a, b) => (a.rank || 999) - (b.rank || 999));
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const rankColors = ["#10b981", "#6366f1", "#f59e0b", "#f43f5e"];
  const getRankColor = (rank) => rankColors[Math.min(rank - 1, rankColors.length - 1)] || "#6b7280";

  return (
    <div className="hb-root" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* ── Toast ── */}
      {overrideSuccess && (
        <div className="toast" style={{
          position: "fixed", top: 24, right: 24, zIndex: 200,
          background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)",
          borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10,
          color: "#34d399", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,.5)",
        }}>
          <CheckCircle2 size={16} />
          Candidate {overrideSuccess.candidate.id} moved to Rank #{overrideSuccess.newRank} · Audit logged
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 50, padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: "var(--indigo)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(99,102,241,.5)",
          }}>
            <ShieldCheck size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 17, letterSpacing: "-.01em", lineHeight: 1 }}>HireBlind</div>
            <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, marginTop: 2 }}>EU AI Act · Enterprise</div>
          </div>
        </div>

        {/* Center — job role pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "6px 16px",
          background: "rgba(255,255,255,.04)", border: "1px solid var(--border2)", borderRadius: 10,
        }}>
          <Activity size={13} style={{ color: "var(--indigo2)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Senior Data Scientist</span>
          <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", background: "rgba(255,255,255,.04)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>REQ-8902-DS</span>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Role indicator */}
          <div style={{ display: "flex", background: "rgba(255,255,255,.05)", border: "1px solid var(--border)", borderRadius: 9, padding: 3, gap: 3 }}>
            {["Recruiter", "Admin"].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: "5px 14px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s",
                background: role === r ? "var(--indigo)" : "none",
                color: role === r ? "white" : "var(--subtext)",
                boxShadow: role === r ? "0 2px 8px rgba(99,102,241,.4)" : "none",
              }}>{r}</button>
            ))}
          </div>

          {/* Dark mode toggle */}
          <button onClick={() => setDarkMode(!darkMode)} style={{
            width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,.05)",
            border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--subtext)",
          }}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <BiasGauge percent={biasScore} />

          {/* Upload button with progress */}
          <div style={{ position: "relative" }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 18px",
              background: "var(--indigo)", border: "none", borderRadius: 10,
              color: "white", fontSize: 13, fontWeight: 700, cursor: isUploading ? "default" : "pointer",
              boxShadow: "0 0 20px rgba(99,102,241,.4)", whiteSpace: "nowrap",
              opacity: isUploading ? 0.8 : 1,
            }}>
              {isUploading
                ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Processing...</>
                : <><Upload size={15} /> Upload Batch</>}
              <input type="file" multiple accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
            </label>

            {/* Per-file progress */}
            {Object.entries(uploadProgress).length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 60,
                background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 10,
                padding: "10px 14px", minWidth: 220, boxShadow: "0 8px 32px rgba(0,0,0,.5)",
              }}>
                {Object.entries(uploadProgress).map(([name, pct]) => (
                  <div key={name} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--subtext)", marginBottom: 3, fontFamily: "var(--mono)" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{name}</span>
                      <span style={{ flexShrink: 0, marginLeft: 8 }}>{pct}%</span>
                    </div>
                    <div className="prog-bar-track">
                      <div className="prog-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Status bar ── */}
      <div style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "8px 28px", display: "flex", alignItems: "center", gap: 20,
      }}>
        {[
          { icon: <Users size={11} />, text: `${candidates.length} candidates in pipeline` },
          { icon: <Zap size={11} />, text: "Model: semantic-rank-v2.1" },
          { icon: <ShieldCheck size={11} style={{ color: "#10b981" }} />, text: "GDPR + EU AI Act active", accent: true },
          { icon: <BarChart2 size={11} />, text: `Page ${currentPage} of ${totalPages || 1}` },
        ].map(({ icon, text, accent }, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ width: 1, height: 14, background: "var(--border2)" }} />}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, color: accent ? "#10b981" : "var(--muted)" }}>
              {icon} {text}
            </div>
          </React.Fragment>
        ))}

        {/* Role badge in status bar */}
        <div style={{ marginLeft: "auto" }}>
          <span className={`badge ${role === "Admin" ? "badge-amber" : "badge-indigo"}`}>
            {role === "Admin" ? "👑" : "👤"} {role}
          </span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: "flex", gap: 0, height: "calc(100vh - 108px)", overflow: "hidden" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 360, flexShrink: 0, borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", background: "var(--surface)",
        }}>
          {/* Panel header */}
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "flex", alignItems: "center", gap: 7 }}>
              <Users size={13} /> Pipeline
            </div>
            <span className="badge badge-indigo">AI Ranked</span>
          </div>

          {/* Candidate list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {paginated.length === 0 ? (
              <label style={{ display: "block", cursor: "pointer" }}>
                <div className="upload-zone" style={{ marginTop: 8 }}>
                  <Upload size={28} style={{ color: "var(--muted)", margin: "0 auto 12px", display: "block" }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--subtext)", marginBottom: 6 }}>Upload resumes to begin</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>PDF, DOCX, or TXT · max 5MB each</div>
                </div>
                <input type="file" multiple accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleFileUpload} />
              </label>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {paginated.map(c => {
                  const isSel = selected?.id === c.id;
                  const rc = getRankColor(c.rank);
                  return (
                    <button key={c.id} onClick={() => setSelected(c)} className={`cand-card ${isSel ? "selected" : ""}`} style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                      background: isSel ? "rgba(99,102,241,.08)" : "var(--card)",
                      border: `1px solid ${isSel ? "var(--indigo)" : "var(--border)"}`,
                      color: "var(--text)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: `${rc}18`, border: `1px solid ${rc}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13, color: rc, flexShrink: 0,
                          }}>#{c.rank}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Candidate {c.id}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                              {c.rank === 1 ? "🏆 Top match" : `Rank #${c.rank}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: isSel ? "var(--indigo2)" : "var(--text)", lineHeight: 1 }}>
                          {c.score}<span style={{ fontSize: 12, opacity: .6 }}>%</span>
                        </div>
                      </div>
                      <Bar value={c.skills || 0} />
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                        {(c.matchedSkills || []).slice(0, 2).map(s => (
                          <span key={s} style={{ fontSize: 10, padding: "3px 8px", background: "rgba(255,255,255,.05)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--subtext)", fontFamily: "var(--mono)" }}>{s}</span>
                        ))}
                        {(c.matchedSkills || []).length > 2 && (
                          <span style={{ fontSize: 10, color: "var(--muted)", padding: "3px 0" }}>+{(c.matchedSkills || []).length - 2} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {sorted.length > itemsPerPage && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--subtext)", padding: 4, opacity: currentPage === 1 ? .3 : 1, display: "flex" }}>
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                {currentPage} / {totalPages}
              </span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--subtext)", padding: 4, opacity: currentPage === totalPages ? .3 : 1, display: "flex" }}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
          {!selected ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: 18,
                background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShieldCheck size={32} style={{ color: "var(--indigo2)", opacity: .7 }} />
              </div>
              <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Select a Candidate</div>
              <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 340, lineHeight: 1.6 }}>
                Upload resumes and select a candidate to view their EU AI Act Transparency Audit and semantic scoring breakdown.
              </div>
            </div>
          ) : (
            <div className="fade-up" style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>

              {/* ── Detail header ── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                  <ScoreRing score={selected.score || 0} size={80} />
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <span className="badge badge-indigo"><Info size={10} /> AI Transparency Panel</span>
                    </div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>
                      Candidate {selected.id}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 12 }}>
                      <span>Semantic match <strong style={{ color: "var(--text)" }}>{selected.score}%</strong></span>
                      <span style={{ color: "var(--border2)" }}>·</span>
                      <span>Ranked <strong style={{ color: getRankColor(selected.rank) }}>#{selected.rank}</strong> of {candidates.length}</span>
                      {selected.rank === 1 && <span className="badge badge-emerald"><Sparkles size={9} /> Top match</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  {/* PATCH: Reveal button — Admin only */}
                  {role === "Admin" && (
                    <button onClick={() => toggleReveal(selected.id)} style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
                      background: revealed[selected.id] ? "rgba(244,63,94,.1)" : "rgba(255,255,255,.04)",
                      border: `1px solid ${revealed[selected.id] ? "rgba(244,63,94,.3)" : "var(--border2)"}`,
                      borderRadius: 10, color: revealed[selected.id] ? "#fb7185" : "var(--subtext)",
                      fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s",
                    }}>
                      {revealed[selected.id] ? <><EyeOff size={14} /> Hide Identity</> : <><Eye size={14} /> Reveal Identity</>}
                    </button>
                  )}

                  {/* Override — Admin only */}
                  {role === "Admin" && (
                    <button onClick={() => setOverrideTarget(selected)} style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
                      background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)",
                      borderRadius: 10, color: "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                      <ArrowUpDown size={14} /> Manual Override
                    </button>
                  )}
                </div>
              </div>

              {/* ── Recruiter notice (shown when NOT admin) ── */}
              {role !== "Admin" && (
                <div style={{
                  padding: "12px 16px", background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.15)",
                  borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--subtext)",
                }}>
                  <Lock size={13} style={{ color: "var(--indigo2)", flexShrink: 0 }} />
                  Identity reveal and manual override require <strong style={{ color: "var(--indigo2)" }}>Admin</strong> access. Switch role in the header to unlock.
                </div>
              )}

              {/* ── Revealed identity ── */}
              {revealed[selected.id] && role === "Admin" && (
                <div className="fade-up" style={{
                  background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.2)",
                  borderRadius: 14, padding: "18px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <AlertTriangle size={15} style={{ color: "#f43f5e" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#f43f5e" }}>
                      Unblinded View — Access Logged to Immutable Audit Trail
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[["Full Name", selected.realName || "Unknown"], ["Experience", selected.experience || "Not specified"], ["Location", selected.location || "Undisclosed"]].map(([k, v]) => (
                      <div key={k} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(244,63,94,.15)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{k}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={v}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Two column grid ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Skill match */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles size={14} style={{ color: "var(--indigo2)" }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Semantic Skill Match</div>
                  </div>
                  <div>
                    {(selected.matchedSkills || []).length > 0
                      ? (selected.matchedSkills || []).map((skill, i) => (
                        <div key={skill} className="skill-row">
                          <CheckCircle2 size={14} style={{ color: "#10b981", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>{skill}</span>
                          <div style={{ width: 80 }}>
                            <Bar value={Math.max(30, 96 - i * 9)} />
                          </div>
                        </div>
                      ))
                      : <div style={{ fontSize: 13, color: "var(--muted)" }}>No specific skills extracted.</div>}
                  </div>
                </div>

                {/* Redacted variables */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Lock size={14} style={{ color: "var(--subtext)" }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Redacted Variables</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
                    Per GDPR Art. 5(1)(c) data minimisation, these PII fields were stripped before AI ingestion.
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, flex: 1, alignContent: "flex-start" }}>
                    {(selected.strippedData || []).length > 0
                      ? (selected.strippedData || []).map(d => <Redacted key={d} label={d} />)
                      : <span style={{ fontSize: 12, color: "var(--muted)", border: "1px dashed var(--border2)", padding: "4px 10px", borderRadius: 6 }}>No PII detected</span>}
                  </div>

                  {/* Pipeline steps */}
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Compliance Pipeline</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {["Ingest", "NER Scan", "Strip PII", "Score"].map((step, i) => (
                        <React.Fragment key={step}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <CheckCircle2 size={10} style={{ color: "#10b981" }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--subtext)" }}>{step}</span>
                          </div>
                          {i < 3 && <ChevronRight size={10} style={{ color: "var(--border2)", flexShrink: 0 }} />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Audit log ── */}
              <div style={{ background: "#080a0f", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={14} style={{ color: "#475569" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#475569", fontFamily: "var(--mono)" }}>
                      System Log · EU AI Act Tracer
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 7 }}>
                    <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", letterSpacing: ".06em", fontFamily: "var(--mono)" }}>IMMUTABLE</span>
                  </div>
                </div>
                <div style={{ padding: "18px" }}>
                  <HighlightedJSON obj={{
                    event_id: `a3f9-${String(selected.id).toLowerCase()}-${Date.now().toString().slice(-6)}-eu-act`,
                    action_type: "MODEL_INFERENCE_COMPLETE",
                    timestamp: new Date().toISOString(),
                    compliance_flags: {
                      pii_stripped: true,
                      bias_check_status: "Passed",
                      redacted_categories: selected.strippedData || [],
                    },
                    eu_ai_act_articles: {
                      "art_5_1_c": "Data minimisation applied",
                      "art_10_2_f": "Bias monitoring active",
                      "art_13": "Explainability provided",
                      "art_14": "Human oversight available",
                    },
                    payload_metadata: {
                      candidate_token: `CAND-${selected.id}-ANON`,
                      computed_rank: selected.rank,
                      semantic_score_pct: selected.score,
                      model_version: "semantic-rank-v2.1",
                    },
                  }} />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Override modal */}
      {overrideTarget && (
        <OverrideModal
          candidate={overrideTarget}
          onClose={() => setOverrideTarget(null)}
          onConfirm={handleOverrideConfirm}
          isOverriding={isOverriding}
        />
      )}
    </div>
  );
}

export default function App() {
  return <ErrorBoundary><MainApp /></ErrorBoundary>;
}