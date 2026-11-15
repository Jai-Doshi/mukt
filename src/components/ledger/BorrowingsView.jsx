import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowDownLeft,
  PieChart,
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import {
  formatMoney,
  rateFmt,
  fmtDate,
  monthKey,
  monthName,
  COLORS,
} from "../../constants";
import { Avatar } from "../common/Avatar";

export function BorrowingsView() {
  const { state, calc, getPerson, openModal } = useMukt();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLender, setSelectedLender] = useState("all");

  const display = state.settings.display;
  const otherDisplay = display === "local" ? "loan" : "local";
  const currency = display === "local" ? state.settings.localCur : state.settings.loanCur;
  const otherCurrency = display === "local" ? state.settings.loanCur : state.settings.localCur;

  // Unique lenders
  const lenderIds = useMemo(() => {
    return [...new Set(state.borrowings.map((b) => b.fromId))];
  }, [state.borrowings]);

  // Reasons breakdown
  const reasons = useMemo(() => {
    const totalBorrowedLoan = calc.borrowed.loan || 1;
    return Object.entries(calc.byReason)
      .map(([reason, data], index) => {
        const share = (data.loan / totalBorrowedLoan) * 100;
        return {
          reason,
          amountDisplay: data[display],
          share,
          color: COLORS[(index + 2) % COLORS.length],
        };
      })
      .sort((a, b) => b.share - a.share);
  }, [calc.byReason, calc.borrowed.loan, display]);

  // Filtered borrowings
  const filteredBorrowings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.borrowings
      .filter((b) => {
        const matchesLender = selectedLender === "all" || b.fromId === selectedLender;
        if (!matchesLender) return false;
        if (!q) return true;

        const lenderName = getPerson(b.fromId).name.toLowerCase();
        const reason = (b.reason || "").toLowerCase();
        const note = (b.note || "").toLowerCase();
        const dateStr = b.date.toLowerCase();
        const formattedDate = fmtDate(b.date).toLowerCase();

        return (
          lenderName.includes(q) ||
          reason.includes(q) ||
          note.includes(q) ||
          dateStr.includes(q) ||
          formattedDate.includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0));
  }, [state.borrowings, searchQuery, selectedLender, getPerson]);

  // Group by month
  const monthlyGroups = useMemo(() => {
    const groups = {};
    filteredBorrowings.forEach((b) => {
      const mk = monthKey(b.date);
      if (!groups[mk]) groups[mk] = [];
      groups[mk].push(b);
    });
    return groups;
  }, [filteredBorrowings]);

  const totalFiltered = useMemo(() => {
    return filteredBorrowings.reduce((sum, b) => sum + b[display], 0);
  }, [filteredBorrowings, display]);

  const totalOtherFiltered = useMemo(() => {
    return filteredBorrowings.reduce((sum, b) => sum + b[otherDisplay], 0);
  }, [filteredBorrowings, otherDisplay]);

  return (
    <div className="page-container animate-enter">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-main)",
            }}
          >
            Borrowings Ledger
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-dim)", marginTop: "2px" }}>
            Everything you borrowed, from whom, and what it was spent on
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => openModal("entry", { type: "borrow" })}
        >
          <Plus size={16} />
          <span>New Borrowing</span>
        </button>
      </div>

      {state.borrowings.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            maxWidth: "500px",
            margin: "40px auto",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--info-light)",
              color: "var(--info)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <ArrowDownLeft size={28} />
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>
            No borrowings recorded yet
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginBottom: "20px" }}>
            Add your bank loan disbursements and any loans from parents or relatives with reasons and dates.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => openModal("entry", { type: "borrow" })}
          >
            <Plus size={16} />
            <span>Add Borrowing</span>
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Reason Distribution Banner */}
          {reasons.length > 0 && (
            <div className="glass-card" style={{ padding: "20px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>What It Paid For</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Expense distribution across all borrowings
                  </span>
                </div>
                <span className="badge badge-dim num" style={{ fontSize: "0.8125rem" }}>
                  {formatMoney(calc.borrowed[display], currency, { round: true })} total
                </span>
              </div>

              {/* Multi-color Reason Bar */}
              <div
                style={{
                  height: "10px",
                  width: "100%",
                  backgroundColor: "var(--bg-sunken)",
                  borderRadius: "var(--radius-full)",
                  overflow: "hidden",
                  display: "flex",
                  marginBottom: "14px",
                }}
              >
                {reasons.map((r) => (
                  <div
                    key={r.reason}
                    style={{
                      width: `${r.share}%`,
                      backgroundColor: r.color,
                      transition: "width 0.6s ease",
                    }}
                    title={`${r.reason}: ${Math.round(r.share)}%`}
                  />
                ))}
              </div>

              {/* Reasons Legend */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "12px 18px",
                  fontSize: "0.8125rem",
                }}
              >
                {reasons.map((r) => (
                  <div
                    key={r.reason}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "2px",
                        backgroundColor: r.color,
                      }}
                    />
                    <span>{r.reason}</span>
                    <strong className="num" style={{ color: "var(--text-main)" }}>
                      {formatMoney(r.amountDisplay, currency, { round: true })}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main List Card */}
          <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
            {/* Filter Toolbar */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                backgroundColor: "var(--bg-card-solid)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: "1 1 260px",
                  maxWidth: "360px",
                }}
              >
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-dim)",
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lender, reason, note..."
                  className="form-input"
                  style={{
                    paddingLeft: "36px",
                    borderRadius: "var(--radius-full)",
                  }}
                />
              </div>

              {/* Lender Filter Chips */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  overflowX: "auto",
                  maxWidth: "100%",
                  paddingBottom: "4px",
                }}
              >
                <button
                  type="button"
                  className={`seg-btn ${selectedLender === "all" ? "active" : ""}`}
                  onClick={() => setSelectedLender("all")}
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.8125rem",
                    borderRadius: "var(--radius-full)",
                    backgroundColor:
                      selectedLender === "all" ? "var(--accent)" : "var(--bg-sunken)",
                    color: selectedLender === "all" ? "#fff" : "var(--text-muted)",
                    fontWeight: 600,
                    border: "1px solid var(--border-card)",
                  }}
                >
                  All Lenders
                </button>
                {lenderIds.map((lId) => {
                  const lender = getPerson(lId);
                  const isSelected = selectedLender === lId;
                  return (
                    <button
                      key={lId}
                      type="button"
                      onClick={() => setSelectedLender(lId)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        fontSize: "0.8125rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: isSelected
                          ? `color-mix(in srgb, ${lender.color} 25%, var(--bg-sunken))`
                          : "var(--bg-sunken)",
                        color: isSelected ? "var(--text-main)" : "var(--text-muted)",
                        fontWeight: 600,
                        border: isSelected
                          ? `1.5px solid ${lender.color}`
                          : "1px solid var(--border-card)",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: lender.color,
                        }}
                      />
                      <span>{lender.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Header (Desktop) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.2fr",
                padding: "10px 20px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-dim)",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-sunken)",
              }}
            >
              <span>Borrowed From</span>
              <span>Reason / Purpose</span>
              <span>Date</span>
              <span style={{ textAlign: "right" }}>Daily Rate</span>
              <span style={{ textAlign: "right" }}>Amount Borrowed</span>
            </div>

            {/* Grouped Rows */}
            {Object.keys(monthlyGroups).length === 0 ? (
              <div
                style={{
                  padding: "48px 20px",
                  textAlign: "center",
                  color: "var(--text-dim)",
                  fontSize: "0.875rem",
                }}
              >
                No borrowings match your search or filter.
              </div>
            ) : (
              <div>
                {Object.keys(monthlyGroups)
                  .sort()
                  .reverse()
                  .map((mk) => {
                    const items = monthlyGroups[mk];
                    const monthTotal = items.reduce((s, x) => s + x[display], 0);

                    return (
                      <div key={mk}>
                        {/* Month Separator */}
                        <div
                          style={{
                            padding: "10px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "var(--bg-card-hover)",
                            borderBottom: "1px solid var(--border-subtle)",
                            borderTop: "1px solid var(--border-subtle)",
                          }}
                        >
                          <span style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                            {monthName(mk)}
                          </span>
                          <span
                            className="num"
                            style={{
                              fontSize: "0.8125rem",
                              fontWeight: 800,
                              color: "var(--text-muted)",
                            }}
                          >
                            Month total: {formatMoney(monthTotal, currency)}
                          </span>
                        </div>

                        {/* Transaction Rows */}
                        {items.map((tx) => {
                          const lender = getPerson(tx.fromId);

                          return (
                            <div
                              key={tx.id}
                              onClick={() =>
                                openModal("entry", {
                                  type: "borrow",
                                  entry: tx,
                                })
                              }
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.2fr",
                                alignItems: "center",
                                padding: "14px 20px",
                                borderBottom: "1px solid var(--border-subtle)",
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              {/* Lender */}
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <Avatar person={lender} size="sm" />
                                <div>
                                  <span
                                    style={{
                                      fontSize: "0.9375rem",
                                      fontWeight: 700,
                                      color: "var(--text-main)",
                                      display: "block",
                                    }}
                                  >
                                    {lender.name}
                                  </span>
                                  {tx.note && (
                                    <span
                                      style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-dim)",
                                      }}
                                    >
                                      {tx.note}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Reason Badge */}
                              <div>
                                <span
                                  className="badge badge-accent"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  {tx.reason || "Other"}
                                </span>
                              </div>

                              {/* Date */}
                              <div style={{ fontSize: "0.8125rem", color: "var(--text-dim)" }}>
                                {fmtDate(tx.date, { day: "numeric", month: "short", year: "numeric" })}
                              </div>

                              {/* Rate */}
                              <div
                                className="num"
                                style={{
                                  fontSize: "0.8125rem",
                                  textAlign: "right",
                                  color: "var(--text-dim)",
                                }}
                              >
                                {rateFmt(tx.rate)}
                              </div>

                              {/* Amounts */}
                              <div style={{ textAlign: "right" }}>
                                <div
                                  className="num"
                                  style={{
                                    fontSize: "0.9375rem",
                                    fontWeight: 800,
                                    color: "var(--info)",
                                  }}
                                >
                                  +{formatMoney(tx[display], currency)}
                                </div>
                                <div
                                  className="num"
                                  style={{
                                    fontSize: "0.75rem",
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
                    );
                  })}
              </div>
            )}

            {/* Summary Footer */}
            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--bg-sunken)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              <div>
                <span className="num" style={{ fontWeight: 800 }}>
                  {filteredBorrowings.length}
                </span>{" "}
                disbursement{filteredBorrowings.length === 1 ? "" : "s"}
              </div>
              <div style={{ textAlign: "right" }}>
                <span>
                  Total Borrowed:{" "}
                  <strong className="num" style={{ fontSize: "1rem", color: "var(--info)" }}>
                    {formatMoney(totalFiltered, currency)}
                  </strong>
                </span>
                <span
                  className="num"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-dim)",
                    display: "block",
                  }}
                >
                  {formatMoney(totalOtherFiltered, otherCurrency)} at each transaction's rate
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
