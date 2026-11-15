import React from "react";
import { Plus, Sparkles, SlidersHorizontal, RefreshCw } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { CurrencySwitch } from "../common/CurrencySwitch";
import { Avatar } from "../common/Avatar";
import { triggerHaptic } from "../../utils/haptics";

export function MobileHeader() {
  const { activeTab, openModal, state, getPerson } = useMukt();
  const me = getPerson("me");

  const titles = {
    overview: "Mukt",
    payments: "Repayments",
    borrowed: "Borrowings",
    settings: "Settings",
  };

  return (
    <header
      className="mobile-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        height: "var(--header-h)",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(10, 12, 16, 0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-card)",
      }}
    >
      <style>{`
        @media (min-width: 992px) {
          .mobile-header { display: none !important; }
        }
      `}</style>

      {/* Brand logo & page title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          onClick={() => {
            triggerHaptic("light");
            window.location.hash = "#overview";
          }}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: "var(--accent)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 12px var(--accent-glow)",
            cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <rect width="48" height="48" rx="13" fill="var(--accent)" />
            <path
              d="M24 13 A11 11 0 1 1 13 24"
              fill="none"
              stroke="#fff"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="16.2" cy="16.2" r="2.5" fill="#fff" />
          </svg>
        </div>

        <div>
          <span
            style={{
              fontSize: "1.125rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-main)",
            }}
          >
            {titles[activeTab] || "Mukt"}
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CurrencySwitch compact />

        <button
          className="btn btn-primary"
          style={{
            width: "36px",
            height: "36px",
            padding: 0,
            borderRadius: "50%",
            boxShadow: "0 4px 14px var(--accent-glow)",
          }}
          onClick={() => {
            triggerHaptic("medium");
            openModal("entry", { type: activeTab === "borrowed" ? "borrow" : "pay" });
          }}
          aria-label="New entry"
        >
          <Plus size={18} strokeWidth={2.6} />
        </button>
      </div>
    </header>
  );
}
