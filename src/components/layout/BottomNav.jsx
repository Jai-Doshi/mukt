import React from "react";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { triggerHaptic } from "../../utils/haptics";

export function BottomNav() {
  const { activeTab, changeTab, openModal } = useMukt();

  const items = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "payments", label: "Repaid", icon: ArrowUpRight },
    { id: "add", label: "Add", isFab: true },
    { id: "borrowed", label: "Borrowed", icon: ArrowDownLeft },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav
      className="bottom-nav-bar"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))",
        backgroundColor: "rgba(10, 12, 16, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border-card)",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        alignItems: "center",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.4)",
      }}
    >
      <style>{`
        @media (min-width: 992px) {
          .bottom-nav-bar { display: none !important; }
        }
      `}</style>

      {items.map((item) => {
        if (item.isFab) {
          return (
            <div key="add-fab" style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  triggerHaptic("medium");
                  openModal("entry", {
                    type: activeTab === "borrowed" ? "borrow" : "pay",
                  });
                }}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "18px",
                  padding: 0,
                  transform: "translateY(-8px)",
                  boxShadow: "0 8px 24px var(--accent-glow)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                }}
                aria-label="Add transaction"
              >
                <Plus size={24} strokeWidth={2.8} />
              </button>
            </div>
          );
        }

        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              triggerHaptic("light");
              changeTab(item.id);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              height: "100%",
              color: isActive ? "var(--accent)" : "var(--text-dim)",
              transition: "all 0.15s ease",
              position: "relative",
            }}
          >
            {/* Active Pill Indicator on Top */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  width: "20px",
                  height: "3px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--accent)",
                  boxShadow: "0 2px 8px var(--accent-glow)",
                }}
              />
            )}

            <Icon
              size={20}
              style={{
                strokeWidth: isActive ? 2.6 : 1.9,
              }}
            />
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: isActive ? 800 : 500,
                letterSpacing: "-0.01em",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
