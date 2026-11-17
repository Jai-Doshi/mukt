import React from "react";
import { useMukt } from "../../context/MuktContext";
import { FlagIcon } from "./FlagIcon";

export function CurrencySwitch({
  className = "",
  compact = false,
  flagsOnly = false,
  style = {},
}) {
  const { state, setDisplayCurrency } = useMukt();
  const { loanCur, localCur, display } = state.settings;

  if (loanCur === localCur) return null;

  const flagSize = flagsOnly ? 18 : 17;

  return (
    <div
      className={`seg-control ${className}`}
      role="group"
      aria-label="Display currency selector"
      style={{
        display: "inline-flex",
        background: "var(--bg-sunken)",
        padding: flagsOnly ? "2px" : "3px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-card)",
        alignItems: "center",
        ...style,
      }}
    >
      <button
        type="button"
        className={`seg-btn ${display === "loan" ? "active" : ""}`}
        onClick={() => setDisplayCurrency("loan")}
        aria-pressed={display === "loan"}
        title={loanCur}
        aria-label={`Display in ${loanCur}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: flagsOnly ? "5px 8px" : "8px 14px", // Extra top & bottom padding on desktop
          fontSize: "0.8125rem",
          fontWeight: 700,
          borderRadius: "var(--radius-sm)",
          color: display === "loan" ? "var(--text-main)" : "var(--text-dim)",
          background: display === "loan" ? "var(--bg-card-solid)" : "transparent",
          boxShadow: display === "loan" ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
          border: display === "loan" ? "1px solid var(--border-subtle)" : "1px solid transparent",
          transition: "all 0.18s ease",
          whiteSpace: "nowrap",
          lineHeight: 1,
          flex: flagsOnly ? "none" : 1,
        }}
      >
        <FlagIcon code={loanCur} size={flagSize} />
        {!flagsOnly && <span>{loanCur}</span>}
      </button>
      <button
        type="button"
        className={`seg-btn ${display === "local" ? "active" : ""}`}
        onClick={() => setDisplayCurrency("local")}
        aria-pressed={display === "local"}
        title={localCur}
        aria-label={`Display in ${localCur}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: flagsOnly ? "5px 8px" : "8px 14px", // Extra top & bottom padding on desktop
          fontSize: "0.8125rem",
          fontWeight: 700,
          borderRadius: "var(--radius-sm)",
          color: display === "local" ? "var(--text-main)" : "var(--text-dim)",
          background: display === "local" ? "var(--bg-card-solid)" : "transparent",
          boxShadow: display === "local" ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
          border: display === "local" ? "1px solid var(--border-subtle)" : "1px solid transparent",
          transition: "all 0.18s ease",
          whiteSpace: "nowrap",
          lineHeight: 1,
          flex: flagsOnly ? "none" : 1,
        }}
      >
        <FlagIcon code={localCur} size={flagSize} />
        {!flagsOnly && <span>{localCur}</span>}
      </button>
    </div>
  );
}
