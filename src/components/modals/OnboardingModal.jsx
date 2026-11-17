import React, { useState } from "react";
import { Users, Globe, Flag, Lock, Plus, X, Sparkles, ArrowRight, Check } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { CURRENCIES, COLORS } from "../../constants";
import { Avatar } from "../common/Avatar";
import { CustomSelect } from "../common/CustomSelect";

export function OnboardingModal() {
  const { state, completeOnboarding, loadDemo, closeModal, openModal, changeTab } = useMukt();
  const isMobile = useIsMobile(991);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.people.find((p) => p.id === "me")?.name || "");
  const [loanCur, setLoanCur] = useState(state.settings.loanCur || "INR");
  const [localCur, setLocalCur] = useState(state.settings.localCur || "CAD");
  const [people, setPeople] = useState(["SBI Education Loan", "Mom", "Dad"]);
  const [newPersonName, setNewPersonName] = useState("");
  const [error, setError] = useState("");

  const handleAddPerson = (e) => {
    e.preventDefault();
    const clean = newPersonName.trim();
    if (clean && !people.some((p) => p.toLowerCase() === clean.toLowerCase())) {
      setPeople([...people, clean]);
      setNewPersonName("");
    }
  };

  const handleRemovePerson = (idx) => {
    setPeople(people.filter((_, i) => i !== idx));
  };

  const handleFinish = (useDemo = false) => {
    if (useDemo) {
      loadDemo();
      closeModal();
      return;
    }

    if (loanCur === localCur) {
      setError("Please choose two different currencies (or keep both if strictly single currency).");
    }

    completeOnboarding({
      userName: name,
      loanCur,
      localCur,
      stakeholders: people,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 200,
        display: "grid",
        placeItems: "center",
        padding: "16px",
      }}
    >
      <div
        className="glass-card animate-enter"
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "var(--bg-card-solid)",
          border: "1px solid var(--border-card)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
          padding: "32px",
          position: "relative",
        }}
      >
        {/* Step indicator */}
        {step > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              marginBottom: "20px",
              justifyContent: "center",
            }}
          >
            {[1, 2].map((s) => (
              <span
                key={s}
                style={{
                  height: "4px",
                  width: s === step ? "28px" : "12px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: s <= step ? "var(--accent)" : "var(--border-subtle)",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>
        )}

        {/* STEP 0: WELCOME */}
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "var(--accent)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
                boxShadow: "0 8px 24px var(--accent-glow)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
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

            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              Every rupee of your education loan, accounted for.
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9375rem",
                lineHeight: 1.5,
                marginBottom: "24px",
              }}
            >
              Track what you borrowed, who is paying it back, and know the exact month you will be loan-free.
            </p>

            {/* Value props */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                textAlign: "left",
                marginBottom: "28px",
              }}
            >
              {[
                {
                  icon: Users,
                  title: "Family and bank, together",
                  desc: "Clear visibility on who lent what and who has contributed repayments.",
                },
                {
                  icon: Globe,
                  title: "Two currencies, real historical rates",
                  desc: "Log in either currency with daily rates from European Central Bank.",
                },
                {
                  icon: Flag,
                  title: "Your projected loan-free date",
                  desc: "Pace-based forecast tailored to your actual repayment velocity.",
                },
                {
                  icon: Lock,
                  title: "100% private & offline-ready",
                  desc: "No accounts or servers. Your sensitive financial data never leaves your device.",
                },
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-sunken)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        backgroundColor: "var(--accent-light)",
                        color: "var(--accent)",
                        display: "grid",
                        placeItems: "center",
                        marginTop: "2px",
                      }}
                    >
                      <Icon size={16} />
                    </span>
                    <div>
                      <strong
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-main)",
                          display: "block",
                        }}
                      >
                        {feat.title}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                        {feat.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "13px" }}
                onClick={() => setStep(1)}
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  closeModal();
                  if (isMobile) {
                    changeTab("auth");
                  } else {
                    openModal("auth", { mode: "signin" });
                  }
                }}
                style={{ fontSize: "0.8125rem", color: "var(--accent)", fontWeight: 700 }}
              >
                Already have an account? Sign In
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => handleFinish(true)}
                style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}
              >
                <Sparkles size={14} style={{ color: "var(--accent)" }} />
                <span>Explore with sample demo data</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: CURRENCIES & NAME */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "6px" }}>
              Set up your loan currencies
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "20px" }}>
              Tell Mukt where the loan was issued and where you currently live or earn.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label
                  htmlFor="ob-name"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Your Name
                </label>
                <input
                  id="ob-name"
                  type="text"
                  placeholder="e.g. Rohan"
                  maxLength={40}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="form-input"
                />
              </div>

              <div>
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
                  Loan Currency
                </label>
                <CustomSelect
                  value={loanCur}
                  onChange={setLoanCur}
                  options={Object.entries(CURRENCIES).map(([k, label]) => ({
                    value: k,
                    label: `${k} · ${label}`,
                  }))}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px", display: "block" }}>
                  The currency the loan was borrowed in (e.g. INR)
                </span>
              </div>

              <div>
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
                  Second Currency (Where you earn)
                </label>
                <CustomSelect
                  value={localCur}
                  onChange={setLocalCur}
                  options={Object.entries(CURRENCIES).map(([k, label]) => ({
                    value: k,
                    label: `${k} · ${label}`,
                  }))}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px", display: "block" }}>
                  Where you work or pay back from (e.g. CAD, USD, EUR, GBP)
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={() => setStep(0)} style={{ flex: 1 }}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(2)} style={{ flex: 2 }}>
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STAKEHOLDERS */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "6px" }}>
              Who is involved?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "18px" }}>
              Add the banks, parents, or family who lent money or help make repayments.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "14px",
                maxHeight: "160px",
                overflowY: "auto",
              }}
            >
              {people.map((pName, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    backgroundColor: "var(--bg-sunken)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                  }}
                >
                  <span>{pName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePerson(idx)}
                    style={{
                      color: "var(--text-dim)",
                      display: "grid",
                      placeItems: "center",
                    }}
                    aria-label={`Remove ${pName}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddPerson}
              style={{ display: "flex", gap: "8px", marginBottom: "24px" }}
            >
              <input
                type="text"
                placeholder="Add another person or bank (e.g. Uncle, Axis Bank)"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-secondary">
                <Plus size={15} /> Add
              </button>
            </form>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleFinish(false)}
                style={{ flex: 2 }}
              >
                <span>Finish Setup</span>
                <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
