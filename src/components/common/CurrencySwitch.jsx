import React from "react";
import { useMukt } from "../../context/MuktContext";

export function CurrencySwitch({ className = "", compact = false }) {
  const { state, setDisplayCurrency } = useMukt();
  const { loanCur, localCur, display } = state.settings;

  if (loanCur === localCur) return null;

  return (
    <div
      className={`seg-control ${className}`}
      role="group"
      aria-label="Display currency selector"
      style={{
        display: "inline-flex",
        background: "var(--bg-sunken)",
        padding: "3px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-card)",
      }}
    >
      <button
        type="button"
        className={`seg-btn ${display === "loan" ? "active" : ""}`}
        onClick={() => setDisplayCurrency("loan")}
        aria-pressed={display === "loan"}
        style={{
          padding: compact ? "4px 10px" : "6px 14px",
          fontSize: compact ? "0.75rem" : "0.8125rem",
          fontWeight: 700,
          borderRadius: "var(--radius-sm)",
          color: display === "loan" ? "var(--text-main)" : "var(--text-dim)",
          background: display === "loan" ? "var(--bg-card-solid)" : "transparent",
          boxShadow: display === "loan" ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
          border: display === "loan" ? "1px solid var(--border-subtle)" : "1px solid transparent",
          transition: "all 0.18s ease",
        }}
      >
        {loanCur}
      </button>
      <button
        type="button"
        className={`seg-btn ${display === "local" ? "active" : ""}`}
        onClick={() => setDisplayCurrency("local")}
        aria-pressed={display === "local"}
        style={{
          padding: compact ? "4px 10px" : "6px 14px",
          fontSize: compact ? "0.75rem" : "0.8125rem",
          fontWeight: 700,
          borderRadius: "var(--radius-sm)",
          color: display === "local" ? "var(--text-main)" : "var(--text-dim)",
          background: display === "local" ? "var(--bg-card-solid)" : "transparent",
          boxShadow: display === "local" ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
          border: display === "local" ? "1px solid var(--border-subtle)" : "1px solid transparent",
          transition: "all 0.18s ease",
        }}
      >
        {localCur}
      </button>
    </div>
  );
}
