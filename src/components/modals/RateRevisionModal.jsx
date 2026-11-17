import React, { useState } from "react";
import { Percent, Calendar, FileText, Check } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { todayISO } from "../../constants";
import { BottomSheet } from "../common/BottomSheet";
import { triggerHaptic } from "../../utils/haptics";

export function RateRevisionModal({ data }) {
  const { closeModal, addInterestRateRevision, updateInterestRateRevision } = useMukt();
  const revision = data?.revision || null;
  const isEdit = Boolean(revision);

  const [effectiveDate, setEffectiveDate] = useState(revision?.effectiveDate || todayISO());
  const [rate, setRate] = useState(revision?.rate != null ? String(revision.rate) : "9.50");
  const [note, setNote] = useState(revision?.note || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedRate = parseFloat(rate.replace(/,/g, ""));
    if (!(parsedRate > 0 && parsedRate <= 50)) {
      setError("Please enter a valid annual interest rate (e.g. 9.85).");
      return;
    }
    if (!effectiveDate) {
      setError("Please pick an effective date.");
      return;
    }

    triggerHaptic("success");
    if (isEdit) {
      updateInterestRateRevision(revision.id, {
        effectiveDate,
        rate: parsedRate,
        note: note.trim(),
      });
    } else {
      addInterestRateRevision({
        effectiveDate,
        rate: parsedRate,
        note: note.trim(),
      });
    }
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={closeModal}
      title={isEdit ? "Edit Interest Rate" : "Add Rate Revision"}
      subtitle="Floating interest rate effective from a specific date"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "var(--danger-light)",
              color: "var(--danger)",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Effective Date */}
        <div>
          <label
            htmlFor="revision-date"
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--text-dim)",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Effective From
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="revision-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="form-input"
              style={{ width: "100%", paddingLeft: "36px" }}
              required
            />
            <Calendar
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Annual Rate % */}
        <div>
          <label
            htmlFor="revision-rate"
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--text-dim)",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Annual Floating Rate (% p.a.)
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="revision-rate"
              type="number"
              step="0.01"
              min="0.1"
              max="50"
              placeholder="e.g. 9.85"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="form-input"
              style={{
                width: "100%",
                paddingLeft: "36px",
                fontSize: "1.125rem",
                fontWeight: 700,
              }}
              required
              autoFocus
            />
            <Percent
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--accent)",
                pointerEvents: "none",
              }}
            />
          </div>
          <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "4px", display: "block" }}>
            Standard EBLR / Repo Rate + Bank Spread (e.g. 6.50% + 3.35% = 9.85%)
          </span>
        </div>

        {/* Note / Reason for rate change */}
        <div>
          <label
            htmlFor="revision-note"
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--text-dim)",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Description / Reason (Optional)
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="revision-note"
              type="text"
              placeholder="e.g. RBI repo rate hike (+0.25%), bank spread revision"
              value={note}
              maxLength={80}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
              style={{ width: "100%", paddingLeft: "36px" }}
            />
            <FileText
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1, gap: "6px" }}
          >
            <Check size={16} />
            <span>{isEdit ? "Save Revision" : "Add Rate"}</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
