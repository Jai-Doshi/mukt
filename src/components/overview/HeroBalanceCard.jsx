import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney, formatCompact } from "../../constants";

export function HeroBalanceCard() {
  const { state, calc, getPerson, openModal } = useMukt();
  const display = state.settings.display;
  const isLocal = display === "local";
  const currency = isLocal ? state.settings.localCur : state.settings.loanCur;
  const otherCurrency = isLocal ? state.settings.loanCur : state.settings.localCur;

  const { remaining, remainingLocal, borrowed, paid, pct, isLoanFree, byPayer } = calc;

  const mainAmount = isLocal
    ? remainingLocal != null
      ? formatMoney(remainingLocal, currency, { round: true })
      : "—"
    : formatMoney(remaining, currency, { round: true });

  const secondaryAmount = isLocal
    ? `${formatMoney(remaining, state.settings.loanCur, { round: true })} in ${state.settings.loanCur}`
    : remainingLocal != null
    ? `≈ ${formatMoney(remainingLocal, state.settings.localCur, { round: true })} at today's rate`
    : "";

  const payers = Object.entries(byPayer).sort((a, b) => b[1].loan - a[1].loan);
  const totalBase = Math.max(borrowed.loan, paid.loan) || 1;

  return (
    <div
      className="glass-card"
      style={{
        padding: "28px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background glow */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "var(--accent-glow)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-dim)",
            }}
          >
            Outstanding Balance
          </span>
          {isLoanFree && (
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> Fully Repaid
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="badge badge-accent num" style={{ fontSize: "0.8125rem" }}>
            {Math.round(pct)}% Repaid
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => openModal("simulator")}
            style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "var(--radius-full)" }}
            title="Interactive Payoff Simulator"
          >
            <Sparkles size={13} style={{ color: "var(--accent)" }} />
            <span>Simulate Payoff</span>
          </button>
        </div>
      </div>

      {/* Main Amounts */}
      <div style={{ marginBottom: "22px" }}>
        <div
          className="num"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: isLoanFree ? "var(--success)" : "var(--text-main)",
          }}
        >
          {isLoanFree ? formatMoney(0, currency, { round: true }) : mainAmount}
        </div>
        {secondaryAmount && (
          <div
            className="num"
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-dim)",
              marginTop: "6px",
              fontWeight: 500,
            }}
          >
            {secondaryAmount}
          </div>
        )}

        {/* Live Principal & Accrued Interest Breakdown */}
        {calc.interest?.enabled && !isLoanFree && calc.interestBreakdown && (
          <div
            onClick={() => openModal("interest")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--bg-sunken)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            title="Click to view floating interest rate history, daily burn & 80E tax deduction"
          >
            <span style={{ color: "var(--text-dim)" }}>
              Principal:{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {formatMoney(
                  isLocal && calc.rate
                    ? calc.interestBreakdown.totalPrincipalRemaining / calc.rate
                    : calc.interestBreakdown.totalPrincipalRemaining,
                  currency,
                  { round: true }
                )}
              </strong>
            </span>
            <span style={{ color: "var(--border-strong)" }}>•</span>
            <span style={{ color: "var(--warning)" }}>
              Accrued Interest:{" "}
              <strong style={{ color: "var(--warning)" }}>
                {formatMoney(
                  isLocal && calc.rate
                    ? calc.interestBreakdown.accruedInterest / calc.rate
                    : calc.interestBreakdown.accruedInterest,
                  currency,
                  { round: true }
                )}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Contributor Progress Track */}
      <div
        style={{
          height: "12px",
          width: "100%",
          backgroundColor: "var(--bg-sunken)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
          display: "flex",
          border: "1px solid var(--border-subtle)",
          marginBottom: "16px",
        }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {payers.map(([id, pData], idx) => {
          const person = getPerson(id);
          const widthPct = (pData.loan / totalBase) * 100;
          return (
            <div
              key={id}
              style={{
                width: `${widthPct}%`,
                backgroundColor: person.color,
                transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              title={`${person.name}: ${Math.round(widthPct)}%`}
            />
          );
        })}
      </div>

      {/* Contributor Legend Chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "14px",
          fontSize: "0.8125rem",
        }}
      >
        {payers.map(([id, pData]) => {
          const person = getPerson(id);
          const share = Math.round((pData.loan / totalBase) * 100);
          return (
            <div
              key={id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-muted)",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  backgroundColor: person.color,
                  display: "inline-block",
                }}
              />
              <span style={{ fontWeight: 600 }}>{person.name}</span>
              <span className="num" style={{ fontWeight: 700, color: "var(--text-main)" }}>
                {share}%
              </span>
            </div>
          );
        })}

        {!isLoanFree && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-dim)",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "3px",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-card)",
                display: "inline-block",
              }}
            />
            <span>Remaining</span>
            <span className="num" style={{ fontWeight: 700 }}>
              {Math.round(100 - pct)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
