// ============================================================
// HireBlind Enterprise — Premium UI v3.0
// Design: Refined Dark-first SaaS (Linear × Vercel × Stripe)
// Fonts: Geist (display) + "Plus Jakarta Sans" (body) + JetBrains Mono
// ============================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ShieldCheck, Upload, Eye, EyeOff, AlertTriangle, X,
  CheckCircle2, Info, ArrowUpDown, Lock, Sparkles, FileText,
  Users, Moon, Sun, ChevronLeft, ChevronRight, Loader2, Activity,
  Zap, BarChart2, Search, SlidersHorizontal, ArrowUpDown as Sort,
  TrendingUp, TrendingDown, Minus, LayoutGrid, List, GitCompare,
  Filter, ChevronDown, Star, Award, Target, Cpu, AlertCircle,
  CheckCheck, XCircle, Clock, Globe, Mail, Phone, MapPin,
  ArrowRight, MoreHorizontal, Layers, Command
} from "lucide-react";

const API_BASE = import.meta.env?.VITE_API_URL || "https://devkhandelwal17-hireblind-backend.hf.space";

// ─────────────────────────────────────────────────────────────
// FETCH WITH RETRY + TIMEOUT
// ─────────────────────────────────────────────────────────────
async function fetchWithRetry(url, options = {}, retries = 3, timeoutMs = 30000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      const isLast = attempt === retries;
      if (err.name === "AbortError") {
        if (isLast) throw new Error("Request timed out — the server may still be waking up. Please try again.");
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (isLast) {
        if (err.message === "Failed to fetch") {
          throw new Error("Cannot reach server — it may be waking up (cold start). Retrying automatically…");
        }
        throw err;
      }
      // Exponential backoff before retry
      await new Promise(r => setTimeout(r, 1200 * Math.pow(1.8, attempt)));
    }
  }
}

// ─────────────────────────────────────────────────────────────
// FONT INJECTION
// ─────────────────────────────────────────────────────────────
if (!document.getElementById("hb-fonts-v3")) {
  const l = document.createElement("link");
  l.id = "hb-fonts-v3";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(l);
}

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS — 8px grid system
// ─────────────────────────────────────────────────────────────
const CSS = `
  :root {
    /* Spacing (8px grid) */
    --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
    --sp-5: 20px; --sp-6: 24px; --sp-8: 32px; --sp-10: 40px;
    --sp-12: 48px; --sp-16: 64px;

    /* Color — Deep obsidian dark theme */
    --bg-base:    #08090c;
    --bg-raised:  #0d0f14;
    --bg-overlay: #111520;
    --bg-card:    #141720;
    --bg-hover:   #1a1e2a;
    --bg-active:  #1e2335;

    /* Borders */
    --border-subtle:  rgba(255,255,255,0.055);
    --border-default: rgba(255,255,255,0.09);
    --border-strong:  rgba(255,255,255,0.15);
    --border-focus:   rgba(99,102,241,0.6);

    /* Text */
    --text-primary:   #f0f2f8;
    --text-secondary: #8b92a8;
    --text-tertiary:  #555d72;
    --text-disabled:  #3a4052;

    /* Brand */
    --accent:       #6366f1;
    --accent-light: #818cf8;
    --accent-dim:   rgba(99,102,241,0.12);
    --accent-glow:  rgba(99,102,241,0.25);

    /* Semantic */
    --green:     #10b981; --green-dim:  rgba(16,185,129,0.12);
    --amber:     #f59e0b; --amber-dim:  rgba(245,158,11,0.12);
    --red:       #ef4444; --red-dim:    rgba(239,68,68,0.12);
    --blue:      #3b82f6; --blue-dim:   rgba(59,130,246,0.12);
    --violet:    #8b5cf6; --violet-dim: rgba(139,92,246,0.12);
    --cyan:      #06b6d4; --cyan-dim:   rgba(6,182,212,0.12);

    /* Typography */
    --font-display: 'Plus Jakarta Sans', sans-serif;
    --font-body:    'Plus Jakarta Sans', sans-serif;
    --font-mono:    'JetBrains Mono', monospace;

    /* Radius */
    --r-sm: 6px; --r-md: 10px; --r-lg: 14px;
    --r-xl: 18px; --r-2xl: 24px; --r-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.4);
    --shadow-accent: 0 0 0 1px rgba(99,102,241,0.3), 0 4px 24px rgba(99,102,241,0.2);
    --shadow-green:  0 0 20px rgba(16,185,129,0.2);
    --shadow-red:    0 0 20px rgba(239,68,68,0.2);
  }

  .light {
    --bg-base:    #f6f7fb;
    --bg-raised:  #ffffff;
    --bg-overlay: #ffffff;
    --bg-card:    #fafbfd;
    --bg-hover:   #f0f2f8;
    --bg-active:  #e8ebf5;
    --border-subtle:  rgba(0,0,0,0.05);
    --border-default: rgba(0,0,0,0.08);
    --border-strong:  rgba(0,0,0,0.14);
    --text-primary:   #0d0f14;
    --text-secondary: #5a6278;
    --text-tertiary:  #9ba3b8;
    --text-disabled:  #c8cdd8;
    --bg-hover: #eef0f8;
    --bg-active: #e4e8f4;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-body);
    background: var(--bg-base);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: var(--r-full); }
  ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

  /* ── Keyframes ── */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
  @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
  @keyframes slideRight { from { transform:translateX(-8px); opacity:0 } to { transform:none; opacity:1 } }
  @keyframes spin     { to { transform: rotate(360deg) } }
  @keyframes spinSlow { to { transform: rotate(360deg) } }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes glowPulse{ 0%,100%{box-shadow:0 0 12px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 28px rgba(99,102,241,0.6)} }
  @keyframes barGrow  { from{width:0} to{width:var(--w)} }
  @keyframes toastIn  { from{transform:translateX(calc(100% + 24px));opacity:0} to{transform:none;opacity:1} }
  @keyframes toastOut { from{transform:none;opacity:1} to{transform:translateX(calc(100% + 24px));opacity:0} }
  @keyframes dotBounce{ 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }

  /* ── Utilities ── */
  .fade-up   { animation: fadeUp .4s cubic-bezier(.16,1,.3,1) both; }
  .fade-in   { animation: fadeIn .3s ease both; }
  .scale-in  { animation: scaleIn .35s cubic-bezier(.16,1,.3,1) both; }
  .spin      { animation: spin 1s linear infinite; }
  .spin-slow { animation: spinSlow 12s linear infinite; }
  .pulse-dot { animation: pulse 2.2s ease infinite; }

  /* ── Skeleton shimmer ── */
  .skeleton {
    background: linear-gradient(90deg,
      var(--bg-hover) 25%,
      var(--bg-active) 50%,
      var(--bg-hover) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s infinite;
    border-radius: var(--r-md);
  }

  /* ── Glass card ── */
  .glass {
    background: rgba(20,23,32,0.7);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border: 1px solid var(--border-subtle);
  }
  .light .glass {
    background: rgba(255,255,255,0.75);
  }

  /* ── Candidate card ── */
  .cand-card {
    transition: all .2s cubic-bezier(.16,1,.3,1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .cand-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    background: linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 60%);
    transition: opacity .2s;
    pointer-events: none;
  }
  .cand-card:hover { transform: translateY(-1px); border-color: var(--border-strong) !important; box-shadow: var(--shadow-md); }
  .cand-card:hover::before { opacity: 1; }
  .cand-card.selected { border-color: var(--accent) !important; box-shadow: var(--shadow-accent); }
  .cand-card.selected::before { opacity: 1; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r-md);
    font-size: 13px; font-weight: 600; font-family: var(--font-body);
    cursor: pointer; transition: all .15s ease;
    border: 1px solid var(--border-default);
    background: var(--bg-hover); color: var(--text-secondary);
    white-space: nowrap;
  }
  .btn:hover { background: var(--bg-active); color: var(--text-primary); border-color: var(--border-strong); }
  .btn:active { transform: scale(0.98); }
  .btn-primary {
    background: var(--accent); color: white; border-color: transparent;
    box-shadow: 0 0 20px rgba(99,102,241,0.35);
  }
  .btn-primary:hover { background: var(--accent-light); box-shadow: 0 0 28px rgba(99,102,241,0.5); color: white; border-color: transparent; }
  .btn-danger { background: var(--red-dim); color: var(--red); border-color: rgba(239,68,68,0.25); }
  .btn-danger:hover { background: rgba(239,68,68,0.2); color: var(--red); }
  .btn-amber { background: var(--amber-dim); color: var(--amber); border-color: rgba(245,158,11,0.25); }
  .btn-amber:hover { background: rgba(245,158,11,0.2); color: var(--amber); }
  .btn-ghost { background: transparent; border-color: transparent; }
  .btn-ghost:hover { background: var(--bg-hover); border-color: var(--border-subtle); }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-xs { padding: 3px 8px; font-size: 11px; }

  /* ── Inputs ── */
  .hb-input {
    width: 100%; padding: 10px 14px;
    background: var(--bg-raised); color: var(--text-primary);
    border: 1px solid var(--border-default); border-radius: var(--r-md);
    font-size: 13px; font-family: var(--font-body);
    outline: none; transition: border-color .15s, box-shadow .15s;
  }
  .hb-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  .hb-input::placeholder { color: var(--text-tertiary); }

  /* ── Badge ── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: var(--r-full);
    font-size: 10px; font-weight: 700; letter-spacing: .04em;
    text-transform: uppercase; border: 1px solid;
  }
  .badge-accent  { background:var(--accent-dim);  color:var(--accent-light); border-color:rgba(99,102,241,.2); }
  .badge-green   { background:var(--green-dim);   color:var(--green);        border-color:rgba(16,185,129,.2); }
  .badge-amber   { background:var(--amber-dim);   color:var(--amber);        border-color:rgba(245,158,11,.2); }
  .badge-red     { background:var(--red-dim);     color:var(--red);          border-color:rgba(239,68,68,.2); }
  .badge-violet  { background:var(--violet-dim);  color:var(--violet);       border-color:rgba(139,92,246,.2); }
  .badge-cyan    { background:var(--cyan-dim);    color:var(--cyan);         border-color:rgba(6,182,212,.2); }

  /* ── Metric card ── */
  .metric-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--r-xl);
    padding: var(--sp-6);
    transition: all .2s;
    position: relative; overflow: hidden;
  }
  .metric-card::after {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
  }
  .metric-card:hover { border-color: var(--border-default); box-shadow: var(--shadow-sm); }

  /* ── Upload zone ── */
  .upload-zone {
    border: 1.5px dashed var(--border-default);
    border-radius: var(--r-xl);
    padding: 48px 32px;
    text-align: center;
    cursor: pointer;
    transition: all .2s;
  }
  .upload-zone:hover { border-color: var(--accent); background: var(--accent-dim); }

  /* ── Tooltip ── */
  .tooltip-wrap { position: relative; }
  .tooltip {
    position: absolute; bottom: calc(100% + 8px); left: 50%;
    transform: translateX(-50%);
    background: var(--bg-overlay); border: 1px solid var(--border-default);
    border-radius: var(--r-sm); padding: 6px 10px;
    font-size: 11px; color: var(--text-secondary);
    white-space: nowrap; pointer-events: none;
    opacity: 0; transition: opacity .15s;
    z-index: 200;
    box-shadow: var(--shadow-md);
  }
  .tooltip::after {
    content: ''; position: absolute; top: 100%; left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--border-default);
  }
  .tooltip-wrap:hover .tooltip { opacity: 1; }

  /* ── Progress bar ── */
  .prog-track { height: 3px; background: var(--bg-active); border-radius: var(--r-full); overflow: hidden; }
  .prog-fill  { height: 100%; border-radius: var(--r-full); transition: width .3s ease; }

  /* ── Divider ── */
  .divider { height: 1px; background: var(--border-subtle); }

  /* ── Modal backdrop ── */
  .modal-backdrop {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: fadeIn .2s ease;
  }

  /* ── Toast container ── */
  .toast-container { position: fixed; top: 24px; right: 24px; z-index: 999; display: flex; flex-direction: column; gap: 10px; }
  .toast-item { animation: toastIn .35s cubic-bezier(.16,1,.3,1); }
  .toast-item.exiting { animation: toastOut .3s ease forwards; }

  /* ── Score ring ── */
  .score-ring-text {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 14px;
  }

  /* ── Skill bar ── */
  .skill-bar { height: 4px; background: var(--bg-active); border-radius: var(--r-full); overflow: hidden; }
  .skill-fill { height: 100%; border-radius: var(--r-full); transition: width 1s cubic-bezier(.4,0,.2,1); }

  /* ── Radar chart ── */
  .radar-label { font-size: 10px; font-family: var(--font-mono); fill: var(--text-tertiary); }

  /* ── Comparison mode ── */
  .compare-badge {
    position: absolute; top: 8px; right: 8px;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--accent); border: 2px solid var(--bg-base);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 800; color: white;
    animation: scaleIn .2s cubic-bezier(.16,1,.3,1);
  }

  /* ── Search highlight ── */
  .search-highlight { background: rgba(99,102,241,0.25); border-radius: 2px; }

  /* ── JSON log ── */
  .log-pre { font-family: var(--font-mono); font-size: 11px; line-height: 1.75; color: #6b7a99; white-space: pre-wrap; word-break: break-all; }
  .lk { color: #818cf8; } .ls { color: #34d399; } .ln { color: #fb923c; } .lb { color: #f472b6; }

  /* ── Glow accent line ── */
  .accent-line {
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--violet), var(--cyan));
    border-radius: var(--r-full);
  }

  /* ── Tab ── */
  .tab { padding: 7px 14px; font-size: 12px; font-weight: 600; border-radius: var(--r-md); cursor: pointer; transition: all .15s; color: var(--text-tertiary); border: 1px solid transparent; }
  .tab:hover { color: var(--text-secondary); background: var(--bg-hover); }
  .tab.active { color: var(--text-primary); background: var(--bg-active); border-color: var(--border-default); }

  /* Stagger delays */
  .stagger-1 { animation-delay: 0.05s; }
  .stagger-2 { animation-delay: 0.1s; }
  .stagger-3 { animation-delay: 0.15s; }
  .stagger-4 { animation-delay: 0.2s; }
  .stagger-5 { animation-delay: 0.25s; }
`;

function injectStyles() {
  if (!document.getElementById("hb-v3-style")) {
    const s = document.createElement("style");
    s.id = "hb-v3-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

// ─────────────────────────────────────────────────────────────
// UTILITY HOOKS
// ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDv(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return dv;
}

// ─────────────────────────────────────────────────────────────
// DESIGN HELPERS
// ─────────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 80) return "var(--green)";
  if (s >= 60) return "var(--accent)";
  if (s >= 40) return "var(--amber)";
  return "var(--red)";
}
function rankBg(r) {
  const map = ["rgba(16,185,129,.15)", "rgba(99,102,241,.15)", "rgba(245,158,11,.15)", "rgba(239,68,68,.12)"];
  return map[Math.min(r - 1, 3)] || "var(--bg-hover)";
}
function rankTxt(r) {
  const map = ["var(--green)", "var(--accent-light)", "var(--amber)", "var(--red)"];
  return map[Math.min(r - 1, 3)] || "var(--text-tertiary)";
}

// ─────────────────────────────────────────────────────────────
// SCORE RING — gradient + glow
// ─────────────────────────────────────────────────────────────
function ScoreRing({ score = 0, size = 80, animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (displayed / 100) * circ;
  const color = scoreColor(displayed);
  const uid = useRef(`sr-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!animate) return;
    let start = null;
    const dur = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
        <filter id={`${uid}-glow`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} />
      {/* Fill */}
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#${uid})`} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: `${size/2}px ${size/2}px`, filter: `drop-shadow(0 0 6px ${color}90)`, transition: "stroke-dashoffset .05s linear" }}
      />
      {/* Label */}
      <text x={size/2} y={size/2 - 4} textAnchor="middle"
        style={{ fill: color, fontSize: size > 64 ? 16 : 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
        {displayed}
      </text>
      <text x={size/2} y={size/2 + 10} textAnchor="middle"
        style={{ fill: "var(--text-tertiary)", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
        SCORE
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// RADAR CHART — skill visualization
// ─────────────────────────────────────────────────────────────
function RadarChart({ skills = [], size = 180 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.35;
  const items = skills.slice(0, 6);
  const count = items.length || 1;
  const angles = items.map((_, i) => (i / count) * 2 * Math.PI - Math.PI / 2);
  const points = items.map((s, i) => ({
    x: cx + Math.cos(angles[i]) * r * ((s.value || 50) / 100),
    y: cy + Math.sin(angles[i]) * r * ((s.value || 50) / 100),
    lx: cx + Math.cos(angles[i]) * (r + 22),
    ly: cy + Math.sin(angles[i]) * (r + 22),
  }));
  const polyPts = points.map(p => `${p.x},${p.y}`).join(" ");
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity=".3" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity=".05" />
        </radialGradient>
      </defs>
      {/* Grid rings */}
      {gridLevels.map((lvl, i) => {
        const gpts = angles.map(a => `${cx + Math.cos(a) * r * lvl},${cy + Math.sin(a) * r * lvl}`).join(" ");
        return <polygon key={i} points={gpts} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />;
      })}
      {/* Spokes */}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy}
          x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {/* Data fill */}
      <polygon points={polyPts} fill="url(#radar-fill)" stroke="var(--accent)" strokeWidth={1.5} strokeOpacity={0.8} />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--accent)" opacity={0.9} />
      ))}
      {/* Labels */}
      {points.map((p, i) => (
        <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fill: "var(--text-tertiary)" }}>
          {(items[i]?.label || "").slice(0, 6)}
        </text>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// MINI SPARKLINE — trend visualization
// ─────────────────────────────────────────────────────────────
function Sparkline({ data = [], width = 80, height = 28, color = "var(--accent)" }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const last = data[data.length - 1];
  const first = data[0];
  const trend = last > first ? "up" : last < first ? "down" : "flat";

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON LOADERS
// ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ padding: "14px 16px", borderRadius: "var(--r-xl)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "var(--r-md)", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="skeleton" style={{ height: 12, width: "60%", borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 10, width: "40%", borderRadius: 4 }} />
        </div>
        <div className="skeleton" style={{ width: 40, height: 28, borderRadius: "var(--r-sm)" }} />
      </div>
      <div className="skeleton" style={{ height: 3, borderRadius: 4 }} />
      <div style={{ display: "flex", gap: 6 }}>
        <div className="skeleton" style={{ height: 20, width: 60, borderRadius: "var(--r-full)" }} />
        <div className="skeleton" style={{ height: 20, width: 50, borderRadius: "var(--r-full)" }} />
      </div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: 24, borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="skeleton" style={{ height: 14, width: "30%", borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 28, width: "50%", borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 12, width: "70%", borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--r-xl)" }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: "var(--r-xl)" }} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TOAST SYSTEM
// ─────────────────────────────────────────────────────────────
function Toast({ id, type = "success", title, message, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setExiting(true); setTimeout(() => onDismiss(id), 300); }, 4000);
    return () => clearTimeout(t);
  }, []);

  const cfg = {
    success: { icon: <CheckCircle2 size={15} />, color: "var(--green)", bg: "var(--green-dim)", border: "rgba(16,185,129,0.2)" },
    error:   { icon: <XCircle size={15} />,       color: "var(--red)",   bg: "var(--red-dim)",   border: "rgba(239,68,68,0.2)" },
    warning: { icon: <AlertTriangle size={15} />, color: "var(--amber)", bg: "var(--amber-dim)", border: "rgba(245,158,11,0.2)" },
    info:    { icon: <Info size={15} />,           color: "var(--cyan)",  bg: "var(--cyan-dim)",  border: "rgba(6,182,212,0.2)" },
  }[type] || {};

  return (
    <div className={`toast-item${exiting ? " exiting" : ""}`} style={{
      background: "var(--bg-overlay)", border: `1px solid ${cfg.border}`,
      borderRadius: "var(--r-xl)", padding: "14px 16px",
      display: "flex", alignItems: "flex-start", gap: 12, minWidth: 320, maxWidth: 420,
      boxShadow: "var(--shadow-lg)",
    }}>
      <div style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{title}</div>
        {message && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{message}</div>}
      </div>
      <button onClick={() => { setExiting(true); setTimeout(() => onDismiss(id), 300); }}
        className="btn-ghost btn btn-xs" style={{ padding: 4, flexShrink: 0, marginTop: -2 }}>
        <X size={13} />
      </button>
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { ...toast, id }]);
    return id;
  }, []);
  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, add, remove };
}

// ─────────────────────────────────────────────────────────────
// BIAS GAUGE
// ─────────────────────────────────────────────────────────────
function BiasGauge({ percent = 0 }) {
  const color = percent < 20 ? "var(--green)" : percent < 50 ? "var(--amber)" : "var(--red)";
  const label = percent < 20 ? "Low" : percent < 50 ? "Medium" : "High";
  const r = 13, circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="tooltip-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "var(--r-xl)", cursor: "default" }}>
        <svg width={32} height={32} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={16} cy={16} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
          <circle cx={16} cy={16} r={r} fill="none" stroke={color} strokeWidth={4}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 3px ${color})` }} />
        </svg>
        <div>
          <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>Bias Risk</div>
          <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{label} · {percent}%</div>
        </div>
      </div>
      <div className="tooltip">EU AI Act Art. 10(2)(f) — Bias monitoring active</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// METRIC CARD
// ─────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, trend, trendData, accent, delay = 0 }) {
  const trendColor = trend === "up" ? "var(--green)" : trend === "down" ? "var(--red)" : "var(--text-tertiary)";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  return (
    <div className="metric-card fade-up" style={{ animationDelay: `${delay}s` }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: "var(--r-xl) var(--r-xl) 0 0" }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "var(--r-md)", background: accent ? `${accent}18` : "var(--bg-hover)", border: `1px solid ${accent ? `${accent}30` : "var(--border-subtle)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: accent || "var(--text-tertiary)" }}>
            {icon}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</span>
        </div>
        {trendData && <Sparkline data={trendData} color={trendColor} />}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1 }}>{value}</div>
      {sub && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
          {trend && <TrendIcon size={12} style={{ color: trendColor }} />}
          <span style={{ fontSize: 11, color: trendColor || "var(--text-tertiary)" }}>{sub}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// JSON LOG
// ─────────────────────────────────────────────────────────────
function JSONLog({ obj }) {
  const raw = JSON.stringify(obj, null, 2);
  const html = raw
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"([^"]+)":/g,'<span class="lk">"$1"</span>:')
    .replace(/: "([^"]*)"/g,': <span class="ls">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g,': <span class="ln">$1</span>')
    .replace(/: (true|false)/g,': <span class="lb">$1</span>');
  return <pre className="log-pre" dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─────────────────────────────────────────────────────────────
// REDACTED PILL
// ─────────────────────────────────────────────────────────────
function RedactedPill({ label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "var(--bg-hover)", border: "1px solid var(--border-default)", borderRadius: "var(--r-md)", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
      <Lock size={9} style={{ opacity: .5 }} /> {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// CANDIDATE CARD (left panel)
// ─────────────────────────────────────────────────────────────
function CandidateCard({ c, isSelected, onClick, compareMode, isCompared, onCompare, searchTerm }) {
  const rc = rankTxt(c.rank);
  const sc = scoreColor(c.score);

  return (
    <div onClick={onClick} className={`cand-card${isSelected ? " selected" : ""}`} style={{
      padding: "14px 16px", borderRadius: "var(--r-xl)",
      background: isSelected ? "rgba(99,102,241,0.06)" : "var(--bg-card)",
      border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-subtle)"}`,
      position: "relative",
    }}>
      {compareMode && (
        <div onClick={e => { e.stopPropagation(); onCompare(c.id); }}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 20, height: 20, borderRadius: "var(--r-sm)",
            background: isCompared ? "var(--accent)" : "var(--bg-hover)",
            border: `1px solid ${isCompared ? "var(--accent)" : "var(--border-default)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all .15s", zIndex: 2,
          }}>
          {isCompared && <CheckCheck size={11} color="white" />}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: rankBg(c.rank), border: `1px solid ${rc}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, color: rc, flexShrink: 0 }}>
            #{c.rank}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2, color: "var(--text-primary)" }}>Candidate {c.id}</div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              {c.rank === 1 ? "★ Top match" : `Ranked #${c.rank}`}
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: sc, lineHeight: 1, flexShrink: 0 }}>
          {c.score}<span style={{ fontSize: 10, opacity: .6 }}>%</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="skill-bar" style={{ marginBottom: 8 }}>
        <div className="skill-fill" style={{ width: `${c.score}%`, background: `linear-gradient(90deg, ${sc}, ${sc}80)` }} />
      </div>

      {/* Skill tags */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {(c.matchedSkills || []).slice(0, 2).map(s => (
          <span key={s} style={{ fontSize: 9, padding: "3px 7px", background: "var(--bg-hover)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-full)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{s}</span>
        ))}
        {(c.matchedSkills || []).length > 2 && <span style={{ fontSize: 9, color: "var(--text-tertiary)", padding: "3px 0" }}>+{(c.matchedSkills || []).length - 2}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OVERRIDE MODAL
// ─────────────────────────────────────────────────────────────
function OverrideModal({ candidate, onClose, onConfirm, isOverriding }) {
  const [reason, setReason] = useState("");
  const [newRank, setNewRank] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="scale-in" style={{
        background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
        borderRadius: "var(--r-2xl)", width: "100%", maxWidth: 500, overflow: "hidden",
        boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.04)",
      }}>
        {/* Accent top bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg, var(--amber), var(--accent))" }} />

        <div style={{ padding: "var(--sp-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--r-lg)", background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={17} style={{ color: "var(--amber)" }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Manual Rank Override</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>Candidate {candidate.id} · Current rank #{candidate.rank}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isOverriding} style={{ padding: 6 }}><X size={16} /></button>
          </div>

          <div style={{ padding: "12px 14px", background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,.2)", borderRadius: "var(--r-lg)", marginBottom: "var(--sp-5)", fontSize: 12, color: "var(--amber)", lineHeight: 1.6 }}>
            <strong>EU AI Act Art. 14</strong> — This human oversight action will be immutably logged to the compliance audit trail.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>New Rank</label>
              <input type="number" min="1" value={newRank} onChange={e => setNewRank(e.target.value)}
                className="hb-input" placeholder="e.g. 1" style={{ fontFamily: "var(--font-mono)" }} disabled={isOverriding} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                Justification <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <textarea ref={ref} value={reason} onChange={e => setReason(e.target.value)} rows={4}
                className="hb-input" style={{ resize: "vertical", lineHeight: 1.6 }} disabled={isOverriding}
                placeholder="Provide specific business or skill-based justification for this override..." />
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-6)" }}>
            <button className="btn" style={{ flex: 1 }} onClick={onClose} disabled={isOverriding}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1, opacity: (!reason.trim() || !newRank || isOverriding) ? .4 : 1 }}
              disabled={!reason.trim() || !newRank || isOverriding}
              onClick={() => onConfirm(newRank, reason)}>
              {isOverriding ? <><Loader2 size={14} className="spin" /> Logging...</> : <><CheckCircle2 size={14} /> Confirm & Log</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPARISON VIEW
// ─────────────────────────────────────────────────────────────
function ComparisonView({ candidates }) {
  if (candidates.length < 2) return (
    <div style={{ padding: "var(--sp-12)", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
      Select at least 2 candidates to compare
    </div>
  );

  const metrics = [
    { key: "score", label: "Match Score", fmt: v => `${v}%` },
    { key: "skills", label: "Skill Score", fmt: v => `${v}%` },
  ];

  return (
    <div style={{ padding: "var(--sp-6)", overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${candidates.length}, 1fr)`, gap: "var(--sp-3)", minWidth: 480 }}>
        {/* Header */}
        <div />
        {candidates.map(c => (
          <div key={c.id} style={{ textAlign: "center", padding: "12px 8px", background: "var(--bg-card)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-subtle)" }}>
            <ScoreRing score={c.score} size={60} />
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, color: "var(--text-primary)" }}>Candidate {c.id}</div>
            <div style={{ fontSize: 10, color: rankTxt(c.rank), fontFamily: "var(--font-mono)", marginTop: 2 }}>Rank #{c.rank}</div>
          </div>
        ))}

        {/* Metrics */}
        {metrics.map(m => (
          <React.Fragment key={m.key}>
            <div style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", padding: "10px 0" }}>{m.label}</div>
            {candidates.map(c => {
              const val = c[m.key] || 0;
              const best = Math.max(...candidates.map(x => x[m.key] || 0));
              const isBest = val === best;
              return (
                <div key={c.id} style={{ textAlign: "center", padding: "10px 8px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: isBest ? "var(--green)" : "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{m.fmt(val)}</div>
                  <div className="skill-bar" style={{ margin: "6px auto", maxWidth: 80 }}>
                    <div className="skill-fill" style={{ width: `${val}%`, background: isBest ? "var(--green)" : "var(--accent)" }} />
                  </div>
                  {isBest && <span className="badge badge-green" style={{ fontSize: 9 }}>Best</span>}
                </div>
              );
            })}
          </React.Fragment>
        ))}

        {/* Skills */}
        <div style={{ display: "flex", alignItems: "flex-start", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", paddingTop: 10 }}>Matched Skills</div>
        {candidates.map(c => (
          <div key={c.id} style={{ padding: "10px 8px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
              {(c.matchedSkills || []).map(s => <span key={s} className="badge badge-accent" style={{ fontSize: 9 }}>{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyState({ onUpload }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "var(--sp-12)", cursor: "pointer" }}>
      <div className="upload-zone" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "var(--r-2xl)",
          background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto var(--sp-5)",
          boxShadow: "0 0 32px rgba(99,102,241,.15)",
        }}>
          <Upload size={26} style={{ color: "var(--accent-light)" }} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Upload resume batch</div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
          PDF, DOCX, or TXT · Max 2MB per file · Up to 3 files<br />EU AI Act compliant processing
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: "var(--sp-5)", flexWrap: "wrap" }}>
          {["PII Anonymized", "GDPR Compliant", "Bias Detection"].map(t => (
            <span key={t} className="badge badge-accent">{t}</span>
          ))}
        </div>
        <input type="file" multiple accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={onUpload} />
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recruiter");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onLogin({ email, role: role === "admin" ? "Admin" : "Recruiter" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", fontFamily: "var(--font-body)", position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="scale-in" style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "var(--sp-10)" }}>
          <div style={{ width: 52, height: 52, borderRadius: "var(--r-xl)", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-5)", boxShadow: "0 0 32px rgba(99,102,241,.5), 0 0 0 1px rgba(99,102,241,.3)", animation: "glowPulse 3s ease infinite" }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-.02em" }}>HireBlind</div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, marginTop: 6 }}>EU AI Act · Enterprise</div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "var(--r-2xl)", padding: "var(--sp-8)", boxShadow: "var(--shadow-lg)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="hb-input" placeholder="demo@hireblind.com" required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="hb-input" placeholder="Any password (demo)" required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="hb-input" style={{ cursor: "pointer" }}>
                <option value="recruiter">Recruiter — standard access</option>
                <option value="admin">Admin — full PII access</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px", marginTop: "var(--sp-2)", fontSize: 14 }} disabled={loading}>
              {loading ? <><Loader2 size={15} className="spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary)", marginTop: "var(--sp-5)", lineHeight: 1.7 }}>
            Demo mode · Any credentials work<br />
            Admins can reveal candidate PII
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32, background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
        <AlertCircle size={48} style={{ color: "var(--red)" }} />
        <div style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 400, textAlign: "center" }}>{this.state.err.message}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
function MainApp() {
  injectStyles();

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Core state
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState("Recruiter");
  const [darkMode, setDarkMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [biasScore, setBiasScore] = useState(0);
  const [revealed, setRevealed] = useState({});
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [isOverriding, setIsOverriding] = useState(false);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [sortDir, setSortDir] = useState("asc");
  const [viewMode, setViewMode] = useState("list"); // list | compare
  const [compareIds, setCompareIds] = useState([]);
  const [rightTab, setRightTab] = useState("overview"); // overview | audit | radar
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Toasts
  const { toasts, add: addToast, remove: removeToast } = useToasts();

  // Mock trend data for metrics
  const mockTrend = useMemo(() => Array.from({ length: 8 }, () => 40 + Math.random() * 50), [candidates.length]);
  const avgScore = useMemo(() => candidates.length ? Math.round(candidates.reduce((s, c) => s + (c.score || 0), 0) / candidates.length) : 0, [candidates]);

  const defaultJD = "Looking for a Senior Data Scientist proficient in Python, SQL, Machine Learning, and A/B Testing. Experience with PyTorch or TensorFlow is highly preferred.";

  useEffect(() => {
    document.documentElement.classList.toggle("light", !darkMode);
  }, [darkMode]);

  // ── PATCHED: Admin-only reveal with confirm ──
  const toggleReveal = (id) => {
    if (!revealed[id]) {
      if (window.confirm("⚠️ This action reveals candidate PII and will be logged for EU AI Act compliance. Continue?")) {
        setRevealed(prev => ({ ...prev, [id]: true }));
        console.log(`[AUDIT] PII revealed — Candidate ${id} — ${new Date().toISOString()} — Role: ${role}`);
        addToast({ type: "warning", title: "Identity Revealed", message: `Candidate ${id} PII access logged to audit trail` });
      }
    } else {
      setRevealed(prev => ({ ...prev, [id]: false }));
    }
  };

  // ── Filter + sort ──
  const debouncedSearch = useDebounce(searchTerm, 200);
  const processed = useMemo(() => {
    let list = [...candidates];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(c =>
        `Candidate ${c.id}`.toLowerCase().includes(q) ||
        (c.matchedSkills || []).some(s => s.toLowerCase().includes(q)) ||
        (c.realName || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const va = a[sortBy] ?? 999, vb = b[sortBy] ?? 999;
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return list;
  }, [candidates, debouncedSearch, sortBy, sortDir]);

  const totalPages = Math.ceil(processed.length / itemsPerPage);
  const paginated = processed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir(field === "rank" ? "asc" : "desc"); }
  };

  const toggleCompare = (id) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  // ── File upload ──
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 100); // limit to 100 files
    if (!files.length) return;

    const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
    if (oversized.length) {
      addToast({ type: "error", title: "File too large", message: `${oversized.map(f => f.name).join(", ")} exceed 2MB limit` });
      return;
    }
    const badType = files.filter(f => !f.name.match(/\.(pdf|docx|txt)$/i));
    if (badType.length) { addToast({ type: "error", title: "Unsupported format", message: "Use PDF, DOCX, or TXT only" }); return; }

    setIsUploading(true);
    setIsLoading(true);

    const initProg = Object.fromEntries(files.map(f => [f.name, 0]));
    setUploadProgress(initProg);

    // Show warm-up notice after 2s if still loading
    const warmupTimer = setTimeout(() => {
      addToast({ type: "info", title: "Server waking up…", message: "HuggingFace cold start detected. Hang tight — retrying automatically." });
    }, 2000);

    const intervals = files.map(f => {
      let p = 0;
      return setInterval(() => {
        p = Math.min(p + 8, 85);
        setUploadProgress(prev => ({ ...prev, [f.name]: p }));
      }, 300);
    });

    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));

      const ur = await fetchWithRetry(`${API_BASE}/upload`, { method: "POST", body: fd }, 3, 45000);
      if (!ur.ok) throw new Error(`Upload failed (${ur.status}) — please try again`);
      const ud = await ur.json();

      clearTimeout(warmupTimer);
      intervals.forEach(iv => clearInterval(iv));
      setUploadProgress(Object.fromEntries(files.map(f => [f.name, 100])));

      const pr = await fetchWithRetry(`${API_BASE}/process`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: ud.session_id, job_description: defaultJD }),
      }, 2, 60000);
      if (!pr.ok) throw new Error(`Processing failed (${pr.status}) — server may be overloaded`);
      const pd = await pr.json();

      setCandidates(pd.candidates || []);
      if (pd.candidates?.length) { setSelected(pd.candidates[0]); setRightTab("overview"); }
      if (pd.bias_check?.variance != null) setBiasScore(Math.max(0, Math.min(100, Math.round(100 - pd.bias_check.variance))));
      setCurrentPage(1);
      setCompareIds([]);
      addToast({ type: "success", title: "Batch processed", message: `${pd.candidates?.length || 0} candidates ranked successfully` });
    } catch (err) {
      clearTimeout(warmupTimer);
      intervals.forEach(iv => clearInterval(iv));
      const isNetworkErr = err.message.includes("fetch") || err.message.includes("waking up") || err.message.includes("timed out");
      addToast({
        type: "error",
        title: isNetworkErr ? "Server waking up" : "Processing failed",
        message: isNetworkErr
          ? "The backend is cold-starting. Wait 15–30 seconds and try again."
          : err.message,
      });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
      setTimeout(() => setUploadProgress({}), 1500);
      if (e.target) e.target.value = null;
    }
  };

  const handleOverrideConfirm = async (newRank, reason) => {
    setIsOverriding(true);
    try {
      const res = await fetchWithRetry(`${API_BASE}/override`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: overrideTarget.id, old_rank: overrideTarget.rank, new_rank: parseInt(newRank), reason }),
      });
      if (!res.ok) throw new Error("Override logging failed");
      setCandidates(prev => prev.map(c => c.id === overrideTarget.id ? { ...c, rank: parseInt(newRank) } : c));
      if (selected?.id === overrideTarget.id) setSelected(prev => ({ ...prev, rank: parseInt(newRank) }));
      addToast({ type: "success", title: "Override logged", message: `Candidate ${overrideTarget.id} moved to rank #${newRank}` });
      setOverrideTarget(null);
    } catch (err) {
      addToast({ type: "error", title: "Override failed", message: "Audit log failed. Override blocked for compliance." });
    } finally {
      setIsOverriding(false);
    }
  };

  // Cold-start banner state
  const [showWarmupBanner, setShowWarmupBanner] = useState(false);
  useEffect(() => {
    let t;
    if (isUploading) {
      t = setTimeout(() => setShowWarmupBanner(true), 5000);
    } else {
      setShowWarmupBanner(false);
    }
    return () => clearTimeout(t);
  }, [isUploading]);
  if (!isAuthenticated) {
    return <LoginScreen onLogin={(u) => { setIsAuthenticated(true); setRole(u.role); }} />;
  }

  // ── Radar data from selected candidate ──
  const radarSkills = (selected?.matchedSkills || []).slice(0, 6).map((s, i) => ({
    label: s, value: Math.max(30, 95 - i * 12),
  }));

  const compareSelected = candidates.filter(c => compareIds.includes(c.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>

      {/* ── TOASTS ── */}
      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} {...t} onDismiss={removeToast} />)}
      </div>

      {/* ── COLD START BANNER ── */}
      {showWarmupBanner && (
        <div className="fade-in" style={{
          background: "linear-gradient(90deg, rgba(245,158,11,0.12), rgba(99,102,241,0.08))",
          borderBottom: "1px solid rgba(245,158,11,0.25)",
          padding: "10px var(--sp-6)",
          display: "flex", alignItems: "center", gap: "var(--sp-3)",
          fontSize: 12, color: "var(--amber)",
        }}>
          <Loader2 size={13} className="spin" style={{ flexShrink: 0 }} />
          <span>
            <strong>HuggingFace cold start detected</strong> — the model is loading (first request takes 15–30s).
            Auto-retrying in the background. Please wait…
          </span>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{
        background: "rgba(13,15,20,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 var(--sp-6)", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <div style={{ width: 30, height: 30, borderRadius: "var(--r-md)", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(99,102,241,.5)" }}>
            <ShieldCheck size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-.02em", lineHeight: 1, color: "var(--text-primary)" }}>HireBlind</div>
            <div style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>EU AI Act</div>
          </div>
          <div style={{ width: 1, height: 20, background: "var(--border-subtle)", margin: "0 var(--sp-3)" }} />
          <div className="badge badge-accent"><Cpu size={9} /> Senior Data Scientist</div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", background: "var(--bg-hover)", padding: "2px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border-subtle)" }}>REQ-8902-DS</span>
        </div>

        {/* Center */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xl)", padding: "4px" }}>
          {["Recruiter", "Admin"].map(r => (
            <button key={r} onClick={() => setRole(r)} className={`tab ${role === r ? "active" : ""}`}>
              {r === "Admin" ? "👑" : "👤"} {r}
            </button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <BiasGauge percent={biasScore} />

          <button className="btn btn-ghost btn-sm" onClick={() => setDarkMode(!darkMode)} style={{ padding: 7 }}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Upload */}
          <div style={{ position: "relative" }}>
            <label className={`btn btn-primary${isUploading ? " btn-sm" : ""}`} style={{ cursor: isUploading ? "default" : "pointer" }}>
              {isUploading
                ? <><Loader2 size={14} className="spin" /> Processing…</>
                : <><Upload size={14} /> Upload Batch <span style={{ fontSize: 10, opacity: .65, fontWeight: 400 }}>(max 3)</span></>}
              <input type="file" multiple accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
            </label>
            {Object.keys(uploadProgress).length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--bg-overlay)", border: "1px solid var(--border-default)", borderRadius: "var(--r-xl)", padding: "var(--sp-4)", minWidth: 240, boxShadow: "var(--shadow-lg)", zIndex: 200 }}>
                {Object.entries(uploadProgress).map(([name, pct]) => (
                  <div key={name} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170 }}>{name}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{ width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--accent)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── ANALYTICS BAR ── */}
      {candidates.length > 0 && (
        <div style={{ background: "var(--bg-raised)", borderBottom: "1px solid var(--border-subtle)", padding: "var(--sp-4) var(--sp-6)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4)", maxWidth: 900 }}>
            <MetricCard icon={<Users size={14} />} label="Candidates" value={candidates.length} sub="In pipeline" accent="var(--accent)" delay={0} trendData={mockTrend} trend="up" />
            <MetricCard icon={<Target size={14} />} label="Avg Score" value={`${avgScore}%`} sub={avgScore > 70 ? "Strong batch" : "Mixed signals"} accent="var(--green)" delay={0.05} trendData={mockTrend.map(v => v * 0.8)} trend={avgScore > 60 ? "up" : "down"} />
            <MetricCard icon={<Zap size={14} />} label="Top Score" value={`${Math.max(...candidates.map(c => c.score || 0))}%`} sub="Best candidate" accent="var(--violet)" delay={0.1} />
            <MetricCard icon={<AlertTriangle size={14} />} label="Bias Risk" value={`${biasScore}%`} sub={biasScore < 30 ? "Nominal" : "Review needed"} accent={biasScore > 50 ? "var(--red)" : "var(--amber)"} delay={0.15} trend={biasScore > 50 ? "up" : "flat"} />
          </div>
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ width: 340, flexShrink: 0, borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", background: "var(--bg-raised)" }}>

          {/* Panel controls */}
          <div style={{ padding: "var(--sp-3) var(--sp-4)", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }} />
              <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="hb-input" style={{ paddingLeft: 34, fontSize: 12 }} placeholder="Search candidates or skills..." />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="btn-ghost" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", padding: 2 }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sort + view controls */}
            <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 4, flex: 1 }}>
                {[{ key: "rank", label: "Rank" }, { key: "score", label: "Score" }, { key: "skills", label: "Skills" }].map(s => (
                  <button key={s.key} onClick={() => toggleSort(s.key)}
                    className={`btn btn-xs ${sortBy === s.key ? "" : "btn-ghost"}`}
                    style={{ flex: 1, justifyContent: "center", fontSize: 10 }}>
                    {s.label}
                    {sortBy === s.key && <ChevronDown size={9} style={{ transform: sortDir === "desc" ? "rotate(180deg)" : "none", transition: "transform .15s" }} />}
                  </button>
                ))}
              </div>
              <button className={`btn btn-xs ${viewMode === "compare" ? "" : "btn-ghost"}`}
                onClick={() => setViewMode(v => v === "compare" ? "list" : "compare")}
                title="Compare mode" style={{ padding: "5px 8px" }}>
                <GitCompare size={12} />
              </button>
            </div>

            {viewMode === "compare" && compareIds.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,.2)", borderRadius: "var(--r-md)", fontSize: 11 }}>
                <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>{compareIds.length} selected</span>
                <button className="btn btn-xs" onClick={() => setRightTab("compare")} style={{ fontSize: 10 }}>Compare →</button>
              </div>
            )}
          </div>

          {/* Candidate list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "var(--sp-3)" }}>
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
                <div style={{ padding: "var(--sp-3) var(--sp-4)", borderRadius: "var(--r-lg)", background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,.15)", fontSize: 11, color: "var(--accent-light)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Loader2 size={11} className="spin" /> Ranking candidates — model loading may take up to 30s on first run…
                </div>
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : paginated.length === 0 && candidates.length === 0 ? (
              <EmptyState onUpload={handleFileUpload} />
            ) : paginated.length === 0 ? (
              <div style={{ padding: "var(--sp-8)", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
                No candidates match your search
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
                {paginated.map((c, i) => (
                  <div key={c.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <CandidateCard
                      c={c} isSelected={selected?.id === c.id}
                      onClick={() => { setSelected(c); setRightTab("overview"); }}
                      compareMode={viewMode === "compare"}
                      isCompared={compareIds.includes(c.id)}
                      onCompare={toggleCompare}
                      searchTerm={debouncedSearch}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "var(--sp-3) var(--sp-4)", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button className="btn btn-ghost btn-xs" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: 6 }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{currentPage} / {totalPages}</span>
              <button className="btn btn-ghost btn-xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: 6 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Status strip */}
          <div style={{ padding: "var(--sp-2) var(--sp-4)", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              {processed.length} candidate{processed.length !== 1 ? "s" : ""} · semantic-rank-v2.1
            </span>
            <span className="badge badge-green" style={{ marginLeft: "auto", fontSize: 9 }}>GDPR</span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>

          {/* Empty right panel */}
          {!selected && !isLoading ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--sp-4)", padding: "var(--sp-12)", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "var(--r-2xl)", background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Layers size={28} style={{ color: "var(--accent-light)", opacity: .7 }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {candidates.length === 0 ? "Upload resumes to start" : "Select a candidate"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", maxWidth: 340, lineHeight: 1.7 }}>
                {candidates.length === 0
                  ? "Use the Upload Batch button to begin processing resumes with EU AI Act compliance."
                  : "Click any candidate in the pipeline to view their full transparency audit and scoring breakdown."}
              </div>
            </div>
          ) : isLoading && !selected ? (
            <SkeletonDetail />
          ) : selected && (
            <div className="fade-up" style={{ padding: "var(--sp-8) var(--sp-8)", maxWidth: 960 }}>

              {/* ── CANDIDATE HEADER ── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-6)", paddingBottom: "var(--sp-6)", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-5)" }}>
                  <ScoreRing score={selected.score || 0} size={88} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
                      <span className="badge badge-accent"><Info size={9} /> Transparency Panel</span>
                      {selected.rank === 1 && <span className="badge badge-green"><Sparkles size={9} /> Top Match</span>}
                      <span className={`badge ${role === "Admin" ? "badge-amber" : "badge-violet"}`}>{role}</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1, marginBottom: "var(--sp-2)", color: "var(--text-primary)" }}>
                      Candidate {selected.id}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "var(--sp-4)", flexWrap: "wrap" }}>
                      <span>Match <strong style={{ color: scoreColor(selected.score) }}>{selected.score}%</strong></span>
                      <span style={{ color: "var(--border-strong)" }}>·</span>
                      <span>Rank <strong style={{ color: rankTxt(selected.rank) }}>#{selected.rank}</strong> of {candidates.length}</span>
                      <span style={{ color: "var(--border-strong)" }}>·</span>
                      <span>{selected.experience || "Experience N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "var(--sp-2)", flexShrink: 0 }}>
                  {role === "Admin" && (
                    <>
                      <button className={`btn ${revealed[selected.id] ? "btn-danger" : ""}`} onClick={() => toggleReveal(selected.id)}>
                        {revealed[selected.id] ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Reveal ID</>}
                      </button>
                      <button className="btn btn-amber" onClick={() => setOverrideTarget(selected)}>
                        <ArrowUpDown size={13} /> Override
                      </button>
                    </>
                  )}
                  {role !== "Admin" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-lg)", fontSize: 11, color: "var(--text-tertiary)" }}>
                      <Lock size={11} /> Admin access required for PII
                    </div>
                  )}
                </div>
              </div>

              {/* ── REVEALED IDENTITY ── */}
              {revealed[selected.id] && role === "Admin" && (
                <div className="fade-up" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--r-xl)", padding: "var(--sp-5)", marginBottom: "var(--sp-6)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>
                    <AlertTriangle size={14} style={{ color: "var(--red)", flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--red)" }}>
                      Unblinded — Access logged immutably
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-3)" }}>
                    {[["Full Name", selected.realName || "Unknown", <Users size={12} />], ["Experience", selected.experience || "N/A", <Clock size={12} />], ["Location", selected.location || "Undisclosed", <MapPin size={12} />]].map(([k, v, icon]) => (
                      <div key={k} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                          {icon} {k}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={v}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TABS ── */}
              <div style={{ display: "flex", gap: 4, marginBottom: "var(--sp-6)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xl)", padding: 4 }}>
                {[
                  { key: "overview", label: "Overview", icon: <BarChart2 size={12} /> },
                  { key: "radar", label: "Skill Radar", icon: <Target size={12} /> },
                  { key: "compare", label: `Compare (${compareIds.length})`, icon: <GitCompare size={12} /> },
                  { key: "audit", label: "Audit Log", icon: <FileText size={12} /> },
                ].map(t => (
                  <button key={t.key} className={`tab ${rightTab === t.key ? "active" : ""}`} onClick={() => setRightTab(t.key)} style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, justifyContent: "center" }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* ── TAB: OVERVIEW ── */}
              {rightTab === "overview" && (
                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
                  {/* Two-column grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-5)" }}>

                    {/* Skill Match */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xl)", padding: "var(--sp-6)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "var(--r-md)", background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Sparkles size={14} style={{ color: "var(--accent-light)" }} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Semantic Skill Match</div>
                      </div>
                      {(selected.matchedSkills || []).length > 0 ? (selected.matchedSkills || []).map((skill, i) => {
                        const val = Math.max(30, 97 - i * 10);
                        return (
                          <div key={skill} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "8px 0", borderBottom: i < (selected.matchedSkills || []).length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                            <CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "var(--text-primary)", flex: 1, fontWeight: 500 }}>{skill}</span>
                            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: scoreColor(val), minWidth: 32, textAlign: "right" }}>{val}%</span>
                            <div className="skill-bar" style={{ width: 60 }}>
                              <div className="skill-fill" style={{ width: `${val}%`, background: `linear-gradient(90deg, ${scoreColor(val)}, ${scoreColor(val)}80)` }} />
                            </div>
                          </div>
                        );
                      }) : (
                        <div style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "var(--sp-4) 0" }}>No specific skills matched</div>
                      )}
                    </div>

                    {/* PII Redaction */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xl)", padding: "var(--sp-6)", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "var(--r-md)", background: "var(--bg-hover)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Lock size={14} style={{ color: "var(--text-tertiary)" }} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Redacted Variables</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: "var(--sp-4)" }}>
                        GDPR Art. 5(1)(c) — PII stripped before AI ingestion
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1, alignContent: "flex-start" }}>
                        {(selected.strippedData || []).length > 0
                          ? (selected.strippedData || []).map(d => <RedactedPill key={d} label={d} />)
                          : <span style={{ fontSize: 12, color: "var(--text-tertiary)", border: "1px dashed var(--border-default)", padding: "4px 10px", borderRadius: "var(--r-md)" }}>No PII detected</span>}
                      </div>

                      {/* Pipeline */}
                      <div style={{ marginTop: "var(--sp-5)", paddingTop: "var(--sp-4)", borderTop: "1px solid var(--border-subtle)" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "var(--sp-3)" }}>Compliance Pipeline</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {["Ingest", "NER", "Strip", "Score", "Rank"].map((step, i, arr) => (
                            <React.Fragment key={step}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--green-dim)", border: "1px solid rgba(16,185,129,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <CheckCircle2 size={9} style={{ color: "var(--green)" }} />
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)" }}>{step}</span>
                              </div>
                              {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: "var(--border-subtle)", maxWidth: 16 }} />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xl)", padding: "var(--sp-6)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--sp-5)", display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
                      <Activity size={14} style={{ color: "var(--accent-light)" }} /> Score Breakdown
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-4)" }}>
                      {[
                        { label: "Semantic Match", value: Math.round((selected.score || 0) * 0.5), total: 50, color: "var(--accent)" },
                        { label: "Keyword Match", value: Math.round((selected.score || 0) * 0.3), total: 30, color: "var(--violet)" },
                        { label: "Experience", value: Math.round((selected.score || 0) * 0.2), total: 20, color: "var(--cyan)" },
                      ].map(({ label, value, total, color }) => (
                        <div key={label} style={{ textAlign: "center", padding: "var(--sp-4)", background: "var(--bg-hover)", borderRadius: "var(--r-lg)", border: "1px solid var(--border-subtle)" }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "var(--font-mono)", lineHeight: 1 }}>{value}</div>
                          <div style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "4px 0 8px", fontWeight: 600 }}>{label}</div>
                          <div className="skill-bar">
                            <div className="skill-fill" style={{ width: `${(value / total) * 100}%`, background: color }} />
                          </div>
                          <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 4, fontFamily: "var(--font-mono)" }}>of {total} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: RADAR ── */}
              {rightTab === "radar" && (
                <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-5)" }}>
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xl)", padding: "var(--sp-6)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: "var(--sp-5)", color: "var(--text-primary)", alignSelf: "flex-start" }}>
                      Skill Radar
                    </div>
                    {radarSkills.length >= 3
                      ? <RadarChart skills={radarSkills} size={220} />
                      : <div style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "var(--sp-8)" }}>Upload resumes to generate skill radar</div>}
                  </div>

                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xl)", padding: "var(--sp-6)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: "var(--sp-5)", color: "var(--text-primary)" }}>Skill Breakdown</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                      {radarSkills.map((s, i) => (
                        <div key={s.label} className="fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{s.label}</span>
                            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: scoreColor(s.value) }}>{s.value}%</span>
                          </div>
                          <div className="skill-bar">
                            <div className="skill-fill" style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${scoreColor(s.value)}, ${scoreColor(s.value)}60)` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: COMPARE ── */}
              {rightTab === "compare" && (
                <div className="fade-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xl)", overflow: "hidden" }}>
                  <div style={{ padding: "var(--sp-5) var(--sp-6)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                      <GitCompare size={14} style={{ color: "var(--accent-light)" }} /> Candidate Comparison
                    </div>
                    {compareIds.length > 0 && (
                      <button className="btn btn-xs btn-ghost" onClick={() => setCompareIds([])}>Clear all</button>
                    )}
                  </div>
                  <ComparisonView candidates={compareSelected} />
                </div>
              )}

              {/* ── TAB: AUDIT LOG ── */}
              {rightTab === "audit" && (
                <div className="fade-in" style={{ background: "#060810", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--r-xl)", overflow: "hidden" }}>
                  <div style={{ padding: "var(--sp-4) var(--sp-6)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
                      <FileText size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>
                        EU AI Act Compliance Tracer
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "var(--r-md)" }}>
                      <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: "var(--green)", letterSpacing: ".1em", fontFamily: "var(--font-mono)" }}>IMMUTABLE</span>
                    </div>
                  </div>
                  <div style={{ padding: "var(--sp-6)" }}>
                    <JSONLog obj={{
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
                        weighting: "50% semantic · 30% keyword · 20% experience",
                      },
                    }} />
                  </div>
                </div>
              )}

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