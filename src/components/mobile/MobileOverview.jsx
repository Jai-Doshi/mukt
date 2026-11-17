import React, { useState } from "react";
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Calendar,
  Layers,
  Landmark,
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney, formatCompact, monthName, fmtDate, rateFmt } from "../../constants";
import { Avatar } from "../common/Avatar";
import { InterestBurnBanner } from "../overview/InterestBurnBanner";
import { Sparkline } from "../common/Sparkline";
import { triggerHaptic } from "../../utils/haptics";

export function MobileOverview() {
  const { state, calc, getPerson, openModal, setDisplayCurrency } = useMukt();
  const display = state.settings.display;
  const isLocal = display === "local";
  const currency = isLocal ? state.settings.localCur : state.settings.loanCur;
  const otherCurrency = isLocal ? state.settings.loanCur : state.settings.localCur;

  const {
    remaining,
    remainingLocal,
    borrowed,
    paid,
    pct,
    isLoanFree,
    byPayer,
    byLender,
    paidTo,
    payoff,
    pace,
    chartData,
    recentActivity,
  } = calc;

  // Chart range toggle for mobile (6 months or 12 months)
  const [chartRange, setChartRange] = useState(6);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(null);

  const mainAmount = isLocal
    ? remainingLocal != null
      ? formatMoney(remainingLocal, currency, { round: true })
      : "—"
    : formatMoney(remaining, currency, { round: true });

  const secondaryAmount = isLocal
    ? `${formatMoney(remaining, state.settings.loanCur, { round: true })} in ${state.settings.loanCur}`
    : remainingLocal != null
    ? `≈ ${formatMoney(remainingLocal, state.settings.localCur, { round: true })}`
    : "";

  const totalBase = Math.max(borrowed.loan, paid.loan) || 1;
  const payers = Object.entries(byPayer).sort((a, b) => b[1].loan - a[1].loan);

  // Sparkline data
  const pts = [...state.payments].sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  const sparkPoints = pts.map((p) => {
    running += p.loan;
    return running;
  });

  // Lenders for Carousel
  const lenders = calc.lendersList && calc.lendersList.length > 0
    ? calc.lendersList
    : [
        ...new Set([...Object.keys(byLender), ...Object.keys(paidTo)]),
      ]
        .map((id) => {
          const b = byLender[id] || { loan: 0, local: 0 };
          const pd = paidTo[id] || { loan: 0, local: 0 };
          const leftLoan = Math.max(0, b.loan - pd.loan);
          const pctRepaid = b.loan > 0 ? Math.min(100, (pd.loan / b.loan) * 100) : 100;
          return {
            id,
            person: getPerson(id),
            b,
            pd,
            leftLoan,
            pctRepaid,
            isBank: false,
            indirectPaidLoan: 0,
            interestAccrued: 0,
          };
        })
        .sort((a, z) => z.leftLoan - a.leftLoan);

  // Mobile Slice for Chart (last 6 or 12)
  const activeChartData = chartData.slice(-chartRange);
  const maxTotal = Math.max(...activeChartData.map((d) => d.total), 0);
  const topCeil = maxTotal > 0 ? maxTotal * 1.15 : 10000;

  return (
    <div
      className="mobile-overview-container"
      style={{
        padding: "16px 14px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      {/* 1. WALLET HERO CARD (Apple Wallet / Revolut style) */}
      <div
        className="glass-card"
        style={{
          borderRadius: "22px",
          padding: "22px 18px",
          background: "linear-gradient(145deg, var(--bg-card-solid) 0%, rgba(18, 22, 32, 0.95) 100%)",
          border: "1px solid var(--border-strong)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: "var(--accent-glow)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Card Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-dim)",
            }}
          >
            Outstanding Balance
          </span>

          {/* Currency Switch Badge right on the card */}
          {state.settings.loanCur !== state.settings.localCur && (
            <div
              style={{
                display: "inline-flex",
                backgroundColor: "var(--bg-sunken)",
                padding: "2px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-card)",
              }}
            >
              {["loan", "local"].map((side) => {
                const isActive = display === side;
                const label = side === "loan" ? state.settings.loanCur : state.settings.localCur;
                return (
                  <button
                    key={side}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setDisplayCurrency(side);
                    }}
                    style={{
                      padding: "3px 8px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.6875rem",
                      fontWeight: 800,
                      backgroundColor: isActive ? "var(--accent)" : "transparent",
                      color: isActive ? "#fff" : "var(--text-dim)",
                      border: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Large Mobile Balance Display */}
        <div style={{ marginBottom: "16px" }}>
          <div
            className="num"
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              lineHeight: 1.05,
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
                fontSize: "0.8125rem",
                color: "var(--text-dim)",
                marginTop: "4px",
                fontWeight: 600,
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
                gap: "8px",
                marginTop: "8px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.6875rem",
                cursor: "pointer",
              }}
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
                Interest:{" "}
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

        {/* Multi-contributor Progress Track */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              marginBottom: "6px",
            }}
          >
            <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>Loan Progress</span>
            <span className="badge badge-accent num" style={{ fontSize: "0.75rem" }}>
              {Math.round(pct)}% Repaid
            </span>
          </div>

          <div
            style={{
              height: "10px",
              width: "100%",
              backgroundColor: "var(--bg-sunken)",
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
              display: "flex",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {payers.map(([id, pData]) => {
              const person = getPerson(id);
              const widthPct = (pData.loan / totalBase) * 100;
              return (
                <div
                  key={id}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: person.color,
                  }}
                  title={`${person.name}: ${Math.round(widthPct)}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Quick Action Buttons Toolbar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: "8px",
            paddingTop: "6px",
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              triggerHaptic("medium");
              openModal("entry", { type: "pay" });
            }}
            style={{
              padding: "10px 8px",
              fontSize: "0.8125rem",
              borderRadius: "var(--radius-md)",
            }}
          >
            <ArrowUpRight size={15} strokeWidth={2.5} />
            <span>Repay</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              triggerHaptic("light");
              openModal("entry", { type: "borrow" });
            }}
            style={{
              padding: "10px 8px",
              fontSize: "0.8125rem",
              borderRadius: "var(--radius-md)",
            }}
          >
            <ArrowDownLeft size={15} />
            <span>Borrow</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              triggerHaptic("light");
              openModal("simulator");
            }}
            style={{
              padding: "10px 8px",
              fontSize: "0.8125rem",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Sparkles size={14} style={{ color: "var(--accent)" }} />
            <span>Simulate</span>
          </button>
        </div>
      </div>

      {/* Floating Interest & Daily Burn Banner */}
      <InterestBurnBanner />

      {/* 2. HORIZON & SPARKLINE CARD */}
      <div
        className="glass-card"
        style={{
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          borderRadius: "18px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Flag size={14} style={{ color: "var(--accent)" }} />
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-dim)",
              }}
            >
              Loan-Free Horizon
            </span>
          </div>

          {isLoanFree ? (
            <div style={{ fontWeight: 800, color: "var(--success)", fontSize: "1.1rem" }}>
              Debt Free! 🎉
            </div>
          ) : payoff ? (
            <div>
              <div
                className="num"
                style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}
              >
                {payoff.date.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                {payoff.months} months left at {formatMoney(isLocal && calc.rate ? pace / calc.rate : pace, currency, { round: true })}/mo
              </span>
            </div>
          ) : (
            <div style={{ fontSize: "0.8125rem", color: "var(--text-dim)" }}>
              Add more repayments to unlock payoff forecast
            </div>
          )}
        </div>

        {/* Mini Sparkline Curve */}
        <div style={{ width: "95px", flexShrink: 0 }}>
          <Sparkline points={sparkPoints} height={38} width={95} />
        </div>
      </div>

      {/* 3. LENDERS HORIZONTAL SWIPEABLE CAROUSEL */}
      {lenders.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
              padding: "0 4px",
            }}
          >
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-dim)",
              }}
            >
              Balance by Lender
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Swipe to browse</span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              paddingBottom: "8px",
              scrollbarWidth: "none",
            }}
          >
            {lenders.map((l) => {
              const isCleared = l.leftLoan < 1;
              const leftDisplay = isLocal && calc.rate ? l.leftLoan / calc.rate : l.leftLoan;

              return (
                <div
                  key={l.person.id}
                  className="glass-card"
                  style={{
                    flex: "0 0 210px",
                    scrollSnapAlign: "start",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    backgroundColor: "var(--bg-sunken)",
                    border: "1px solid var(--border-card)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Avatar person={l.person} size="sm" />
                      <div>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "var(--text-main)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "95px",
                            display: "block",
                          }}
                        >
                          {l.person.name}
                        </span>
                        {l.indirectPaidLoan > 0 && (
                          <span
                            className="badge badge-accent"
                            style={{ fontSize: "0.5625rem", padding: "0 4px" }}
                          >
                            Paid Bank
                          </span>
                        )}
                        {l.isBank && l.interestAccrued > 0 && (
                          <span
                            className="badge badge-warning"
                            style={{ fontSize: "0.5625rem", padding: "0 4px" }}
                          >
                            Floating Int
                          </span>
                        )}
                      </div>
                    </div>

                    {isCleared && (
                      <span
                        className="badge badge-success"
                        style={{ fontSize: "0.625rem", padding: "1px 5px" }}
                      >
                        Cleared
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", display: "block" }}>
                      Remaining
                    </span>
                    <span
                      className="num"
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        color: isCleared ? "var(--success)" : "var(--text-main)",
                      }}
                    >
                      {formatMoney(leftDisplay, currency, { round: true })}
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div
                    style={{
                      height: "5px",
                      width: "100%",
                      backgroundColor: "var(--bg-card-solid)",
                      borderRadius: "var(--radius-full)",
                      overflow: "hidden",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${l.pctRepaid}%`,
                        backgroundColor: isCleared ? "var(--success)" : l.person.color,
                        borderRadius: "var(--radius-full)",
                      }}
                    />
                  </div>
                  <span
                    className="num"
                    style={{ fontSize: "0.6875rem", color: "var(--text-dim)", textAlign: "right", display: "block" }}
                  >
                    {Math.round(l.pctRepaid)}% repaid
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TOUCH-FRIENDLY MONTHLY REPAYMENTS CHART */}
      <div
        className="glass-card"
        style={{
          borderRadius: "20px",
          padding: "18px 16px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 800 }}>Repayments Trend</h3>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)" }}>
              Tap any month to see breakdown
            </span>
          </div>

          {/* 6M vs 12M Range Switcher */}
          <div
            className="seg-control"
            style={{
              padding: "2px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {[6, 12].map((r) => (
              <button
                key={r}
                type="button"
                className={`seg-btn ${chartRange === r ? "active" : ""}`}
                onClick={() => {
                  triggerHaptic("light");
                  setChartRange(r);
                  setSelectedMonthIdx(null);
                }}
                style={{
                  padding: "3px 8px",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: chartRange === r ? "var(--bg-card-solid)" : "transparent",
                  color: chartRange === r ? "var(--text-main)" : "var(--text-dim)",
                }}
              >
                {r}M
              </button>
            ))}
          </div>
        </div>

        {maxTotal === 0 ? (
          <div
            style={{
              height: "130px",
              display: "grid",
              placeItems: "center",
              color: "var(--text-dim)",
              fontSize: "0.8125rem",
            }}
          >
            No payments recorded in this period
          </div>
        ) : (
          <div>
            {/* SVG Chart */}
            <div style={{ height: "130px", width: "100%", position: "relative" }}>
              <svg
                viewBox={`0 0 ${activeChartData.length * 48} 110`}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                style={{ display: "block", overflow: "visible" }}
              >
                {activeChartData.map((d, idx) => {
                  const barW = Math.min(22, 48 * 0.55);
                  const x = idx * 48 + (48 - barW) / 2;
                  const isSelected = selectedMonthIdx === idx;

                  let yAcc = 0;
                  const entries = Object.entries(d.byPerson);

                  return (
                    <g
                      key={d.month}
                      onClick={() => {
                        triggerHaptic("light");
                        setSelectedMonthIdx(isSelected ? null : idx);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Touch target hit box */}
                      <rect
                        x={idx * 48}
                        y={0}
                        width={48}
                        height={100}
                        fill={isSelected ? "var(--border-subtle)" : "transparent"}
                        rx={6}
                      />

                      {/* Stacked bars */}
                      {entries.map(([pId, amt], k) => {
                        const person = getPerson(pId);
                        const h = (amt / topCeil) * 85;
                        const y = 90 - yAcc - h;
                        yAcc += h;

                        return (
                          <rect
                            key={pId}
                            x={x}
                            y={y}
                            width={barW}
                            height={Math.max(2, h)}
                            fill={person.color}
                            rx={k === entries.length - 1 ? 4 : 0}
                            opacity={isSelected ? 1 : 0.88}
                          />
                        );
                      })}

                      {/* Month label */}
                      <text
                        x={idx * 48 + 24}
                        y={104}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight={isSelected ? "800" : "600"}
                        fill={isSelected ? "var(--accent)" : "var(--text-dim)"}
                      >
                        {new Date(d.month + "-01T00:00:00").toLocaleDateString("en-GB", {
                          month: "short",
                        })}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Month Mobile Inspection Pill */}
            {selectedMonthIdx !== null && activeChartData[selectedMonthIdx] && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-strong)",
                  animation: "fadeInUp 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    marginBottom: "4px",
                    borderBottom: "1px solid var(--border-subtle)",
                    paddingBottom: "4px",
                  }}
                >
                  <span>{monthName(activeChartData[selectedMonthIdx].month)}</span>
                  <span className="num" style={{ color: "var(--accent)" }}>
                    {formatMoney(activeChartData[selectedMonthIdx].total, currency, { round: true })}
                  </span>
                </div>

                {Object.entries(activeChartData[selectedMonthIdx].byPerson).map(([pId, amt]) => {
                  const p = getPerson(pId);
                  return (
                    <div
                      key={pId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.75rem",
                        padding: "2px 0",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            backgroundColor: p.color,
                          }}
                        />
                        <span style={{ color: "var(--text-muted)" }}>{p.name}</span>
                      </span>
                      <span className="num" style={{ fontWeight: 700 }}>
                        {formatMoney(amt, currency, { round: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. RECENT ACTIVITY MOBILE LIST */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
            padding: "0 4px",
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-dim)",
            }}
          >
            Recent Transactions
          </span>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              triggerHaptic("light");
              window.location.hash = "#payments";
            }}
            style={{ fontSize: "0.75rem", color: "var(--accent)" }}
          >
            See all
          </button>
        </div>

        {recentActivity.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: "0.8125rem",
              borderRadius: "16px",
            }}
          >
            No transactions yet
          </div>
        ) : (
          <div
            className="glass-card"
            style={{
              padding: "0",
              borderRadius: "18px",
              overflow: "hidden",
            }}
          >
            {recentActivity.map((tx, idx) => {
              const isPay = tx.kind === "pay";
              const person = getPerson(isPay ? tx.payerId : tx.fromId);
              const target = isPay ? getPerson(tx.toId) : null;

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    triggerHaptic("light");
                    openModal("entry", {
                      type: isPay ? "pay" : "borrow",
                      entry: tx,
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "13px 16px",
                    borderBottom:
                      idx === recentActivity.length - 1
                        ? "none"
                        : "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <Avatar person={person} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <div
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
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-dim)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {fmtDate(tx.date, { day: "numeric", month: "short" })} ·{" "}
                        {isPay ? `to ${target?.name || "Lender"}` : tx.reason || "Borrowing"}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "10px" }}>
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
                      Rate {rateFmt(tx.rate)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
