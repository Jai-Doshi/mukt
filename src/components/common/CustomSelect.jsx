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
  Send,
} from "lucide-react";
import { triggerHaptic } from "../../utils/haptics";
import { FlagIcon } from "./FlagIcon";
import { CURRENCIES } from "../../constants";

// Icon mapping for financial methods
const METHOD_ICONS = {
  "Bank transfer": Landmark,
  "UPI": Smartphone,
  "Remitly Transfer": Send,
  "Remitly": Send,
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
  const menuRef = useRef(null);

  // Normalize options into { value, label, icon }
  const normalizedOptions = options.map((opt) => {
    const rawVal = typeof opt === "string" ? opt : opt.value ?? opt.label;
    const isCurrency = Boolean(CURRENCIES[rawVal]);
    if (typeof opt === "string") {
      return {
        value: opt,
        label: opt,
        icon: isCurrency ? null : (METHOD_ICONS[opt] || null),
        isCurrency,
      };
    }
    return {
      value: opt.value ?? opt.label,
      label: opt.label ?? opt.value,
      icon: opt.icon || (isCurrency ? null : (METHOD_ICONS[opt.value] || null)),
      sublabel: opt.sublabel || null,
      color: opt.color || null,
      isCurrency,
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        (!menuRef.current || !menuRef.current.contains(e.target))
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick, { passive: true });
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
      style={{
        position: "relative",
        width: "100%",
        zIndex: isOpen ? 60 : undefined,
        ...style,
      }}
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
          {selectedOption?.isCurrency ? (
            <FlagIcon code={selectedOption.value} size={20} />
          ) : SelectedIcon ? (
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: selectedOption.color
                  ? `color-mix(in srgb, ${selectedOption.color} 20%, transparent)`
                  : "var(--accent-light)",
                color: selectedOption.color || "var(--accent)",
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
          ref={menuRef}
          role="listbox"
          className="custom-select-menu"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 1050,
            backgroundColor: "var(--bg-card-solid)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.55)",
            padding: "6px",
            maxHeight: "230px",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            animation: "selectMenuFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <style>{`
            @keyframes selectMenuFadeIn {
              from { opacity: 0; transform: translateY(-4px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .custom-select-menu {
              scrollbar-width: thin;
              scrollbar-color: var(--border-strong) transparent;
            }
            .custom-select-menu::-webkit-scrollbar {
              width: 6px;
            }
            .custom-select-menu::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-select-menu::-webkit-scrollbar-thumb {
              background: var(--border-strong);
              border-radius: 9999px;
            }
            .custom-select-menu::-webkit-scrollbar-thumb:hover {
              background: var(--text-dim);
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
                  {opt.isCurrency ? (
                    <FlagIcon code={opt.value} size={18} />
                  ) : OptIcon ? (
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        backgroundColor: isSelected
                          ? (opt.color || "var(--accent)")
                          : opt.color
                          ? `color-mix(in srgb, ${opt.color} 18%, var(--bg-sunken))`
                          : "var(--bg-sunken)",
                        color: isSelected ? "#fff" : (opt.color || "var(--text-dim)"),
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <OptIcon size={14} />
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
