import React from "react";
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney, fmtDate } from "../../constants";
import { Avatar } from "../common/Avatar";

export function RecentActivity() {
  const { calc, state, getPerson, openModal, changeTab } = useMukt();
  const { recentActivity } = calc;
  const display = state.settings.display;
  const otherDisplay = display === "local" ? "loan" : "local";
  const currency = display === "local" ? state.settings.localCur : state.settings.loanCur;
  const otherCurrency = display === "local" ? state.settings.loanCur : state.settings.localCur;

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
            Recent Activity
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)" }}>
            Latest payments and disbursements
          </p>
        </div>
        <button
          className="btn btn-ghost"
          style={{ fontSize: "0.8125rem", padding: "4px 8px" }}
          onClick={() => changeTab("payments")}
        >
          View all <ChevronRight size={14} />
        </button>
      </div>

      {recentActivity.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            color: "var(--text-dim)",
            fontSize: "0.875rem",
          }}
        >
          No transactions recorded yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {recentActivity.map((tx) => {
            const isPay = tx.kind === "pay";
            const person = getPerson(isPay ? tx.payerId : tx.fromId);
            const target = isPay ? getPerson(tx.toId) : null;

            return (
              <div
                key={tx.id}
                onClick={() =>
                  openModal("entry", {
                    type: isPay ? "pay" : "borrow",
                    entry: tx,
                  })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-sunken)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <Avatar person={person} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "var(--text-main)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {person.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        · {fmtDate(tx.date, { day: "numeric", month: "short" })}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-dim)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {isPay
                        ? `Paid to ${target?.name || "Lender"}${tx.mode ? ` via ${tx.mode}` : ""}`
                        : `${tx.reason || "Borrowing"}${tx.note ? ` · ${tx.note}` : ""}`}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "12px" }}>
                  <div
                    className="num"
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 800,
                      color: isPay ? "var(--success)" : "var(--info)",
                    }}
                  >
                    {isPay ? "−" : "+"}
                    {formatMoney(tx[display], currency)}
                  </div>
                  <div
                    className="num"
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--text-dim)",
                    }}
                  >
                    {formatMoney(tx[otherDisplay], otherCurrency)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
