import React from "react";
import { Users } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney } from "../../constants";
import { Avatar } from "../common/Avatar";

export function ContributionsCard() {
  const { state, calc, getPerson } = useMukt();
  const display = state.settings.display;
  const currency = display === "local" ? state.settings.localCur : state.settings.loanCur;

  const totalPaidLoan = calc.paid.loan || 1;
  const payers = Object.entries(calc.byPayer).sort((a, b) => b[1].loan - a[1].loan);

  return (
    <div
      className="glass-card"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Contributions
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)" }}>
            Share of repayments by person
          </p>
        </div>
        <span
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "var(--bg-sunken)",
            display: "grid",
            placeItems: "center",
            color: "var(--text-dim)",
          }}
        >
          <Users size={14} />
        </span>
      </div>

      {payers.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            color: "var(--text-dim)",
            fontSize: "0.875rem",
          }}
        >
          No repayments made yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
          {payers.map(([id, pData]) => {
            const person = getPerson(id);
            const share = Math.round((pData.loan / totalPaidLoan) * 100);

            return (
              <div key={id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar person={person} size="sm" />
                    <div>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "var(--text-main)",
                          display: "block",
                        }}
                      >
                        {person.name}
                      </span>
                      <span
                        className="num"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        {pData.count} payment{pData.count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      className="num"
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 800,
                        color: "var(--text-main)",
                      }}
                    >
                      {formatMoney(pData[display], currency, { round: true })}
                    </div>
                    <span
                      className="badge badge-dim num"
                      style={{ fontSize: "0.6875rem", padding: "1px 6px" }}
                    >
                      {share}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: "6px",
                    width: "100%",
                    backgroundColor: "var(--bg-sunken)",
                    borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${share}%`,
                      backgroundColor: person.color,
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
