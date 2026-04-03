import React, { useEffect, useState } from "react";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * PROGRESS BAR COMPONENT
 * =====================
 * Shows per-file upload progress with filename and completion indicator.
 * Displays % progress for each file during upload.
 * Used by App.jsx for multi-file uploads.
 */

export default function ProgressBar({ 
  filename = "document.pdf",
  progress = 0,
  status = "uploading", // "uploading" | "complete" | "error"
  error = null
}) {
  const [displayProgress, setDisplayProgress] = useState(progress);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);

  const statusConfig = {
    uploading: {
      barColor: "#6366f1",
      textColor: "#818cf8",
      icon: null,
      label: `${displayProgress}%`,
    },
    complete: {
      barColor: "#10b981",
      textColor: "#34d399",
      icon: <CheckCircle2 size={14} />,
      label: "Complete",
    },
    error: {
      barColor: "#f43f5e",
      textColor: "#fb7185",
      icon: <AlertCircle size={14} />,
      label: "Failed",
    },
  };

  const config = statusConfig[status] || statusConfig.uploading;

  return (
    <div 
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${status === "error" ? "rgba(244,63,94,.2)" : "var(--border)"}`,
        borderRadius: 12,
        marginBottom: 10,
        transition: "all 0.3s ease",
      }}
    >
      {/* File Icon */}
      <div 
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "rgba(99,102,241,.1)",
          border: "1px solid rgba(99,102,241,.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FileText size={16} style={{ color: "#6366f1" }} />
      </div>

      {/* File Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Filename */}
        <div 
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {filename}
        </div>

        {/* Progress Bar */}
        <div 
          style={{
            height: 3,
            borderRadius: 99,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div 
            style={{
              height: "100%",
              background: config.barColor,
              borderRadius: 99,
              width: status === "complete" || status === "error" ? "100%" : `${displayProgress}%`,
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: status === "error" ? "none" : `0 0 8px ${config.barColor}40`,
            }}
          />
        </div>
      </div>

      {/* Status Label */}
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          whiteSpace: "nowrap",
          color: config.textColor,
          fontFamily: "var(--mono)",
        }}
      >
        {config.icon}
        {config.label}
      </div>

      {/* Error Message (if applicable) */}
      {error && (
        <div 
          style={{
            position: "absolute",
            bottom: -20,
            left: 0,
            right: 0,
            fontSize: 10,
            color: "#fb7185",
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
