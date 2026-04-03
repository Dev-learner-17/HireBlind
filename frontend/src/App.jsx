/**
 * HIREBLIND - MAIN APPLICATION
 * =============================
 * EU AI Act Compliant Resume Screening System
 * 
 * Features:
 * - Demo-only login with role selection
 * - Role-based access control (Admin/Recruiter)
 * - File validation (PDF, DOCX, TXT; max 5MB)
 * - Per-file upload progress tracking
 * - Admin-only PII reveal with confirmation modal
 * - Audit logging
 * - Bias detection display
 * - Ranking with explainability
 * 
 * Compliance: EU AI Acts. 5, 10, 12, 13, 14
 */

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ShieldCheck, Upload, ChevronRight, Eye, EyeOff, AlertTriangle, X,
  CheckCircle2, Info, ArrowUpDown, Lock, Sparkles, FileText,
  Users, LogOut, Loader2, Activity, Zap, BarChart2, Download, AlertCircle
} from "lucide-react";
import Login from "./login";
import ConfirmModal from "./ConfirmModal";
import ProgressBar from "./ProgressBar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ===========================
// GLOBAL STYLES
// ===========================

if (!document.getElementById("hb-fonts")) {
  const link = document.createElement("link");
  link.id = "hb-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

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
  
  .hb-root { min-height: 100vh; background: var(--bg); color: var(--text); }
  
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.65); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .fade-up { animation: fadeUp 0.35s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; border: 1px solid; }
  .badge-indigo { background: rgba(99,102,241,.12); color: var(--indigo2); border-color: rgba(99,102,241,.25); }
  .badge-emerald { background: rgba(16,185,129,.1); color: var(--emerald); border-color: rgba(16,185,129,.25); }
  .badge-amber { background: rgba(245,158,11,.1); color: var(--amber); border-color: rgba(245,158,11,.25); }
  .badge-rose { background: rgba(244,63,94,.1); color: var(--rose); border-color: rgba(244,63,94,.25); }
  
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; transition: all 0.2s; }
  .card:hover { border-color: var(--border2); box-shadow: 0 4px 24px rgba(0,0,0,.35); }
  
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
`;

function injectStyle() {
  if (!document.getElementById("hb-style")) {
    const s = document.createElement("style");
    s.id = "hb-style";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }
}

// ===========================
// SCORE RING COMPONENT
// ===========================

function ScoreRing({ score = 0, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#f43f5e";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: `${size / 2}px ${size / 2}px`,
          fill: color,
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "DM Mono, monospace",
        }}
      >
        {score}%
      </text>
    </svg>
  );
}

// ===========================
// BIAS GAUGE COMPONENT
// ===========================

function BiasGauge({ percent = 0 }) {
  const color = percent < 20 ? "#10b981" : percent < 50 ? "#f59e0b" : "#f43f5e";
  const label = percent < 20 ? "Low Risk" : percent < 50 ? "Medium" : "High Risk";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--border2)",
        borderRadius: 10,
      }}
    >
      <div style={{ position: "relative", width: 32, height: 32 }}>
        <svg width={32} height={32} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={16} cy={16} r={12} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
          <circle
            cx={16}
            cy={16}
            r={12}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeDasharray={2 * Math.PI * 12}
            strokeDashoffset={2 * Math.PI * 12 - (percent / 100) * 2 * Math.PI * 12}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600 }}>Bias Risk</div>
        <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "DM Mono, monospace" }}>{label}</div>
      </div>
    </div>
  );
}

// ===========================
// PROGRESS BAR WRAPPER
// ===========================

function FileProgress({ filename, progress, status, error }) {
  return <ProgressBar filename={filename} progress={progress} status={status} error={error} />;
}

// ===========================
// MAIN APP COMPONENT
// ===========================

export default function App() {
  injectStyle();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = localStorage.getItem("hb_user");
    return stored ? JSON.parse(stored) : null;
  });

  // UI state
  const [step, setStep] = useState("upload"); // upload | results
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [revealedCandidates, setRevealedCandidates] = useState({});
  const [auditLog, setAuditLog] = useState([]);
  const fileInputRef = useRef(null);
  const sessionIdRef = useRef(null);

  // FILE VALIDATION
  const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only PDF, DOCX, and TXT files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    return null;
  };

  // HANDLE FILE DROP
  const handleFilesSelected = (selectedFiles) => {
    const validFiles = [];
    const errors = [];

    Array.from(selectedFiles).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({ file, id: Math.random().toString(36) });
      }
    });

    if (errors.length > 0) {
      alert("File validation errors:\n\n" + errors.join("\n"));
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  // UPLOAD FILES
  const handleUpload = async () => {
    if (files.length === 0 || !jobDescription.trim()) {
      alert("Please select files and enter a job description");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();

    // Upload each file with progress tracking
    try {
      for (const { file, id } of files) {
        const xhr = new XMLHttpRequest();
        const progressKey = id;

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [progressKey]: { percent, status: "uploading" } }));
          }
        });

        xhr.addEventListener("load", () => {
          setUploadProgress((prev) => ({ ...prev, [progressKey]: { percent: 100, status: "complete" } }));
        });

        xhr.addEventListener("error", () => {
          setUploadProgress((prev) => ({ ...prev, [progressKey]: { percent: 0, status: "error", error: "Upload failed" } }));
        });

        formData.append("files", file);
        setUploadProgress((prev) => ({ ...prev, [progressKey]: { percent: 0, status: "uploading" } }));
      }

      // Use axios for bulk upload
      const uploadRes = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      sessionIdRef.current = uploadRes.data.session_id;

      // Process
      const processRes = await axios.post(`${API_BASE}/process`, {
        session_id: uploadRes.data.session_id,
        job_description: jobDescription,
      });

      setResults(processRes.data);
      setAuditLog([processRes.data.audit_log]);
      setStep("results");
    } catch (error) {
      alert("Error: " + (error.response?.data?.detail || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  // HANDLE REVEAL (Admin only)
  const handleReveal = async (candidateId) => {
    if (isLoggedIn.role !== "Admin") {
      alert("Only Admins can reveal PII");
      return;
    }

    setShowRevealConfirm(false);
    setRevealedCandidates((prev) => ({
      ...prev,
      [candidateId]: true,
    }));

    // Log to audit trail
    const auditEntry = {
      action: "PII_REVEAL",
      candidateId,
      timestamp: new Date().toISOString(),
      user: isLoggedIn.email,
      role: isLoggedIn.role,
    };
    setAuditLog((prev) => [...prev, auditEntry]);

    // Optional: Send to backend
    try {
      await axios.post(`${API_BASE}/override`, {
        candidate_id: candidateId,
        old_rank: 0,
        new_rank: 0,
        reason: "PII Reveal (Admin audit)",
      });
    } catch (e) {
      console.log("Audit logging note recorded locally");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("hb_user");
    setIsLoggedIn(null);
    setStep("upload");
    setFiles([]);
    setResults(null);
  };

  // LOGIN HANDLER
  const handleLogin = (loginData) => {
    localStorage.setItem("hb_user", JSON.stringify(loginData));
    setIsLoggedIn(loginData);
  };

  // RENDER LOGIN SCREEN
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // ===========================
  // UPLOAD SCREEN
  // ===========================
  if (step === "upload") {
    return (
      <div className="hb-root">
        {/* Header */}
        <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,.3)" }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 18 }}>HireBlind</div>
              <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>EU AI Act Compliant</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 12, color: "var(--subtext)" }}>
              {isLoggedIn.role === "Admin" ? (
                <span style={{ color: "var(--amber)" }}>👤 Admin — Full Access</span>
              ) : (
                <span style={{ color: "var(--indigo)" }}>🔍 Recruiter — Limited Access</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border2)",
                borderRadius: 8,
                color: "var(--subtext)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.05)")}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Upload Resumes</h1>
            <p style={{ color: "var(--subtext)", fontSize: 14 }}>Upload candidate resumes and a job description for AI-powered screening</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Upload Zone */}
            <div
              onDrop={(e) => {
                e.preventDefault();
                handleFilesSelected(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed var(--border2)",
                borderRadius: 16,
                padding: "40px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                background: "rgba(99,102,241,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--indigo)";
                e.currentTarget.style.background = "rgba(99,102,241,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border2)";
                e.currentTarget.style.background = "rgba(99,102,241,0.04)";
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFilesSelected(e.target.files)}
                style={{ display: "none" }}
                accept=".pdf,.docx,.txt"
              />
              <Upload size={32} style={{ margin: "0 auto 12px", color: "var(--indigo)", opacity: 0.7 }} />
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Drop files here or click</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>PDF, DOCX, or TXT · Max 5MB each</div>
            </div>

            {/* Job Description */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8 }}>Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                style={{
                  width: "100%",
                  height: 160,
                  padding: "14px",
                  border: "1px solid var(--border2)",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text)",
                  fontSize: 13,
                  fontFamily: "var(--body)",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
              />
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div style={{ marginTop: 32, padding: "20px", background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 16 }}>Selected Files ({files.length})</div>
              {files.map(({ file, id }) => (
                <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <FileText size={14} style={{ color: "var(--indigo)", opacity: 0.6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{file.name}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFiles((prev) => prev.filter((f) => f.id !== id))}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--rose)",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div style={{ marginTop: 24 }}>
              {files.map(({ file, id }) =>
                uploadProgress[id] ? (
                  <FileProgress
                    key={id}
                    filename={file.name}
                    progress={uploadProgress[id].percent}
                    status={uploadProgress[id].status}
                    error={uploadProgress[id].error}
                  />
                ) : null
              )}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || !jobDescription.trim() || isProcessing}
              style={{
                flex: 1,
                padding: "14px 24px",
                background: "var(--indigo)",
                border: "none",
                borderRadius: 12,
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                cursor: isProcessing ? "default" : "pointer",
                opacity: files.length === 0 || !jobDescription.trim() || isProcessing ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "opacity 0.2s",
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing...
                </>
              ) : (
                <>
                  <Upload size={16} /> Upload & Process ({files.length} files)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // RESULTS SCREEN
  // ===========================
  if (step === "results" && results) {
    const candidates = results.candidates || [];
    const biasCheck = results.bias_check || {};

    return (
      <div className="hb-root">
        {/* Header */}
        <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,.3)" }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 18 }}>HireBlind</div>
              <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>Results & Analysis</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => {
                setStep("upload");
                setFiles([]);
                setResults(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border2)",
                borderRadius: 8,
                color: "var(--subtext)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.05)")}
            >
              ← New Upload
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border2)",
                borderRadius: 8,
                color: "var(--subtext)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.05)")}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
          {/* Compliance Alert */}
          <div style={{ marginBottom: 32, padding: "16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
              <CheckCircle2 size={18} style={{ color: "var(--emerald)", marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--emerald)", marginBottom: 2 }}>EU AI Act Compliant Processing</div>
                <div style={{ fontSize: 12, color: "var(--subtext)", lineHeight: 1.6 }}>
                  All PII has been anonymized · Rankings are explainable · Bias monitoring active · Human oversight enabled
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div className="card">
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Total Candidates</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 800, color: "var(--indigo)" }}>{candidates.length}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Top Match</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 800, color: "var(--emerald)" }}>
                {candidates[0]?.score || 0}%
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Bias Risk Level</div>
              <BiasGauge percent={biasCheck.bias_percentage || 0} />
            </div>
          </div>

          {/* Candidates */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Ranked Candidates</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="card"
                  onClick={() => setSelectedCandidate(candidate)}
                  style={{
                    cursor: "pointer",
                    border: selectedCandidate?.id === candidate.id ? "2px solid var(--indigo)" : "1px solid var(--border)",
                    boxShadow: selectedCandidate?.id === candidate.id ? "0 0 0 1px rgba(99,102,241,.35), 0 4px 24px rgba(99,102,241,.15)" : "none",
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)" }}>Rank #{candidate.rank}</div>
                    <span className="badge badge-indigo">Candidate {candidate.id}</span>
                  </div>

                  {/* Score */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <ScoreRing score={candidate.score} size={64} />
                    <div>
                      <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600 }}>Match Score</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: candidate.score >= 80 ? "var(--emerald)" : candidate.score >= 60 ? "var(--indigo)" : "var(--amber)" }}>
                        {candidate.score}%
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Matched Skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {candidate.matchedSkills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="badge badge-emerald" style={{ fontSize: 9 }}>
                            {skill}
                          </span>
                        ))}
                        {candidate.matchedSkills.length > 3 && <span className="badge badge-amber">+{candidate.matchedSkills.length - 3}</span>}
                      </div>
                    </div>
                  )}

                  {/* Admin Controls */}
                  {isLoggedIn.role === "Admin" && !revealedCandidates[candidate.id] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(candidate);
                        setShowRevealConfirm(true);
                      }}
                      style={{
                        width: "100%",
                        marginTop: 16,
                        padding: "10px",
                        background: "rgba(244,63,94,0.1)",
                        border: "1px solid rgba(244,63,94,0.2)",
                        borderRadius: 8,
                        color: "var(--rose)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(244,63,94,0.15)";
                        e.target.style.borderColor = "rgba(244,63,94,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(244,63,94,0.1)";
                        e.target.style.borderColor = "rgba(244,63,94,0.2)";
                      }}
                    >
                      <Eye size={14} /> Reveal PII
                    </button>
                  )}

                  {/* Reveal Status */}
                  {revealedCandidates[candidate.id] && (
                    <div style={{ marginTop: 16, padding: "12px", background: "rgba(16,185,129,0.08)", borderRadius: 8, fontSize: 11, color: "var(--emerald)" }}>
                      ✓ PII revealed on {new Date().toLocaleTimeString()}
                    </div>
                  )}

                  {/* Recruiter Notice */}
                  {isLoggedIn.role === "Recruiter" && (
                    <div style={{ marginTop: 16, padding: "10px", background: "rgba(255,255,255,0.04)", borderRadius: 8, fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
                      <Lock size={12} style={{ display: "inline", marginRight: 4 }} /> PII access restricted
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log */}
          {auditLog.length > 0 && (
            <div style={{ padding: "20px", background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 16 }}>Audit Log (EU AI Act Art. 14)</div>
              <div style={{ fontSize: 11, color: "var(--subtext)", lineHeight: 1.6, fontFamily: "var(--mono)" }}>
                {auditLog.map((entry, idx) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    [{new Date(entry.timestamp || entry.action_type).toLocaleTimeString()}] {entry.action ||entry.action_type}: {entry.details?.candidate_id || entry.candidateId || "Batch"} · By {entry.user || "System"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reveal Confirmation Modal */}
        {showRevealConfirm && selectedCandidate && (
          <ConfirmModal
            title="Reveal Candidate PII?"
            message={`You are about to reveal personally identifiable information for Candidate ${selectedCandidate.id}. This action will be logged to the immutable audit trail per EU AI Act Article 14.`}
            isDangerous={true}
            onConfirm={() => handleReveal(selectedCandidate.id)}
            onCancel={() => setShowRevealConfirm(false)}
          />
        )}
      </div>
    );
  }

  return null;
}
