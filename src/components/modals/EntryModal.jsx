import React, { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import {
  REASONS,
  MODES,
  todayISO,
  r2,
  r4,
  fetchExchangeRate,
  formatMoney,
} from "../../constants";
import { Avatar } from "../common/Avatar";
import { BottomSheet } from "../common/BottomSheet";
import { CustomSelect } from "../common/CustomSelect";
import { triggerHaptic } from "../../utils/haptics";

export function EntryModal({ data }) {
  const {
    closeModal,
    state,
    calc,
    getPerson,
    addPayment,
    updatePayment,
    deletePayment,
    addBorrowing,
    updateBorrowing,
    deleteBorrowing,
    openModal,
    currentRate,
  } = useMukt();

  const isEdit = Boolean(data?.entry);
  const entry = data?.entry || null;

  // Type: 'pay' or 'borrow'
  const [type, setType] = useState(data?.type || (entry?.kind === "borrow" ? "borrow" : "pay"));

  const { loanCur, localCur } = state.settings;
  const isSameCurrency = loanCur === localCur;

  // Currency of entered amount: 'loan' or 'local'
  const [enteredSide, setEnteredSide] = useState(entry?.entered || "loan");
  const [amountStr, setAmountStr] = useState(
    entry ? String(entry[entry.entered || "loan"]) : ""
  );

  const [date, setDate] = useState(entry?.date || todayISO());
  const [rateStr, setRateStr] = useState(
    entry?.rate ? String(entry.rate) : currentRate ? String(currentRate) : "1"
  );
  const [rateTouched, setRateTouched] = useState(Boolean(entry?.rate));
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [rateNote, setRateNote] = useState("");

  // People
  const defaultPayer = entry?.payerId || "me";
  const defaultLenders = Object.keys(calc.byLender);
  const defaultTo = entry?.toId || defaultLenders[0] || state.people.find((p) => p.id !== "me")?.id || "me";
  const defaultFrom =
    entry?.fromId ||
    state.people.find((p) => /bank|credila|avanse|sbi|hdfc|icici|axis/i.test(p.name))?.id ||
    state.people.find((p) => p.id !== "me")?.id ||
    "me";

  const [payerId, setPayerId] = useState(defaultPayer);
  const [toId, setToId] = useState(defaultTo);
  const [fromId, setFromId] = useState(defaultFrom);

  // Method / Reason / Note
  const [mode, setMode] = useState(entry?.mode || MODES[0]);
  const [reason, setReason] = useState(entry?.reason || REASONS[0]);
  const [customReason, setCustomReason] = useState(
    entry?.reason && !REASONS.includes(entry.reason) ? entry.reason : ""
  );
  const [note, setNote] = useState(entry?.note || "");
  const [error, setError] = useState("");

  // Rate auto-fetch on date change
  const fetchRateForDate = async (targetDate, manual = false) => {
    if (isSameCurrency) return;
    setIsFetchingRate(true);
    setRateNote("");
    try {
      const res = await fetchExchangeRate(localCur, loanCur, targetDate);
      setRateStr(String(r4(res.rate)));
      setRateNote(`Market rate on ${res.date}`);
      if (manual) setRateTouched(true);
    } catch {
      setRateNote("Could not fetch rate. Type manually.");
    } finally {
      setIsFetchingRate(false);
    }
  };

  useEffect(() => {
    if (!isEdit && !rateTouched && navigator.onLine) {
      fetchRateForDate(date);
    }
  }, [date]);

  // Dual Currency Live Conversion
  const parseNum = (val) => {
    const clean = String(val || "").replace(/[^\d.]/g, "");
    const parsed = parseFloat(clean);
    return isFinite(parsed) ? parsed : 0;
  };

  const parsedAmount = parseNum(amountStr);
  const parsedRate = parseNum(rateStr);

  const convertedValue =
    parsedAmount > 0 && parsedRate > 0
      ? enteredSide === "loan"
        ? parsedAmount / parsedRate
        : parsedAmount * parsedRate
      : 0;

  const otherCurrency = enteredSide === "loan" ? localCur : loanCur;

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!(parsedAmount > 0)) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }
    if (!isSameCurrency && !(parsedRate > 0)) {
      setError("Please specify a valid exchange rate.");
      return;
    }

    const calculatedLoan =
      enteredSide === "loan" ? r2(parsedAmount) : r2(parsedAmount * parsedRate);
    const calculatedLocal =
      enteredSide === "local" ? r2(parsedAmount) : r2(parsedAmount / parsedRate);

    triggerHaptic("success");

    if (type === "pay") {
      if (!payerId) {
        setError("Please select who paid this repayment.");
        return;
      }
      if (!toId) {
        setError("Please select who received this repayment.");
        return;
      }

      const paymentRecord = {
        date,
        payerId,
        toId,
        entered: enteredSide,
        loan: calculatedLoan,
        local: calculatedLocal,
        rate: r4(parsedRate),
        mode,
        note: note.trim(),
      };

      if (isEdit) {
        updatePayment(entry.id, paymentRecord);
      } else {
        addPayment(paymentRecord);
      }
    } else {
      // Borrowing
      if (!fromId) {
        setError("Please select who you borrowed from.");
        return;
      }

      const finalReason = reason === "Other" && customReason.trim() ? customReason.trim() : reason;

      const borrowingRecord = {
        date,
        fromId,
        entered: enteredSide,
        loan: calculatedLoan,
        local: calculatedLocal,
        rate: r4(parsedRate),
        reason: finalReason,
        note: note.trim(),
      };

      if (isEdit) {
        updateBorrowing(entry.id, borrowingRecord);
      } else {
        addBorrowing(borrowingRecord);
      }
    }
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={closeModal}
      title={isEdit ? (type === "pay" ? "Edit Repayment" : "Edit Borrowing") : undefined}
    >
      <div>
        {/* Toggle between Repayment and Borrowing if new entry */}
        {!isEdit && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginBottom: "18px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setType("pay");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: type === "pay" ? "#fff" : "var(--text-muted)",
                backgroundColor: type === "pay" ? "var(--success)" : "var(--bg-sunken)",
                border: type === "pay" ? "1px solid var(--success)" : "1px solid var(--border-card)",
                borderRadius: "var(--radius-md)",
                transition: "all 0.15s ease",
              }}
            >
              <ArrowUpRight size={16} strokeWidth={2.5} />
              <span>Repayment</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setType("borrow");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: type === "borrow" ? "#fff" : "var(--text-muted)",
                backgroundColor: type === "borrow" ? "var(--info)" : "var(--bg-sunken)",
                border: type === "borrow" ? "1px solid var(--info)" : "1px solid var(--border-card)",
                borderRadius: "var(--radius-md)",
                transition: "all 0.15s ease",
              }}
            >
              <ArrowDownLeft size={16} strokeWidth={2.5} />
              <span>Borrowing</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Amount Box with keypad-friendly typography */}
          <div
            style={{
              padding: "16px 18px",
              backgroundColor: "var(--bg-sunken)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-card)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <label
                htmlFor="entry-amt"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                }}
              >
                Amount
              </label>

              {!isSameCurrency && (
                <div
                  className="seg-control"
                  style={{
                    padding: "2px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  <button
                    type="button"
                    className={`seg-btn ${enteredSide === "loan" ? "active" : ""}`}
                    onClick={() => {
                      triggerHaptic("light");
                      setEnteredSide("loan");
                    }}
                    style={{
                      padding: "3px 10px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {loanCur}
                  </button>
                  <button
                    type="button"
                    className={`seg-btn ${enteredSide === "local" ? "active" : ""}`}
                    onClick={() => {
                      triggerHaptic("light");
                      setEnteredSide("local");
                    }}
                    style={{
                      padding: "3px 10px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {localCur}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                {enteredSide === "loan" ? loanCur : localCur}
              </span>
              <input
                id="entry-amt"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="amount-input"
                style={{
                  width: "100%",
                  fontSize: "2rem",
                  fontWeight: 800,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-main)",
                  letterSpacing: "-0.02em",
                  MozAppearance: "textfield",
                  WebkitAppearance: "none",
                  appearance: "textfield",
                }}
              />
            </div>

            {!isSameCurrency && (
              <div
                className="num"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-dim)",
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Equivalent in {otherCurrency}:</span>
                <strong style={{ color: "var(--text-main)", fontWeight: 700 }}>
                  {formatMoney(convertedValue, otherCurrency)}
                </strong>
              </div>
            )}
          </div>

          {/* People Selection */}
          {type === "pay" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Paid By */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--text-dim)",
                    }}
                  >
                    Paid By
                  </span>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => openModal("person")}
                    style={{ fontSize: "0.75rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: "2px" }}
                  >
                    <Plus size={12} /> New person
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    paddingBottom: "4px",
                  }}
                >
                  {state.people.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPayerId(p.id);
                      }}
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        backgroundColor:
                          payerId === p.id
                            ? `color-mix(in srgb, ${p.color} 22%, var(--bg-sunken))`
                            : "var(--bg-sunken)",
                        border:
                          payerId === p.id ? `1.5px solid ${p.color}` : "1px solid var(--border-card)",
                        color: payerId === p.id ? "var(--text-main)" : "var(--text-muted)",
                      }}
                    >
                      <Avatar person={p} size="sm" />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid To */}
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Paid To (Lender)
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    paddingBottom: "4px",
                  }}
                >
                  {state.people
                    .filter((p) => p.id !== payerId)
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          setToId(p.id);
                        }}
                        style={{
                          flexShrink: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          backgroundColor:
                            toId === p.id
                              ? `color-mix(in srgb, ${p.color} 22%, var(--bg-sunken))`
                              : "var(--bg-sunken)",
                          border:
                            toId === p.id ? `1.5px solid ${p.color}` : "1px solid var(--border-card)",
                          color: toId === p.id ? "var(--text-main)" : "var(--text-muted)",
                        }}
                      >
                        <Avatar person={p} size="sm" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                  }}
                >
                  Borrowed From
                </span>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => openModal("person")}
                  style={{ fontSize: "0.75rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: "2px" }}
                >
                  <Plus size={12} /> New lender
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  paddingBottom: "4px",
                }}
              >
                {state.people
                  .filter((p) => p.id !== "me")
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setFromId(p.id);
                      }}
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        backgroundColor:
                          fromId === p.id
                            ? `color-mix(in srgb, ${p.color} 22%, var(--bg-sunken))`
                            : "var(--bg-sunken)",
                        border:
                          fromId === p.id ? `1.5px solid ${p.color}` : "1px solid var(--border-card)",
                        color: fromId === p.id ? "var(--text-main)" : "var(--text-muted)",
                      }}
                    >
                      <Avatar person={p} size="sm" />
                      <span>{p.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Date & Rate */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label
                htmlFor="entry-date"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Date
              </label>
              <input
                id="entry-date"
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>

            {!isSameCurrency && (
              <div>
                <label
                  htmlFor="entry-rate"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Rate ({loanCur}/{localCur})
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="entry-rate"
                    type="number"
                    step="0.0001"
                    inputMode="decimal"
                    value={rateStr}
                    onChange={(e) => {
                      setRateStr(e.target.value);
                      setRateTouched(true);
                    }}
                    className="form-input num amount-input"
                    style={{
                      paddingRight: "34px",
                      MozAppearance: "textfield",
                      WebkitAppearance: "none",
                      appearance: "textfield",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fetchRateForDate(date, true)}
                    disabled={isFetchingRate}
                    style={{
                      position: "absolute",
                      right: "6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-dim)",
                      padding: "4px",
                    }}
                    title="Get ECB market rate for this date"
                  >
                    <RefreshCw
                      size={13}
                      style={{
                        animation: isFetchingRate ? "spin 1s linear infinite" : "none",
                      }}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reason or Method */}
          {type === "pay" ? (
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Payment Method
              </label>
              <CustomSelect
                value={mode}
                onChange={setMode}
                options={MODES}
                placeholder="Choose payment method"
              />
            </div>
          ) : (
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Reason / Purpose
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  paddingBottom: "4px",
                }}
              >
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setReason(r);
                    }}
                    style={{
                      flexShrink: 0,
                      padding: "6px 12px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: reason === r ? "var(--accent)" : "var(--bg-sunken)",
                      color: reason === r ? "#fff" : "var(--text-muted)",
                      border: "1px solid var(--border-card)",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label
              htmlFor="entry-note"
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Note (Optional)
            </label>
            <input
              id="entry-note"
              type="text"
              placeholder="e.g. Flight ticket, monthly salary wire"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-card)",
                backgroundColor: "var(--bg-sunken)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--danger-light)",
                color: "var(--danger)",
                fontSize: "0.8125rem",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {isEdit ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  triggerHaptic("heavy");
                  if (type === "pay") deletePayment(entry.id);
                  else deleteBorrowing(entry.id);
                }}
              >
                <Trash2 size={16} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>
                {isEdit ? "Save Changes" : type === "pay" ? "Add Repayment" : "Add Borrowing"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </BottomSheet>
  );
}
