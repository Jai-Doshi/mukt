import React, { useState, useMemo } from "react";
import { Sparkles, Zap } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney } from "../../constants";
import { BottomSheet } from "../common/BottomSheet";
import { triggerHaptic } from "../../utils/haptics";

export function PayoffSimulatorModal() {
  const { closeModal, state, calc } = useMukt();
  const display = state.settings.display;
  const isLocal = display === "local";
  const currency = isLocal ? state.settings.localCur : state.settings.loanCur;
  const rate = calc.rate || 1;

  // Base pace in display currency
  const basePaceDisplay = isLocal && rate ? calc.pace / rate : calc.pace;
  const remainingDisplay = isLocal && calc.remainingLocal != null ? calc.remainingLocal : calc.remaining;

  const defaultExtra = isLocal ? 150 : 10000;
  const [extraPayment, setExtraPayment] = useState(defaultExtra);

  // Accelerated calculation
  const acceleratedPace = Math.max(1, basePaceDisplay + Number(extraPayment || 0));
  const newMonths = remainingDisplay > 0 ? Math.ceil(remainingDisplay / acceleratedPace) : 0;
  const currentMonths = calc.payoff ? calc.payoff.months : 0;
  const monthsSaved = Math.max(0, currentMonths - newMonths);

  const newPayoffDate = useMemo(() => {
    if (newMonths <= 0) return new Date();
    const d = new Date();
    d.setMonth(d.getMonth() + newMonths);
    return d;
  }, [newMonths]);

  return (
    <BottomSheet
      isOpen={true}
      onClose={closeModal}
      title="Payoff Simulator"
      subtitle="See how extra repayments compress your debt timeline"
    >
      <div>
        {/* Current vs Simulated Comparison Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {/* Current Trajectory */}
          <div
            style={{
              padding: "14px",
              backgroundColor: "var(--bg-sunken)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Current Pace
            </span>
            <div
              className="num"
              style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}
            >
              {calc.payoff
                ? calc.payoff.date.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                : "—"}
            </div>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)" }}>
              {currentMonths} mo · {formatMoney(basePaceDisplay, currency, { round: true })}/mo
            </span>
          </div>

          {/* Accelerated Trajectory */}
          <div
            style={{
              padding: "14px",
              backgroundColor: "var(--accent-light)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--accent-glow)",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--accent)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Simulated Pace
            </span>
            <div
              className="num"
              style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent)" }}
            >
              {newPayoffDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
            </div>
            <span style={{ fontSize: "0.6875rem", color: "var(--accent)", fontWeight: 700 }}>
              {newMonths} mo ({monthsSaved} mo faster!)
            </span>
          </div>
        </div>

        {/* Extra Payment Slider & Input */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <label
              htmlFor="sim-extra"
              style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-main)" }}
            >
              Extra Monthly Payment:
            </label>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "4px 8px",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>+</span>
              <input
                id="sim-extra"
                type="number"
                inputMode="decimal"
                min="0"
                step={isLocal ? "25" : "1000"}
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value) || 0)}
                className="amount-input num"
                style={{
                  width: "80px",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  color: "var(--text-main)",
                  MozAppearance: "textfield",
                  WebkitAppearance: "none",
                  appearance: "textfield",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600 }}>
                {currency}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max={isLocal ? 1000 : 80000}
            step={isLocal ? 25 : 1000}
            value={extraPayment}
            onChange={(e) => {
              triggerHaptic("light");
              setExtraPayment(Number(e.target.value) || 0);
            }}
            style={{
              width: "100%",
              accentColor: "var(--accent)",
              cursor: "pointer",
            }}
          />

          {/* Quick preset buttons */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              marginTop: "8px",
              overflowX: "auto",
              scrollbarWidth: "none",
              paddingBottom: "4px",
            }}
          >
            {(isLocal ? [50, 100, 250, 500] : [5000, 10000, 25000, 50000]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setExtraPayment(preset);
                }}
                style={{
                  flexShrink: 0,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: extraPayment === preset ? "var(--accent)" : "var(--bg-sunken)",
                  color: extraPayment === preset ? "#fff" : "var(--text-muted)",
                  border: "1px solid var(--border-card)",
                }}
              >
                +{formatMoney(preset, currency, { round: true })}
              </button>
            ))}
          </div>
        </div>

        {/* Milestone Impact Highlights */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-sunken)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <Zap size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
            Contributing an extra{" "}
            <strong style={{ color: "var(--text-main)" }}>
              {formatMoney(extraPayment, currency, { round: true })}/mo
            </strong>{" "}
            frees you from this debt{" "}
            <strong style={{ color: "var(--accent)" }}>
              {monthsSaved} month{monthsSaved === 1 ? "" : "s"} earlier
            </strong>
            .
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            triggerHaptic("light");
            closeModal();
          }}
          style={{ width: "100%", padding: "12px" }}
        >
          Close Simulator
        </button>
      </div>
    </BottomSheet>
  );
}
