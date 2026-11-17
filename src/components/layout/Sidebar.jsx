import React from "react";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Plus,
  TrendingUp,
  Sparkles,
  RefreshCw,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { useAuth } from "../../context/AuthContext";
import { CurrencySwitch } from "../common/CurrencySwitch";
import { rateFmt } from "../../constants";

export function Sidebar() {
  const { activeTab, changeTab, openModal, state, calc, isFetchingRate, refreshRate } = useMukt();
  const { user, isAuthenticated, signOut } = useAuth();
  const { loanCur, localCur } = state.settings;

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "payments",
      label: "Repayments",
      icon: ArrowUpRight,
      badge: state.payments.length ? state.payments.length : null,
    },
    {
      id: "borrowed",
      label: "Borrowings",
      icon: ArrowDownLeft,
      badge: state.borrowings.length ? state.borrowings.length : null,
    },
    {
      id: "simulator",
      label: "Payoff Simulator",
      icon: Sparkles,
      badge: "New",
      isModal: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className="sidebar-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "var(--sidebar-w)",
        backgroundColor: "var(--bg-card-solid)",
        borderRight: "1px solid var(--border-card)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      <style>{`
        @media (max-width: 991px) {
          .sidebar-container { display: none !important; }
        }
      `}</style>

      {/* Brand Header */}
      <div
        style={{
          padding: "24px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "var(--accent)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 14px var(--accent-glow)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
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
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              mukt
            </span>
            <span
              className="badge badge-accent"
              style={{ fontSize: "0.625rem", padding: "1px 6px" }}
            >
              v2.0
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", lineHeight: 1.2 }}>
            Education Loan Tracker
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isModal) {
                  openModal("simulator");
                } else {
                  changeTab(item.id);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--text-main)" : "var(--text-muted)",
                backgroundColor: isActive ? "var(--accent-light)" : "transparent",
                border: isActive ? "1px solid var(--accent-glow)" : "1px solid transparent",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
            >
              <Icon
                size={18}
                style={{
                  color: isActive ? "var(--accent)" : "var(--text-dim)",
                  strokeWidth: isActive ? 2.4 : 2,
                }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: item.isModal
                      ? "var(--accent)"
                      : isActive
                      ? "var(--accent)"
                      : "var(--bg-sunken)",
                    color: item.isModal || isActive ? "#fff" : "var(--text-dim)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Currency Switcher & Add Button */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Currency Switcher Card */}
        {loanCur !== localCur && (
          <div
            style={{
              padding: "12px",
              background: "var(--bg-sunken)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
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
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dim)" }}>
                Display Currency
              </span>
              <button
                onClick={() => refreshRate()}
                disabled={isFetchingRate}
                title="Refresh exchange rate"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "var(--text-dim)",
                  padding: "2px",
                  borderRadius: "4px",
                }}
              >
                <RefreshCw
                  size={12}
                  style={{
                    animation: isFetchingRate ? "spin 1s linear infinite" : "none",
                  }}
                />
              </button>
            </div>
            <CurrencySwitch style={{ width: "100%", justifyContent: "center" }} />
            {calc.rate && (
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--text-dim)",
                  marginTop: "8px",
                  textAlign: "center",
                }}
              >
                1 {localCur} = {rateFmt(calc.rate)} {loanCur}
              </p>
            )}
          </div>
        )}

        {/* Account / Auth Card */}
        <div
          style={{
            padding: "10px 12px",
            background: "var(--bg-sunken)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {isAuthenticated ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(user?.user_metadata?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-main)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.user_metadata?.name || user?.email?.split("@")[0]}
                  </div>
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--text-dim)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={signOut}
                title="Sign Out"
                style={{
                  color: "var(--text-dim)",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openModal("auth", { mode: "signin" })}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                color: "var(--accent)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "4px 0",
              }}
            >
              <LogIn size={14} />
              <span>Sign In / Sync Account</span>
            </button>
          )}
        </div>

        {/* Big Add Button */}
        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "12px 16px" }}
          onClick={() => openModal("entry", { type: activeTab === "borrowed" ? "borrow" : "pay" })}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Entry</span>
        </button>
      </div>
    </aside>
  );
}
