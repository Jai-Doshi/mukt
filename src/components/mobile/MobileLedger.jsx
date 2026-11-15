import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ArrowDownUp,
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import {
  formatMoney,
  rateFmt,
  fmtDate,
  monthKey,
  monthName,
  MODES,
  REASONS,
} from "../../constants";
import { Avatar } from "../common/Avatar";
import { BottomSheet } from "../common/BottomSheet";
import { triggerHaptic } from "../../utils/haptics";

export function MobileLedger({ kind = "payments" }) {
  const { state, getPerson, openModal } = useMukt();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc"); // 'date_desc', 'date_asc', 'amount_desc', 'amount_asc'
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const isPay = kind === "payments";
  const display = state.settings.display;
  const otherDisplay = display === "local" ? "loan" : "local";
  const currency = display === "local" ? state.settings.localCur : state.settings.loanCur;
  const otherCurrency = display === "local" ? state.settings.loanCur : state.settings.localCur;

  const allItems = isPay ? state.payments : state.borrowings;
  const keyField = isPay ? "payerId" : "fromId";

  // Unique people
  const personIds = useMemo(() => {
    return [...new Set(allItems.map((item) => item[keyField]))];
  }, [allItems, keyField]);

  // Unique methods or reasons present in data
  const availableMethods = useMemo(() => {
    if (isPay) {
      return [...new Set(state.payments.map((p) => p.mode).filter(Boolean))];
    } else {
      return [...new Set(state.borrowings.map((b) => b.reason).filter(Boolean))];
    }
  }, [isPay, state.payments, state.borrowings]);

  // Active filters count
  const activeFiltersCount =
    (selectedPerson !== "all" ? 1 : 0) +
    (selectedMethod !== "all" ? 1 : 0) +
    (sortBy !== "date_desc" ? 1 : 0);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allItems.filter((x) => {
      // Person filter
      if (selectedPerson !== "all" && x[keyField] !== selectedPerson) {
        return false;
      }

      // Method / Reason filter
      if (selectedMethod !== "all") {
        const itemMethod = isPay ? x.mode : x.reason;
        if (itemMethod !== selectedMethod) return false;
      }

      // Search query
      if (!q) return true;

      const pName = getPerson(x[keyField]).name.toLowerCase();
      const targetName = isPay ? getPerson(x.toId).name.toLowerCase() : "";
      const note = (x.note || "").toLowerCase();
      const modeOrReason = (isPay ? x.mode || "" : x.reason || "").toLowerCase();
      const dStr = x.date.toLowerCase();
      const dFmt = fmtDate(x.date).toLowerCase();

      return (
        pName.includes(q) ||
        targetName.includes(q) ||
        note.includes(q) ||
        modeOrReason.includes(q) ||
        dStr.includes(q) ||
        dFmt.includes(q)
      );
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "date_asc") {
        return a.date.localeCompare(b.date) || (a.created || 0) - (b.created || 0);
      }
      if (sortBy === "amount_desc") {
        return (b[display] || 0) - (a[display] || 0);
      }
      if (sortBy === "amount_asc") {
        return (a[display] || 0) - (b[display] || 0);
      }
      // default: date_desc
      return b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0);
    });
  }, [
    allItems,
    keyField,
    selectedPerson,
    selectedMethod,
    searchQuery,
    sortBy,
    display,
    getPerson,
    isPay,
  ]);

  // Group by month
  const monthlyGroups = useMemo(() => {
    const groups = {};
    filteredItems.forEach((x) => {
      const mk = monthKey(x.date);
      if (!groups[mk]) groups[mk] = [];
      groups[mk].push(x);
    });
    return groups;
  }, [filteredItems]);

  const totalFiltered = useMemo(() => {
    return filteredItems.reduce((sum, x) => sum + x[display], 0);
  }, [filteredItems, display]);

  const resetAllFilters = () => {
    triggerHaptic("light");
    setSelectedPerson("all");
    setSelectedMethod("all");
    setSortBy("date_desc");
    setSearchQuery("");
  };

  return (
    <div
      style={{
        padding: "16px 14px 48px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Mobile Search & Filter Toolbar (No background container) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "transparent",
        }}
      >
        {/* Main Search & Filter Icon Button Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Search Input Box */}
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isPay
                  ? "Search repayments, notes, methods..."
                  : "Search borrowings, lenders, reasons..."
              }
              style={{
                width: "100%",
                padding: "10px 36px 10px 38px",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                color: "var(--text-main)",
                outline: "none",
                transition: "all 0.18s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.backgroundColor = "var(--bg-card-solid)";
                e.target.style.boxShadow = "0 0 0 3px var(--accent-light)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-card)";
                e.target.style.backgroundColor = "var(--bg-sunken)";
                e.target.style.boxShadow = "none";
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-dim)",
                  background: "none",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Icon Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setIsFilterSheetOpen(true);
            }}
            style={{
              position: "relative",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                activeFiltersCount > 0 ? "var(--accent-light)" : "var(--bg-card-solid)",
              border:
                activeFiltersCount > 0
                  ? "1.5px solid var(--accent)"
                  : "1px solid var(--border-card)",
              color: activeFiltersCount > 0 ? "var(--accent)" : "var(--text-main)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.18s ease",
            }}
            aria-label="Open filter options"
          >
            <SlidersHorizontal size={18} strokeWidth={activeFiltersCount > 0 ? 2.5 : 2} />

            {/* Active Badge Dot / Count */}
            {activeFiltersCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                  fontSize: "0.625rem",
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                  border: "2px solid var(--bg-app)",
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Applied Filters Dismissible Chips Row (Only visible when active) */}
        {activeFiltersCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflowX: "auto",
              scrollbarWidth: "none",
              padding: "2px 0",
            }}
          >
            {selectedPerson !== "all" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--accent-light)",
                  border: "1px solid var(--accent-glow)",
                  color: "var(--text-main)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <span>{getPerson(selectedPerson).name}</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedPerson("all");
                  }}
                  style={{
                    color: "var(--text-dim)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedMethod !== "all" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--accent-light)",
                  border: "1px solid var(--accent-glow)",
                  color: "var(--text-main)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <span>{selectedMethod}</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedMethod("all");
                  }}
                  style={{
                    color: "var(--text-dim)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {sortBy !== "date_desc" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--accent-light)",
                  border: "1px solid var(--accent-glow)",
                  color: "var(--text-main)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <span>
                  {sortBy === "date_asc"
                    ? "Oldest First"
                    : sortBy === "amount_desc"
                    ? "Highest Amount"
                    : "Lowest Amount"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setSortBy("date_desc");
                  }}
                  style={{
                    color: "var(--text-dim)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              style={{
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                textDecoration: "underline",
                flexShrink: 0,
                padding: "2px 6px",
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Summary Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px",
          fontSize: "0.75rem",
          color: "var(--text-dim)",
        }}
      >
        <span className="num" style={{ fontWeight: 700 }}>
          {filteredItems.length} {isPay ? "repayment" : "disbursement"}
          {filteredItems.length === 1 ? "" : "s"}
        </span>
        <span>
          Total:{" "}
          <strong className="num" style={{ color: isPay ? "var(--success)" : "var(--info)" }}>
            {formatMoney(totalFiltered, currency)}
          </strong>
        </span>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: "36px 20px",
            textAlign: "center",
            borderRadius: "20px",
            color: "var(--text-dim)",
          }}
        >
          <p style={{ fontSize: "0.875rem", marginBottom: "14px" }}>
            No records found matching your filters.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetAllFilters}
            style={{ fontSize: "0.8125rem", margin: "0 auto" }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Month Groups */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.keys(monthlyGroups)
            .sort()
            .reverse()
            .map((mk) => {
              const items = monthlyGroups[mk];
              const monthTotal = items.reduce((s, x) => s + x[display], 0);

              return (
                <div key={mk}>
                  {/* Sticky Month Section Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-dim)",
                      }}
                    >
                      {monthName(mk)}
                    </span>
                    <span
                      className="num"
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                      }}
                    >
                      {formatMoney(monthTotal, currency, { round: true })}
                    </span>
                  </div>

                  {/* Group Container */}
                  <div
                    className="glass-card"
                    style={{
                      borderRadius: "18px",
                      overflow: "hidden",
                      padding: 0,
                    }}
                  >
                    {items.map((x, idx) => {
                      const person = getPerson(x[keyField]);
                      const target = isPay ? getPerson(x.toId) : null;

                      return (
                        <div
                          key={x.id}
                          onClick={() => {
                            triggerHaptic("light");
                            openModal("entry", {
                              type: isPay ? "pay" : "borrow",
                              entry: x,
                            });
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 16px",
                            borderBottom:
                              idx === items.length - 1 ? "none" : "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              minWidth: 0,
                            }}
                          >
                            <Avatar person={person} size="md" />
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "0.9375rem",
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
                                  fontSize: "0.75rem",
                                  color: "var(--text-dim)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {fmtDate(x.date, { day: "numeric", month: "short" })} ·{" "}
                                {isPay
                                  ? `to ${target?.name || "Lender"}${x.mode ? ` (${x.mode})` : ""}`
                                  : `${x.reason || "Borrowing"}${x.note ? ` · ${x.note}` : ""}`}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "12px" }}>
                            <div
                              className="num"
                              style={{
                                fontSize: "1rem",
                                fontWeight: 800,
                                color: isPay ? "var(--success)" : "var(--info)",
                              }}
                            >
                              {isPay ? "−" : "+"}
                              {formatMoney(x[display], currency)}
                            </div>
                            <div
                              className="num"
                              style={{
                                fontSize: "0.6875rem",
                                color: "var(--text-dim)",
                              }}
                            >
                              {formatMoney(x[otherDisplay], otherCurrency)} · {rateFmt(x.rate)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* FILTER BOTTOM SHEET */}
      {isFilterSheetOpen && (
        <BottomSheet
          isOpen={true}
          onClose={() => setIsFilterSheetOpen(false)}
          title={`Filter & Sort ${isPay ? "Repayments" : "Borrowings"}`}
          subtitle="Narrow down entries by person, category, or order"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* 1. FILTER BY PERSON */}
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                {isPay ? "Filter by Contributor" : "Filter by Lender"}
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {/* Everyone option */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedPerson("all");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor:
                      selectedPerson === "all" ? "var(--accent-light)" : "var(--bg-sunken)",
                    border:
                      selectedPerson === "all"
                        ? "1.5px solid var(--accent)"
                        : "1px solid var(--border-subtle)",
                    color: selectedPerson === "all" ? "var(--accent)" : "var(--text-main)",
                    fontWeight: selectedPerson === "all" ? 700 : 500,
                    fontSize: "0.875rem",
                  }}
                >
                  <span>{isPay ? "All Contributors" : "All Lenders"}</span>
                  {selectedPerson === "all" && <Check size={16} strokeWidth={2.5} />}
                </button>

                {personIds.map((pId) => {
                  const person = getPerson(pId);
                  const isSelected = selectedPerson === pId;
                  return (
                    <button
                      key={pId}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setSelectedPerson(pId);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isSelected
                          ? `color-mix(in srgb, ${person.color} 18%, var(--bg-sunken))`
                          : "var(--bg-sunken)",
                        border: isSelected
                          ? `1.5px solid ${person.color}`
                          : "1px solid var(--border-subtle)",
                        color: "var(--text-main)",
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: "0.875rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar person={person} size="sm" />
                        <span>{person.name}</span>
                      </div>
                      {isSelected && (
                        <Check size={16} strokeWidth={2.5} style={{ color: person.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. FILTER BY METHOD / REASON */}
            {availableMethods.length > 0 && (
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-dim)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {isPay ? "Payment Method" : "Purpose / Category"}
                </span>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setSelectedMethod("all");
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      backgroundColor:
                        selectedMethod === "all" ? "var(--accent)" : "var(--bg-sunken)",
                      color: selectedMethod === "all" ? "#fff" : "var(--text-muted)",
                      border: "1px solid var(--border-card)",
                    }}
                  >
                    All
                  </button>
                  {availableMethods.map((m) => {
                    const isSelected = selectedMethod === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          setSelectedMethod(m);
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          backgroundColor: isSelected ? "var(--accent)" : "var(--bg-sunken)",
                          color: isSelected ? "#fff" : "var(--text-muted)",
                          border: isSelected
                            ? "1px solid var(--accent)"
                            : "1px solid var(--border-card)",
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. SORT BY */}
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Sort Order
              </span>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {[
                  { id: "date_desc", label: "Newest First" },
                  { id: "date_asc", label: "Oldest First" },
                  { id: "amount_desc", label: "Highest Amount" },
                  { id: "amount_asc", label: "Lowest Amount" },
                ].map((s) => {
                  const isSelected = sortBy === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setSortBy(s.id);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isSelected ? "var(--accent-light)" : "var(--bg-sunken)",
                        border: isSelected
                          ? "1.5px solid var(--accent)"
                          : "1px solid var(--border-subtle)",
                        color: isSelected ? "var(--accent)" : "var(--text-muted)",
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: "0.8125rem",
                        textAlign: "center",
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                paddingTop: "14px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  resetAllFilters();
                  setIsFilterSheetOpen(false);
                }}
                style={{ flex: 1 }}
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  triggerHaptic("medium");
                  setIsFilterSheetOpen(false);
                }}
                style={{ flex: 2 }}
              >
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
