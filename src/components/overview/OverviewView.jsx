import React from "react";
import { Plus, Sparkles, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { HeroBalanceCard } from "./HeroBalanceCard";
import { PayoffCard } from "./PayoffCard";
import { KpiGrid } from "./KpiGrid";
import { RepaymentsChart } from "./RepaymentsChart";
import { ContributionsCard } from "./ContributionsCard";
import { LendersCard } from "./LendersCard";
import { RecentActivity } from "./RecentActivity";
import { InterestBurnBanner } from "./InterestBurnBanner";

export function OverviewView() {
  const { state, openModal, loadDemo, getPerson } = useMukt();
  const hasData = state.borrowings.length > 0 || state.payments.length > 0;
  const me = getPerson("me");

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  return (
    <div className="page-container animate-enter">
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-main)",
            }}
          >
            {getGreeting()}
            {me.name && me.name !== "Me" ? `, ${me.name}` : ""}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-dim)", marginTop: "2px" }}>
            Track what you borrowed, who is paying it back, and when you will be loan-free.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => openModal("entry", { type: "borrow" })}
          >
            <ArrowDownLeft size={16} />
            <span>Add Borrowing</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => openModal("entry", { type: "pay" })}
          >
            <ArrowUpRight size={16} />
            <span>Add Repayment</span>
          </button>
        </div>
      </div>

      {!hasData ? (
        /* Empty Welcome State */
        <div
          className="glass-card"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            maxWidth: "600px",
            margin: "40px auto",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--accent-light)",
              color: "var(--accent)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <ArrowDownLeft size={28} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "8px" }}>
            Let's set up your education loan
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginBottom: "24px", lineHeight: 1.5 }}>
            Add what you borrowed from your bank, parents, or relatives with dates and amounts. Then log repayments as they happen in either currency.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => openModal("entry", { type: "borrow" })}
            >
              <Plus size={16} />
              <span>Add First Borrowing</span>
            </button>
            <button className="btn btn-secondary" onClick={loadDemo}>
              <Sparkles size={16} style={{ color: "var(--accent)" }} />
              <span>Explore With Sample Data</span>
            </button>
          </div>
        </div>
      ) : (
        /* Main Dashboard Grid */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Row: Hero Balance (2/3) + Payoff Projection (1/3) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={{ flex: "2 1 500px" }}>
              <HeroBalanceCard />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <PayoffCard />
            </div>
          </div>

          {/* Floating Interest & Daily Burn Banner */}
          <InterestBurnBanner />

          {/* KPI Metrics Strip */}
          <KpiGrid />

          {/* Middle Row: Monthly Repayments Bar Chart (2/3) + Contributions Donut/List (1/3) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={{ flex: "2 1 500px" }}>
              <RepaymentsChart />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <ContributionsCard />
            </div>
          </div>

          {/* Bottom Row: Balance by Lender (1/2) + Recent Activity (1/2) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <LendersCard />
            </div>
            <div>
              <RecentActivity />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
