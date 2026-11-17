import React, { useState } from "react";
import {
  Percent,
  Flame,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney } from "../../constants";
import { BottomSheet } from "../common/BottomSheet";
import { triggerHaptic } from "../../utils/haptics";

export function InterestDetailsModal() {
  const {
    closeModal,
    openModal,
    state,
    calc,
    deleteInterestRateRevision,
  } = useMukt();

  const [showAllMonths, setShowAllMonths] = useState(false);

  const interest = calc.interest || {};
  const { loanCur, localCur, display } = state.settings;
  const isLocal = display === "local";

  const bankPerson = state.people.find(
    (p) => p.id === state.interestConfig?.lenderId
  ) || { name: "Bank Education Loan" };

  const currentRate = interest.currentRate || 9.5;
  const rates = state.interestConfig?.rates || [];

  return (
    <BottomSheet
      isOpen={true}
      onClose={closeModal}
      title="Floating Interest & Daily Burn"
      subtitle={`${bankPerson.name} · Daily Reducing Balance`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* HERO CARD: Current Rate & Daily Burn */}
        <div
          style={{
            padding: "20px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.08))",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--danger)", letterSpacing: "0.05em" }}>
                Current Floating Rate
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
                <span style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.03em" }}>
                  {currentRate}%
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-dim)" }}>
                  p.a.
                </span>
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                fontSize: "0.75rem",
                fontWeight: 800,
              }}
            >
              <Flame size={14} />
              <span>Active Floating</span>
            </div>
          </div>

          {/* Daily & Monthly Burn Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>
                Daily Interest Burn
              </span>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--danger)", marginTop: "2px" }}>
                {formatMoney(interest.dailyBurnLoan, loanCur)}
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-dim)", marginLeft: "4px" }}>
                  / day
                </span>
              </div>
              {localCur !== loanCur && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "1px" }}>
                  ≈ {formatMoney(interest.dailyBurnLocal, localCur)} / day
                </div>
              )}
            </div>

            <div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>
                Monthly Interest Cost
              </span>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
                {formatMoney(interest.monthlyBurnLoan, loanCur)}
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-dim)", marginLeft: "4px" }}>
                  / mo
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "1px" }}>
                Based on current balance
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 80E TAX DEDUCTION BADGE */}
        {interest.interestPaidCurrentFY > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "14px",
              backgroundColor: "var(--accent-light)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <ShieldCheck size={24} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--accent)" }}>
                Section 80E Tax Deduction Eligible
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-main)", marginTop: "2px" }}>
                You have paid <strong>{formatMoney(interest.interestPaidCurrentFY, loanCur)}</strong> in interest this Financial Year. You can claim this as a 100% tax deduction on Indian income.
              </div>
            </div>
          </div>
        )}

        {/* FINANCIAL SUMMARY METRICS */}
        <div>
          <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "10px" }}>
            Principal & Interest Breakdown
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-card)",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", fontWeight: 600 }}>
                Remaining Principal
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
                {formatMoney(interest.currentPrincipal, loanCur)}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-card)",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", fontWeight: 600 }}>
                Unpaid Accrued Interest
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--danger)", marginTop: "2px" }}>
                {formatMoney(interest.accruedInterest, loanCur)}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-card)",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", fontWeight: 600 }}>
                Total Interest Paid So Far
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
                {formatMoney(interest.totalInterestPaid, loanCur)}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-card)",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", fontWeight: 600 }}>
                Total Principal Repaid
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--success)", marginTop: "2px" }}>
                {formatMoney(interest.totalPrincipalPaid, loanCur)}
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING RATE REVISION TIMELINE */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-dim)" }}>
              Rate Revision Timeline
            </h4>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                triggerHaptic("light");
                openModal("rate-revision");
              }}
              style={{ fontSize: "0.75rem", padding: "4px 10px", gap: "4px" }}
            >
              <Plus size={13} />
              <span>Add Rate Change</span>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: "var(--bg-sunken)",
              padding: "10px",
              borderRadius: "14px",
              border: "1px solid var(--border-card)",
            }}
          >
            {rates.map((r, idx) => (
              <div
                key={r.id || idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-solid)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--accent)" }}>
                      {r.rate}% p.a.
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={12} />
                      Effective {r.effectiveDate}
                    </span>
                  </div>
                  {r.note && (
                    <p style={{ fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "2px" }}>
                      {r.note}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    type="button"
                    title="Edit revision"
                    onClick={() => {
                      triggerHaptic("light");
                      openModal("rate-revision", { revision: r });
                    }}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      color: "var(--text-dim)",
                      backgroundColor: "transparent",
                      border: "none",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  {rates.length > 1 && (
                    <button
                      type="button"
                      title="Delete revision"
                      onClick={() => {
                        triggerHaptic("error");
                        deleteInterestRateRevision(r.id);
                      }}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        color: "var(--danger)",
                        backgroundColor: "transparent",
                        border: "none",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MONTHLY ACCRUAL STATEMENT LEDGER */}
        {interest.monthlyTimeline && interest.monthlyTimeline.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-dim)" }}>
                Monthly Interest Ledger
              </h4>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAllMonths((prev) => !prev)}
                style={{ fontSize: "0.75rem", padding: "2px 8px" }}
              >
                <span>{showAllMonths ? "Show Recent 6 Months" : "Show All Months"}</span>
                {showAllMonths ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              {(showAllMonths ? interest.monthlyTimeline : interest.monthlyTimeline.slice(0, 6)).map((m) => (
                <div
                  key={m.month}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-sunken)",
                    border: "1px solid var(--border-card)",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, color: "var(--text-main)" }}>
                      {m.month}
                    </span>
                    <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", marginLeft: "6px" }}>
                      @{m.rate}%
                    </span>
                    {m.borrowed > 0 && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--accent)", marginTop: "2px" }}>
                        +{formatMoney(m.borrowed, loanCur)} disbursed
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "var(--danger)" }}>
                      +{formatMoney(Math.round(m.interestAccrued), loanCur)} int
                    </div>
                    {m.interestPaid + m.principalPaid > 0 && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--success)", marginTop: "1px" }}>
                        -{formatMoney(Math.round(m.interestPaid + m.principalPaid), loanCur)} paid
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={closeModal}
          style={{ width: "100%", padding: "12px" }}
        >
          Close
        </button>
      </div>
    </BottomSheet>
  );
}
