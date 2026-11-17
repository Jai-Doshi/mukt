import React from "react";
import { Flame, Percent, ChevronRight, TrendingUp, ShieldCheck } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney } from "../../constants";
import { triggerHaptic } from "../../utils/haptics";

export function InterestBurnBanner() {
  const { state, calc, openModal } = useMukt();
  const interest = calc.interest || {};
  const isEnabled = state.interestConfig?.enabled;
  const { loanCur, localCur } = state.settings;

  const bankPerson = state.people.find(
    (p) => p.id === state.interestConfig?.lenderId
  ) || { name: "Bank Education Loan" };

  if (!isEnabled) {
    return (
      <div
        onClick={() => {
          triggerHaptic("light");
          openModal("interest");
        }}
        style={{
          padding: "12px 16px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.06))",
          border: "1px dashed var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          gap: "12px",
          transition: "all 0.18s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-subtle)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Percent size={16} />
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-main)" }}>
              Enable Floating Interest & Daily Burn Tracking
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              Track daily reducing balance, rate revisions, and Section 80E tax deductions
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: "0.75rem", padding: "4px 10px", flexShrink: 0 }}
        >
          Set Up
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        triggerHaptic("light");
        openModal("interest");
      }}
      className="interactive-card"
      style={{
        padding: "14px 18px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.06))",
        border: "1px solid rgba(239, 68, 68, 0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        gap: "14px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Flame size={18} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--text-main)" }}>
              {interest.currentRate}% p.a. Floating
            </span>
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-dim)",
                padding: "1px 6px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {bankPerson.name}
            </span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>
            Daily Burn: <strong style={{ color: "var(--danger)" }}>{formatMoney(interest.dailyBurnLoan, loanCur)}/day</strong>
            {localCur !== loanCur && (
              <span style={{ marginLeft: "4px" }}>
                (≈ {formatMoney(interest.dailyBurnLocal, localCur)}/day)
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent)", flexShrink: 0 }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>Details</span>
        <ChevronRight size={15} />
      </div>
    </div>
  );
}
