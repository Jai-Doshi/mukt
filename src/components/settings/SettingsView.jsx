import React, { useRef } from "react";
import {
  Users,
  Palette,
  Globe,
  Database,
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
} from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import {
  CURRENCIES,
  THEME_ACCENTS,
  formatMoney,
  rateFmt,
  fmtDate,
  APP_VERSION,
} from "../../constants";
import { Avatar } from "../common/Avatar";

export function SettingsView() {
  const {
    state,
    calc,
    openModal,
    updateSettings,
    loadDemo,
    wipeAll,
    exportJSON,
    exportCSV,
    restoreJSON,
  } = useMukt();

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
