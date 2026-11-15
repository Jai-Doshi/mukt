import React, { useState } from "react";
import { RefreshCw, Globe } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { todayISO, r4, fetchExchangeRate } from "../../constants";
import { BottomSheet } from "../common/BottomSheet";
import { triggerHaptic } from "../../utils/haptics";

export function RateModal() {
  const { closeModal, state, updateSettings, showToast } = useMukt();
  const { loanCur, localCur, rate } = state.settings;

  const [rateVal, setRateVal] = useState(rate ? String(rate) : "");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  const handleFetchMarket = async () => {
    setIsFetching(true);
    setError("");
    triggerHaptic("light");
    try {
      const res = await fetchExchangeRate(localCur, loanCur, todayISO());
      setRateVal(String(r4(res.rate)));
      showToast(`Today's market rate loaded: ${r4(res.rate)}`);
      triggerHaptic("success");
    } catch {
      setError("Could not reach ECB rate service. Please enter rate manually.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const parsed = parseFloat(rateVal.replace(/,/g, ""));
    if (!(parsed > 0)) {
      setError("Please enter a valid exchange rate greater than zero.");
      return;
    }

    triggerHaptic("success");
    updateSettings({
      rate: r4(parsed),
      rateDate: todayISO(),
    });
    closeModal();
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={closeModal}
      title="Exchange Rate"
      subtitle={`Daily rate between ${localCur} and ${loanCur}`}
    >
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label
            htmlFor="custom-rate"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--text-main)",
              display: "block",
              marginBottom: "6px",
            }}
          >
            1 {localCur} = ? {loanCur}
          </label>
          <input
            id="custom-rate"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="0.0000"
            value={rateVal}
            onChange={(e) => setRateVal(e.target.value)}
            autoFocus
            className="form-input num amount-input"
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              padding: "12px 14px",
              MozAppearance: "textfield",
              WebkitAppearance: "none",
              appearance: "textfield",
            }}
          />
          <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "6px" }}>
            Used to calculate outstanding balances and forecasts. Each entry permanently preserves the rate from the day it was entered.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleFetchMarket}
          disabled={isFetching}
          style={{ width: "100%", padding: "12px" }}
        >
          <RefreshCw
            size={16}
            style={{ animation: isFetching ? "spin 1s linear infinite" : "none" }}
          />
          <span>Fetch Today's Market Rate (ECB)</span>
        </button>

        {error && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--danger-light)",
              color: "var(--danger)",
              fontSize: "0.8125rem",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>
            Save Rate
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
