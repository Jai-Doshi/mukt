import React from "react";
import { ArrowDownLeft, ArrowUpRight, Calendar, Globe, RefreshCw } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney, rateFmt, fmtDate } from "../../constants";

export function KpiGrid() {
  const { state, calc, isFetchingRate, refreshRate, openModal } = useMukt();
  const display = state.settings.display;
  const isLocal = display === "local";
  const currency = isLocal ? state.settings.localCur : state.settings.loanCur;
  const otherCurrency = isLocal ? state.settings.loanCur : state.settings.localCur;

  const currentYear = new Date().getFullYear();

  const cards = [
    {
      id: "borrowed",
      label: "Total Borrowed",
      icon: ArrowDownLeft,
      color: "var(--info)",
      mainValue: formatMoney(calc.borrowed[display], currency, { round: true }),
      subValue: `${state.borrowings.length} entries · ${formatMoney(
        calc.borrowed[isLocal ? "loan" : "local"],
        otherCurrency,
        { round: true }
      )}`,
    },
    {
      id: "paid",
      label: "Total Repaid",
      icon: ArrowUpRight,
      color: "var(--success)",
      mainValue: formatMoney(calc.paid[display], currency, { round: true }),
      subValue: `${state.payments.length} payments · ${formatMoney(
        calc.paid[isLocal ? "loan" : "local"],
        otherCurrency,
        { round: true }
      )}`,
    },
    {
      id: "thisYear",
      label: `Repaid in ${currentYear}`,
      icon: Calendar,
      color: "var(--warning)",
      mainValue: formatMoney(calc.thisYear[display], currency, { round: true }),
      subValue: `Year-to-date since Jan 1, ${currentYear}`,
    },
    {
      id: "rate",
      label: "Exchange Rate",
      icon: Globe,
      color: "var(--accent)",
      mainValue: calc.rate ? rateFmt(calc.rate) : "—",
      subValue: calc.rate
        ? `${state.settings.loanCur} / 1 ${state.settings.localCur}${
            state.settings.rateDate ? ` · ${fmtDate(state.settings.rateDate, { day: "numeric", month: "short" })}` : ""
          }`
        : "Tap to set rate",
      hasRefresh: true,
      onClick: () => openModal("rate"),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="glass-card"
            onClick={card.onClick}
            style={{
              padding: "18px 20px",
              cursor: card.onClick ? "pointer" : "default",
              position: "relative",
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
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-dim)",
                }}
              >
                {card.label}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {card.hasRefresh && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshRate();
                    }}
                    disabled={isFetchingRate}
                    style={{
                      padding: "2px",
                      color: "var(--text-dim)",
                      borderRadius: "4px",
                    }}
                    title="Fetch live market rate"
                  >
                    <RefreshCw
                      size={13}
                      style={{
                        animation: isFetchingRate ? "spin 1s linear infinite" : "none",
                      }}
                    />
                  </button>
                )}
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: `color-mix(in srgb, ${card.color} 14%, transparent)`,
                    color: card.color,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon size={14} />
                </span>
              </div>
            </div>

            <div
              className="num"
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {card.mainValue}
            </div>

            <div
              className="num"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                marginTop: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {card.subValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
