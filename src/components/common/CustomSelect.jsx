import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Landmark,
  Smartphone,
  Globe,
  Clock,
  CreditCard,
  Banknote,
  MoreHorizontal,
  Coins,
} from "lucide-react";
import { triggerHaptic } from "../../utils/haptics";

// Icon mapping for financial methods
const METHOD_ICONS = {
  "Bank transfer": Landmark,
  "UPI": Smartphone,
  "International wire": Globe,
  "Auto-debit (EMI)": Clock,
  "Card": CreditCard,
  "Cash": Banknote,
  "Other": MoreHorizontal,
};

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className = "",
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options into { value, label, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return {
        value: opt,
        label: opt,
        icon: METHOD_ICONS[opt] || null,
      };
    }
    return {
      value: opt.value ?? opt.label,
      label: opt.label ?? opt.value,
      icon: opt.icon || METHOD_ICONS[opt.value] || null,
      sublabel: opt.sublabel || null,
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const SelectedIcon = selectedOption?.icon;

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{ position: "relative", width: "100%", ...style }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic("light");
          setIsOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: "100%",
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          backgroundColor: isOpen ? "var(--bg-card-solid)" : "var(--bg-sunken)",
          border: isOpen ? "1.5px solid var(--accent)" : "1px solid var(--border-card)",
          boxShadow: isOpen ? "0 0 0 3px var(--accent-light)" : "none",
          borderRadius: "var(--radius-md)",
          fontSize: "0.875rem",
          fontWeight: 600,
          color: selectedOption ? "var(--text-main)" : "var(--text-dim)",
          cursor: "pointer",
          transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          {SelectedIcon ? (
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "var(--accent-light)",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <SelectedIcon size={14} />
            </span>
          ) : (
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-card-hover)",
                color: "var(--text-dim)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Coins size={14} />
            </span>
          )}

          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "var(--text-main)",
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Chevron that rotates on open */}
        <ChevronDown
          size={16}
          style={{
            color: "var(--text-dim)",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 1050,
            backgroundColor: "var(--bg-card-solid)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.55)",
            padding: "6px",
            maxHeight: "260px",
            overflowY: "auto",
            animation: "selectMenuFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <style>{`
            @keyframes selectMenuFadeIn {
              from { opacity: 0; transform: translateY(-4px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            const OptIcon = opt.icon;

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  triggerHaptic("light");
                  onChange?.(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  backgroundColor: isSelected
                    ? "var(--accent-light)"
                    : "transparent",
                  color: isSelected ? "var(--accent)" : "var(--text-main)",
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: "0.875rem",
                  transition: "background 0.12s ease",
                  marginBottom: "2px",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  {OptIcon ? (
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "5px",
                        backgroundColor: isSelected
                          ? "var(--accent)"
                          : "var(--bg-sunken)",
                        color: isSelected ? "#fff" : "var(--text-dim)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <OptIcon size={13} />
                    </span>
                  ) : null}

                  <div>
                    <span style={{ display: "block" }}>{opt.label}</span>
                    {opt.sublabel && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                          display: "block",
                        }}
                      >
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    style={{ color: "var(--accent)", flexShrink: 0 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
