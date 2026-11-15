import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useMukt } from "../../context/MuktContext";

export function Toast() {
  const { toast, dismissToast } = useMukt();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-400" style={{ color: "var(--success)" }} />,
    error: <AlertCircle size={18} className="text-rose-400" style={{ color: "var(--danger)" }} />,
    info: <Info size={18} className="text-blue-400" style={{ color: "var(--info)" }} />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "80px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 18px",
        background: "var(--bg-elevated)",
        color: "var(--text-main)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-strong)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
        backdropFilter: "blur(12px)",
        maxWidth: "420px",
        animation: "toastSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <style>{`
        @keyframes toastSlide {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {icons[toast.type] || icons.success}
      <span style={{ fontSize: "0.875rem", fontWeight: 500, flex: 1 }}>{toast.message}</span>
      <button
        onClick={dismissToast}
        aria-label="Dismiss notification"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          color: "var(--text-dim)",
          borderRadius: "var(--radius-sm)",
          transition: "color 0.15s ease",
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
