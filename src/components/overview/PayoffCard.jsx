import React from "react";
import { Calendar, Flag, Sparkles, TrendingUp } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney, fmtDate } from "../../constants";
import { Sparkline } from "../common/Sparkline";

export function PayoffCard() {
  const { state, calc } = useMukt();
  const { payoff, pace, isLoanFree, rate } = calc;
  const display = state.settings.display;
  const isLocal = display === "local";
  const currency = isLocal ? state.settings.localCur : state.settings.loanCur;

  // Pace converted to active display currency
  const monthlyPace = isLocal && rate ? pace / rate : pace;

  // Sparkline data from payments sorted chronologically
  const pts = [...state.payments].sort((a, b) => a.date.localeCompare(b.date));
  let runningTotal = 0;
  const sparkPoints = pts.map((p) => {
    runningTotal += p.loan;
    return runningTotal;
  });

  return (
    <div
      className="glass-card"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        position: "relative",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-dim)",
            }}
          >
            Loan-Free Projection
          </span>
          <span
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "var(--accent-light)",
              display: "grid",
              placeItems: "center",
              color: "var(--accent)",
            }}
          >
            <Flag size={14} />
          </span>
        </div>

        {isLoanFree ? (
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--success)",
                letterSpacing: "-0.02em",
              }}
            >
              Loan-Free! 🎉
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                marginTop: "4px",
                lineHeight: 1.4,
              }}
            >
              Every single rupee borrowed has been completely settled. You are officially Mukt.
            </p>
          </div>
        ) : payoff ? (
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--text-main)",
              }}
            >
              {payoff.date.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                marginTop: "6px",
                lineHeight: 1.4,
              }}
            >
              In about{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {payoff.months < 24
                  ? `${payoff.months} months`
                  : `${(payoff.months / 12).toFixed(1)} years`}
              </strong>
              , based on your 6-month average pace of{" "}
              <strong className="num" style={{ color: "var(--accent)" }}>
                {formatMoney(monthlyPace, currency, { round: true })}/month
              </strong>
              .
            </p>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-dim)",
              }}
            >
              Gathering Data
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-dim)",
                marginTop: "6px",
              }}
            >
              Log regular monthly repayments and Mukt will calculate your exact payoff horizon.
            </p>
          </div>
        )}
      </div>

      {/* Sparkline chart at bottom */}
      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--text-dim)",
            marginBottom: "4px",
          }}
        >
          <span>Repayment trajectory</span>
          <span className="num">{pts.length} payments recorded</span>
        </div>
        <Sparkline points={sparkPoints} height={44} />
      </div>
    </div>
  );
}
