import React from "react";
import { Landmark, Check } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney } from "../../constants";
import { Avatar } from "../common/Avatar";

export function LendersCard() {
  const { state, calc, getPerson } = useMukt();
  const display = state.settings.display;
  const isLocal = display === "local";
  const currency = isLocal ? state.settings.localCur : state.settings.loanCur;

  const lenders = calc.lendersList && calc.lendersList.length > 0
    ? calc.lendersList
    : [
        ...new Set([
          ...Object.keys(calc.byLender),
          ...Object.keys(calc.paidTo),
        ]),
      ]
        .map((id) => {
          const b = calc.byLender[id] || { loan: 0, local: 0 };
          const pd = calc.paidTo[id] || { loan: 0, local: 0 };
          const leftLoan = Math.max(0, b.loan - pd.loan);
          const pct = b.loan > 0 ? Math.min(100, (pd.loan / b.loan) * 100) : 100;
          return {
            id,
            person: getPerson(id),
            b,
            pd,
            leftLoan,
            pct,
            isCleared: leftLoan < 1,
            isBank: false,
            indirectLoan: 0,
            interestAccrued: 0,
          };
        })
        .sort((a, z) => z.leftLoan - a.leftLoan);

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
            Balance by Lender
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)" }}>
            What is left with each bank & family member
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
          <Landmark size={14} />
        </span>
      </div>

      {lenders.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            color: "var(--text-dim)",
            fontSize: "0.875rem",
          }}
        >
          No borrowings recorded yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
          {lenders.map((l) => {
            const isCleared = l.leftLoan < 1;
            const leftDisplay = isLocal && calc.rate
              ? l.leftLoan / calc.rate
              : l.leftLoan;

            return (
              <div key={l.person.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar person={l.person} size="sm" />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "var(--text-main)",
                            display: "block",
                          }}
                        >
                          {l.person.name}
                        </span>
                        {l.isBank && l.interestAccrued > 0 && (
                          <span
                            className="badge badge-warning"
                            style={{ fontSize: "0.625rem", padding: "1px 6px" }}
                          >
                            Floating Int
                          </span>
                        )}
                        {l.indirectPaidLoan > 0 && (
                          <span
                            className="badge badge-accent"
                            style={{ fontSize: "0.625rem", padding: "1px 6px" }}
                          >
                            Paid Bank for you
                          </span>
                        )}
                      </div>
                      <span
                        className="num"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        Repaid {formatMoney(l.pd[display], currency, { round: true })} of{" "}
                        {formatMoney(l.b[display], currency, { round: true })}
                        {l.indirectPaidLoan > 0 && (
                          <span style={{ color: "var(--text-muted)" }}>
                            {" "}(incl. {formatMoney(isLocal && calc.rate ? l.indirectPaidLoan / calc.rate : l.indirectPaidLoan, currency, { round: true })} to Bank)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {isCleared ? (
                      <span
                        className="badge badge-success num"
                        style={{ fontSize: "0.75rem", gap: "3px" }}
                      >
                        <Check size={12} strokeWidth={3} /> Cleared
                      </span>
                    ) : (
                      <>
                        <div
                          className="num"
                          style={{
                            fontSize: "0.9375rem",
                            fontWeight: 800,
                            color: "var(--text-main)",
                          }}
                        >
                          {formatMoney(leftDisplay, currency, { round: true })}
                        </div>
                        <span
                          className="num"
                          style={{ fontSize: "0.6875rem", color: "var(--text-dim)" }}
                        >
                          {Math.round(l.pct)}% paid
                        </span>
                      </>
                    )}
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
                      width: `${l.pct}%`,
                      backgroundColor: isCleared ? "var(--success)" : l.person.color,
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
