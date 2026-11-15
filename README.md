# Mukt · Education Loan Tracker (React JS)

> **Mukt** (/mʊkt/ · Sanskrit for *free*, *liberated*) tracks your education loan: what you borrowed and from whom, every repayment and who made it, in two currencies with daily real-time exchange rates. Private, offline-first, no account required.

---

## ✨ Improvised UI/UX & New Features

- **Modern Executive FinTech Design**:
  - Bespoke glassmorphism cards with subtle glows and responsive layouts.
  - Dark, Light, and System Auto modes.
  - Customizable theme accent palettes: **Emerald Forest**, **Royal Indigo**, **Ocean Teal**, **Warm Amber**, **Velvet Rose**.
  - Modern tabular typography powered by Plus Jakarta Sans and JetBrains Mono.

- **Dual Currency Intelligence**:
  - Instant conversion between Loan Currency (e.g. INR) and Local Earning Currency (e.g. CAD, USD, EUR, GBP).
  - One-click currency switch toggle in the top bar and sidebar with live updates across all balances, charts, and metrics.
  - Automatic historical exchange rates fetched from European Central Bank (Frankfurter API) for the date of each transaction, plus manual rate overrides.

- **Interactive Payoff Acceleration Simulator**:
  - Explore *"What if I increase monthly repayments by $100 or ₹5,000?"*
  - Live simulation displays new projected loan-free dates, months saved, and debt-free milestones.

- **Comprehensive Financial Dashboards**:
  - **Outstanding Balance Card**: Multi-contributor segmented progress bar and percentage repaid breakdown.
  - **Payoff Card**: Projected debt-free horizon date and cumulative repayment SVG sparkline.
  - **KPI Metrics**: Total borrowed, total repaid, repaid year-to-date, and active exchange rate status.
  - **12-Month Stacked Bar Chart**: Interactive monthly repayment chart with hover tooltips detailing contributions per person.
  - **Stakeholder Contributions**: Repayment share donut/progress bars by contributor.
  - **Lenders Balance Progress**: Track remaining balance owed to each bank and family member.

- **Fast & Flexible Ledgers**:
  - Filterable by contributor or lender, searchable across notes, dates, and payment methods.
  - Monthly group summaries with subtotal calculations.
  - Unified modal with live dual-currency calculator for adding/editing Repayments and Borrowings.

- **Data Privacy & Portability**:
  - All data stays strictly on the user's device (offline-first `localStorage`).
  - Single-click full JSON backup export & restore.
  - Formatted CSV spreadsheet export for Excel and Google Sheets.
  - 1-click rich sample dataset with 13 months of realistic loan activity.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd mukt
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Architecture

```
mukt/
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   ├── privacy.html
│   └── icons/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.jsx
│   │   │   ├── CurrencySwitch.jsx
│   │   │   ├── Sparkline.jsx
│   │   │   └── Toast.jsx
│   │   ├── layout/
│   │   │   ├── BottomNav.jsx
│   │   │   ├── MobileHeader.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── ledger/
│   │   │   ├── BorrowingsView.jsx
│   │   │   └── RepaymentsView.jsx
│   │   ├── modals/
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── EntryModal.jsx
│   │   │   ├── ModalHost.jsx
│   │   │   ├── OnboardingModal.jsx
│   │   │   ├── PayoffSimulatorModal.jsx
│   │   │   ├── PersonModal.jsx
│   │   │   └── RateModal.jsx
│   │   ├── overview/
│   │   │   ├── ContributionsCard.jsx
│   │   │   ├── HeroBalanceCard.jsx
│   │   │   ├── KpiGrid.jsx
│   │   │   ├── LendersCard.jsx
│   │   │   ├── OverviewView.jsx
│   │   │   ├── PayoffCard.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   └── RepaymentsChart.jsx
│   │   └── settings/
│   │       └── SettingsView.jsx
│   ├── constants/
│   │   ├── demoData.js
│   │   └── index.js
│   ├── context/
│   │   └── MuktContext.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```
