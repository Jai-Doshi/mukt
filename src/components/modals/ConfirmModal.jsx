import React from "react";
import { AlertTriangle } from "lucide-react";
import { useMukt } from "../../context/MuktContext";

export function ConfirmModal({ data }) {
  const { closeModal } = useMukt();
  const { title, description, confirmText = "Confirm", onConfirm, isDestructive = true } = data || {};

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 110,
        display: "grid",
        placeItems: "center",
        padding: "16px",
      }}
      onClick={closeModal}
    >
      <div
        className="glass-card animate-enter"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--bg-card-solid)",
          border: "1px solid var(--border-card)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: isDestructive ? "var(--danger-light)" : "var(--accent-light)",
            color: isDestructive ? "var(--danger)" : "var(--accent)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertTriangle size={24} />
        </div>

        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px" }}>
          {title || "Are you sure?"}
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "24px" }}>
          {description || "This action cannot be undone."}
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            type="button"
            className={isDestructive ? "btn btn-danger" : "btn btn-primary"}
            style={{ flex: 1 }}
            onClick={() => {
              closeModal();
              onConfirm?.();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
