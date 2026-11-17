import React, { useRef } from "react";
import {
  Users,
  Palette,
  Globe,
  Database,
  Cloud,
  CheckCircle2,
  Download,
  Upload,
  Table,
  Sparkles,
  Trash2,
  Lock,
  ChevronRight,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  LogIn,
  LogOut,
  KeyRound,
  Flame,
  Percent,
  Edit2,
  ShieldCheck,
  Calendar,
  Landmark,
  Building2,
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { useAuth } from "../../context/AuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  CURRENCIES,
  THEME_ACCENTS,
  formatMoney,
  rateFmt,
  fmtDate,
  APP_VERSION,
} from "../../constants";
import { Avatar } from "../common/Avatar";
import { CustomSelect } from "../common/CustomSelect";

export function SettingsView() {
  const isMobile = useIsMobile(991);
  const {
    state,
    calc,
    openModal,
    changeTab,
    updateSettings,
    updateInterestConfig,
    deleteInterestRateRevision,
    loadDemo,
    wipeAll,
    exportJSON,
    exportCSV,
    restoreJSON,
    isSupabaseConfigured,
    isSyncing,
    lastSynced,
    cloudHealth,
    syncToCloud,
    fetchFromCloud,
  } = useMukt();
  const { user, isAuthenticated, signOut } = useAuth();

  const fileInputRef = useRef(null);

  const display = state.settings.display;
  const currency = display === "local" ? state.settings.localCur : state.settings.loanCur;
  const hasData = state.borrowings.length > 0 || state.payments.length > 0;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result;
        openModal("confirm", {
          title: "Restore Backup?",
          description:
            "Restoring this backup will replace current local data with the records from the file.",
          confirmText: "Restore Data",
          isDestructive: false,
          onConfirm: () => restoreJSON(content),
        });
      } catch {
        // error handled in restoreJSON
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page-container animate-enter">
      {/* Hidden file input for restore */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-main)",
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-dim)", marginTop: "2px" }}>
          Customize stakeholders, theme colors, currencies, and manage offline data backups
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: People & Appearance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Stakeholders / People Card */}
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} style={{ color: "var(--accent)" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Stakeholders & People</h3>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openModal("person")}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Plus size={14} /> Add Person
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {state.people.map((p) => {
                const lent = calc.byLender[p.id];
                const paid = calc.byPayer[p.id];
                const usageStr =
                  [
                    lent ? `Lent ${formatMoney(lent[display], currency, { round: true })}` : "",
                    paid ? `Paid ${formatMoney(paid[display], currency, { round: true })}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No transactions yet";

                return (
                  <div
                    key={p.id}
                    onClick={() => openModal("person", { person: p })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-sunken)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-sunken)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Avatar person={p} size="sm" />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{p.name}</span>
                          {p.id === "me" && (
                            <span
                              className="badge badge-accent"
                              style={{ fontSize: "0.625rem", padding: "1px 5px" }}
                            >
                              You
                            </span>
                          )}
                        </div>
                        <span className="num" style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                          {usageStr}
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={16} style={{ color: "var(--text-dim)" }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Appearance & Themes Card */}
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Palette size={18} style={{ color: "var(--accent)" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Appearance & Themes</h3>
            </div>

            {/* Mode Switcher: Auto, Light, Dark */}
            <div style={{ marginBottom: "18px" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Color Mode
              </span>
              <div
                className="seg-control"
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                }}
              >
                {[
                  { id: "auto", label: "Auto", icon: Laptop },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "light", label: "Light", icon: Sun },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = (state.settings.theme || "auto") === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      className={`seg-btn ${isActive ? "active" : ""}`}
                      onClick={() => updateSettings({ theme: mode.id })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px 12px",
                      }}
                    >
                      <Icon size={14} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Accent Swatches */}
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Accent Highlight Color
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {THEME_ACCENTS.map((accent) => {
                  const isSelected = (state.settings.themeAccent || "emerald") === accent.id;
                  return (
                    <button
                      key={accent.id}
                      type="button"
                      onClick={() => updateSettings({ themeAccent: accent.id })}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: isSelected
                          ? `color-mix(in srgb, ${accent.color} 20%, var(--bg-sunken))`
                          : "var(--bg-sunken)",
                        border: isSelected
                          ? `2px solid ${accent.color}`
                          : "1px solid var(--border-card)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: isSelected ? "var(--text-main)" : "var(--text-muted)",
                      }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: accent.color,
                        }}
                      />
                      <span>{accent.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Currencies & Data Management */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Currencies & Exchange Rate Card */}
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Globe size={18} style={{ color: "var(--accent)" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Currencies & Daily Rate</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Loan Currency */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, display: "block" }}>
                    Loan Currency
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    {hasData ? "Locked while entries exist" : "Primary currency of the debt"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="badge badge-accent num" style={{ fontWeight: 800 }}>
                    {state.settings.loanCur}
                  </span>
                  {hasData && <Lock size={14} style={{ color: "var(--text-dim)" }} />}
                </div>
              </div>

              {/* Local Currency */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, display: "block" }}>
                    Second Currency
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    {hasData ? "Locked while entries exist" : "Where you earn or live"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="badge badge-accent num" style={{ fontWeight: 800 }}>
                    {state.settings.localCur}
                  </span>
                  {hasData && <Lock size={14} style={{ color: "var(--text-dim)" }} />}
                </div>
              </div>

              {/* Exchange Rate Row */}
              <div
                onClick={() => openModal("rate")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, display: "block" }}>
                    Conversion Rate
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    {calc.rate
                      ? `${state.settings.loanCur} / 1 ${state.settings.localCur}${
                          state.settings.rateDate
                            ? ` · ${fmtDate(state.settings.rateDate, { day: "numeric", month: "short" })}`
                            : ""
                        }`
                      : "Tap to set rate"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="num" style={{ fontWeight: 800, color: "var(--accent)" }}>
                    {calc.rate ? rateFmt(calc.rate) : "—"}
                  </span>
                  <ChevronRight size={16} style={{ color: "var(--text-dim)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Loan & Floating Interest Card */}
          <div className="glass-card" style={{ padding: "20px 24px", overflow: "visible", position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Flame size={18} style={{ color: "#ef4444" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Bank Loan & Floating Interest</h3>
              </div>

              {/* Toggle Enable/Disable */}
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(state.interestConfig?.enabled)}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    const lenders = state.people.filter((p) => p.id !== "me");
                    const lenderId = state.interestConfig?.lenderId || lenders[0]?.id || null;
                    updateInterestConfig({ enabled, lenderId });
                  }}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: "40px",
                    height: "22px",
                    borderRadius: "12px",
                    backgroundColor: state.interestConfig?.enabled ? "var(--accent)" : "var(--bg-sunken)",
                    border: "1px solid var(--border-card)",
                    position: "relative",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      position: "absolute",
                      top: "2px",
                      left: state.interestConfig?.enabled ? "20px" : "2px",
                      transition: "left 0.2s ease",
                    }}
                  />
                </div>
              </label>
            </div>

            {state.interestConfig?.enabled ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Select Bank Stakeholder */}
                <div style={{ position: "relative", zIndex: 25 }}>
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
                    Associated Bank Lender
                  </label>
                  <CustomSelect
                    value={state.interestConfig?.lenderId || "all"}
                    onChange={(val) => updateInterestConfig({ lenderId: val })}
                    options={[
                      {
                        value: "all",
                        label: "All Lenders / Global",
                        sublabel: "Apply floating interest across total debt",
                        icon: Globe,
                        color: "var(--accent)",
                      },
                      ...state.people
                        .filter((p) => p.id !== "me")
                        .map((p) => {
                          const isBank = /bank|sbi|hdfc|icici|canara|pnb|axis|credila|avanse|incred|loan|nbfc|baroda|kotak/i.test(
                            p.name || ""
                          );
                          return {
                            value: p.id,
                            label: p.name,
                            sublabel: isBank ? "Bank Institution" : "Personal / Family Lender",
                            icon: isBank ? Landmark : Users,
                            color: p.color,
                          };
                        }),
                    ]}
                    placeholder="Select Bank Lender"
                  />
                </div>

                {/* Rates Timeline */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" }}>
                      Floating Rate History
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => openModal("rate-revision")}
                      style={{ fontSize: "0.75rem", color: "var(--accent)", padding: "2px 8px" }}
                    >
                      <Plus size={13} />
                      <span>Add Revision</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {(state.interestConfig?.rates || []).map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          backgroundColor: "var(--bg-sunken)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, color: "var(--accent)" }}>{r.rate}% p.a.</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginLeft: "8px" }}>
                            From {r.effectiveDate}
                          </span>
                          {r.note && (
                            <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", display: "block" }}>
                              {r.note}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            type="button"
                            onClick={() => openModal("rate-revision", { revision: r })}
                            style={{ padding: "4px", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          {(state.interestConfig?.rates?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteInterestRateRevision(r.id)}
                              style={{ padding: "4px", background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View Full Details Button */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openModal("interest")}
                  style={{ width: "100%", padding: "10px", marginTop: "4px" }}
                >
                  <Flame size={15} style={{ color: "#ef4444" }} />
                  <span>View Daily Burn & 80E Statement</span>
                </button>
              </div>
            ) : (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)", lineHeight: 1.5, margin: 0 }}>
                Calculate exact daily reducing interest, track bank rate changes (repo rate/spread revisions), and verify Section 80E tax deductions.
              </p>
            )}
          </div>

          {/* Supabase Cloud Database Card */}
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cloud size={18} style={{ color: "var(--accent)" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Supabase Cloud Database</h3>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: cloudHealth?.ready ? "var(--success-light)" : "var(--accent-light)",
                  color: cloudHealth?.ready ? "var(--success)" : "var(--accent)",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: cloudHealth?.ready ? "var(--success)" : "var(--accent)",
                  }}
                />
                {cloudHealth?.ready ? "Live Cloud Sync" : isSupabaseConfigured ? "Connected" : "Offline"}
              </span>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)", marginBottom: "14px", lineHeight: 1.5 }}>
              Automatic cloud synchronization is enabled with Supabase. Every borrowing, repayment, stakeholder, and setting is backed up in real-time.
            </p>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-sunken)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "14px",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                <span style={{ color: "var(--text-dim)" }}>Database URL:</span>
                <span className="mono" style={{ color: "var(--text-main)", fontWeight: 600, wordBreak: "break-all" }}>
                  https://brfkvgimozqnlbclumvb.supabase.co
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Sync State:</span>
                <span style={{ color: "var(--text-main)" }}>
                  {lastSynced
                    ? `Last synced at ${new Date(lastSynced).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                    : "Real-time sync active"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-dim)" }}>Account:</span>
                {isAuthenticated ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                      {user?.email}
                    </span>
                    <button
                      type="button"
                      onClick={signOut}
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--danger)",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "var(--danger-light)",
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (isMobile) {
                        changeTab("auth");
                      } else {
                        openModal("auth", { mode: "signin" });
                      }
                    }}
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--accent)",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--accent-light)",
                    }}
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={syncToCloud}
                disabled={isSyncing}
                style={{ flex: 1, padding: "9px 14px", fontSize: "0.8125rem" }}
              >
                <RefreshCw size={14} style={{ animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
                <span>{isSyncing ? "Syncing..." : "Push Local Data to Cloud"}</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fetchFromCloud}
                disabled={isSyncing}
                style={{ flex: 1, padding: "9px 14px", fontSize: "0.8125rem" }}
              >
                <Download size={14} />
                <span>Pull from Cloud</span>
              </button>
            </div>
          </div>

          {/* Data Management Card */}
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Database size={18} style={{ color: "var(--accent)" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Data & Backups</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Export Backup JSON */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={exportJSON}
                style={{ justifyContent: "flex-start", padding: "10px 14px", width: "100%" }}
              >
                <Download size={16} style={{ color: "var(--info)" }} />
                <div style={{ textAlign: "left", flex: 1 }}>
                  <span style={{ fontWeight: 700, display: "block" }}>Export Backup JSON</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Save full snapshot to transfer between devices
                  </span>
                </div>
              </button>

              {/* Restore Backup JSON */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ justifyContent: "flex-start", padding: "10px 14px", width: "100%" }}
              >
                <Upload size={16} style={{ color: "var(--accent)" }} />
                <div style={{ textAlign: "left", flex: 1 }}>
                  <span style={{ fontWeight: 700, display: "block" }}>Restore Backup JSON</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Load previous snapshot from JSON file
                  </span>
                </div>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={exportCSV}
                style={{ justifyContent: "flex-start", padding: "10px 14px", width: "100%" }}
              >
                <Table size={16} style={{ color: "var(--success)" }} />
                <div style={{ textAlign: "left", flex: 1 }}>
                  <span style={{ fontWeight: 700, display: "block" }}>Export CSV Spreadsheet</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Open in Excel, Numbers, or Google Sheets
                  </span>
                </div>
              </button>

              {/* Load Sample Demo Data */}
              {!hasData && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={loadDemo}
                  style={{ justifyContent: "flex-start", padding: "10px 14px", width: "100%" }}
                >
                  <Sparkles size={16} style={{ color: "var(--warning)" }} />
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <span style={{ fontWeight: 700, display: "block" }}>Load Sample Data</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                      Experience Mukt populated with a year of loan transactions
                    </span>
                  </div>
                </button>
              )}

              {/* Erase All Data */}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() =>
                  openModal("confirm", {
                    title: "Erase All Data?",
                    description:
                      "Every borrowing, repayment, and person recorded on this device will be permanently cleared. Please export a backup first if needed.",
                    confirmText: "Erase Everything",
                    isDestructive: true,
                    onConfirm: wipeAll,
                  })
                }
                style={{ justifyContent: "flex-start", padding: "10px 14px", width: "100%", marginTop: "8px" }}
              >
                <Trash2 size={16} />
                <div style={{ textAlign: "left", flex: 1 }}>
                  <span style={{ fontWeight: 700, display: "block" }}>Erase All Device Data</span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                    Reset Mukt to factory default state
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          fontSize: "0.8125rem",
          color: "var(--text-dim)",
        }}
      >
        <p>
          Mukt · Version {APP_VERSION} · 100% Private & Offline First · Zero tracking
        </p>
      </div>
    </div>
  );
}
