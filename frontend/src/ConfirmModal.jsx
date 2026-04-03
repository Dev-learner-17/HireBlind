import React from "react";
import { AlertTriangle, X, Loader2, CheckCircle2 } from "lucide-react";

/**
 * CONFIRM MODAL COMPONENT
 * ========================
 * Displays a confirmation dialog for admin-only actions like revealing PII.
 * Used by App.jsx when Admin clicks "Reveal Identity" button.
 * 
 * EU AI Act compliance: Art. 14 (Human Oversight)
 */

export default function ConfirmModal({ 
  title = "Confirm Action", 
  message = "Are you sure?",
  onConfirm, 
  onCancel, 
  isLoading = false,
  isDangerous = false 
}) {
  return (
    <div 
      className="modal-backdrop" 
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div 
        className="fade-up"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border2)",
          borderRadius: 18,
          width: "100%",
          maxWidth: 420,
          overflow: "hidden",
          boxShadow: "0 32px 64px rgba(0,0,0,.7)",
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div 
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isDangerous ? "rgba(244,63,94,.15)" : "rgba(99,102,241,.15)",
                border: isDangerous ? "1px solid rgba(244,63,94,.3)" : "1px solid rgba(99,102,241,.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle 
                size={16} 
                style={{ color: isDangerous ? "#f43f5e" : "#6366f1" }} 
              />
            </div>
            <div>
              <div 
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Confirmation required
              </div>
            </div>
          </div>
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 4,
              borderRadius: 6,
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <p 
            style={{
              color: "var(--subtext)",
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>

        {/* Compliance Notice */}
        <div style={{ margin: "16px 24px 0" }}>
          <div 
            style={{
              padding: "12px 14px",
              background: "rgba(245,158,11,.07)",
              border: "1px solid rgba(245,158,11,.2)",
              borderRadius: 10,
            }}
          >
            <div 
              style={{
                fontSize: 10,
                color: "#fbbf24",
                lineHeight: 1.6,
              }}
            >
              <strong>EU AI Act Art. 14</strong> — This action will be logged to the audit trail.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 10,
          }}
        >
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "10px",
              background: "none",
              border: "1px solid var(--border2)",
              borderRadius: 10,
              color: "var(--subtext)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.background = "rgba(255,255,255,.05)")}
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "10px",
              background: isDangerous ? "var(--rose)" : "var(--indigo)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              opacity: isLoading ? 0.6 : 1,
              transition: "opacity .2s, background .2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 
                  size={15} 
                  style={{ animation: "spin 1s linear infinite" }} 
                />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Confirm & Log
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
