import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney, rateFmt, fmtDate, monthKey, monthName } from "../../constants";
import { Avatar } from "../common/Avatar";

export function RepaymentsView() {
  const { state, getPerson, openModal } = useMukt();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("all");

  const display = state.settings.display;
  const otherDisplay = display === "local" ? "loan" : "local";
  const currency = display === "local" ? state.settings.localCur : state.settings.loanCur;
  const otherCurrency = display === "local" ? state.settings.loanCur : state.settings.localCur;

  // Unique payers
  const payerIds = useMemo(() => {
    return [...new Set(state.payments.map((p) => p.payerId))];
  }, [state.payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.payments
      .filter((p) => {
        const matchesPerson = selectedPerson === "all" || p.payerId === selectedPerson;
        if (!matchesPerson) return false;
        if (!q) return true;

        const payerName = getPerson(p.payerId).name.toLowerCase();
        const toName = getPerson(p.toId).name.toLowerCase();
        const note = (p.note || "").toLowerCase();
        const mode = (p.mode || "").toLowerCase();
        const dateStr = p.date.toLowerCase();
        const formattedDate = fmtDate(p.date).toLowerCase();

        return (
          payerName.includes(q) ||
          toName.includes(q) ||
          note.includes(q) ||
          mode.includes(q) ||
          dateStr.includes(q) ||
          formattedDate.includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0));
  }, [state.payments, searchQuery, selectedPerson, getPerson]);

  // Group by month
  const monthlyGroups = useMemo(() => {
    const groups = {};
    filteredPayments.forEach((p) => {
      const mk = monthKey(p.date);
      if (!groups[mk]) groups[mk] = [];
      groups[mk].push(p);
    });
    return groups;
  }, [filteredPayments]);

  const totalFiltered = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p[display], 0);
  }, [filteredPayments, display]);

  const totalOtherFiltered = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p[otherDisplay], 0);
  }, [filteredPayments, otherDisplay]);

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
            Repayments Ledger
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-dim)", marginTop: "2px" }}>
            Every payment toward the loan, who made it, and the daily exchange rate
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => openModal("entry", { type: "pay" })}
        >
          <Plus size={16} />
          <span>New Repayment</span>
        </button>
      </div>

      {state.payments.length === 0 ? (
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
              background: "var(--success-light)",
              color: "var(--success)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <ArrowUpRight size={28} />
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>
            No repayments logged yet
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginBottom: "20px" }}>
            Log each repayment with the date, who made it, the amount in either currency, and that day's exchange rate.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => openModal("entry", { type: "pay" })}
          >
            <Plus size={16} />
            <span>Add Repayment</span>
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          {/* Filter & Search Toolbar */}
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
            {/* Search Input */}
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
                placeholder="Search payer, bank, notes..."
                className="form-input"
                style={{
                  paddingLeft: "36px",
                  borderRadius: "var(--radius-full)",
                }}
              />
            </div>

            {/* Person Filter Chips */}
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
                className={`seg-btn ${selectedPerson === "all" ? "active" : ""}`}
                onClick={() => setSelectedPerson("all")}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.8125rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor:
                    selectedPerson === "all" ? "var(--accent)" : "var(--bg-sunken)",
                  color: selectedPerson === "all" ? "#fff" : "var(--text-muted)",
                  fontWeight: 600,
                  border: "1px solid var(--border-card)",
                }}
              >
                Everyone
              </button>
              {payerIds.map((pId) => {
                const person = getPerson(pId);
                const isSelected = selectedPerson === pId;
                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => setSelectedPerson(pId)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      fontSize: "0.8125rem",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: isSelected
                        ? `color-mix(in srgb, ${person.color} 25%, var(--bg-sunken))`
                        : "var(--bg-sunken)",
                      color: isSelected ? "var(--text-main)" : "var(--text-muted)",
                      fontWeight: 600,
                      border: isSelected
                        ? `1.5px solid ${person.color}`
                        : "1px solid var(--border-card)",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: person.color,
                      }}
                    />
                    <span>{person.name}</span>
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
            <span>Paid By / Details</span>
            <span>Paid To</span>
            <span>Date</span>
            <span style={{ textAlign: "right" }}>Daily Rate</span>
            <span style={{ textAlign: "right" }}>Amount Repaid</span>
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
              No repayments match your search or filter.
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
                      {/* Month Separator Header */}
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
                        const payer = getPerson(tx.payerId);
                        const receiver = getPerson(tx.toId);

                        return (
                          <div
                            key={tx.id}
                            onClick={() =>
                              openModal("entry", {
                                type: "pay",
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
                            {/* Payer info */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <Avatar person={payer} size="sm" />
                              <div>
                                <span
                                  style={{
                                    fontSize: "0.9375rem",
                                    fontWeight: 700,
                                    color: "var(--text-main)",
                                    display: "block",
                                  }}
                                >
                                  {payer.name}
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

                            {/* Receiver & Method */}
                            <div>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                  color: "var(--text-muted)",
                                  display: "block",
                                }}
                              >
                                {receiver.name}
                              </span>
                              {tx.mode && (
                                <span
                                  className="badge badge-dim"
                                  style={{ fontSize: "0.6875rem", padding: "1px 6px" }}
                                >
                                  {tx.mode}
                                </span>
                              )}
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
                                  color: "var(--success)",
                                }}
                              >
                                −{formatMoney(tx[display], currency)}
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
                {filteredPayments.length}
              </span>{" "}
              payment{filteredPayments.length === 1 ? "" : "s"}
            </div>
            <div style={{ textAlign: "right" }}>
              <span>
                Total:{" "}
                <strong className="num" style={{ fontSize: "1rem", color: "var(--success)" }}>
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
      )}
    </div>
  );
}
