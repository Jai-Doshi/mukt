import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  KEY,
  LEGACY_KEY,
  COLORS,
  uid,
  todayISO,
  r2,
  r4,
  fetchExchangeRate,
  monthKey,
} from "../constants";
import { generateDemoData } from "../constants/demoData";
import confetti from "canvas-confetti";

const MuktContext = createContext(null);

function freshState() {
  return {
    version: 2,
    people: [{ id: "me", name: "Me", color: COLORS[0] }],
    borrowings: [],
    payments: [],
    settings: {
      loanCur: "INR",
      localCur: "CAD",
      display: "loan", // 'loan' or 'local'
      rate: null,
      rateDate: null,
      theme: "auto", // 'auto', 'light', 'dark'
      themeAccent: "emerald",
      onboarded: false,
    },
  };
}

function migrateLegacy(s) {
  const conv = (e) => {
    const { inr, cad, currency, ...rest } = e;
    return {
      ...rest,
      loan: inr,
      local: cad,
      entered: currency === "CAD" ? "local" : "loan",
    };
  };
  const st = freshState();
  st.people = s.people && s.people.length ? s.people : st.people;
  st.borrowings = (s.borrowings || []).map(conv);
  st.payments = (s.payments || []).map(conv);
  st.settings.rate = s.settings?.rate || null;
  st.settings.rateDate = s.settings?.rateDate || null;
  st.settings.display = s.settings?.display === "CAD" ? "local" : "loan";
  st.settings.onboarded = true;
  return st;
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const d = freshState();
      return {
        version: 2,
        people: s.people?.length ? s.people : d.people,
        borrowings: s.borrowings || [],
        payments: s.payments || [],
        settings: { ...d.settings, ...(s.settings || {}) },
      };
    }
    const old = localStorage.getItem(LEGACY_KEY);
    if (old) {
      const m = migrateLegacy(JSON.parse(old));
      if (m.borrowings.length || m.payments.length) return m;
    }
  } catch {
    // storage error or parsing failure
  }
  return freshState();
}

export function MuktProvider({ children }) {
  const [state, setState] = useState(loadInitialState);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.slice(1);
    return ["overview", "payments", "borrowed", "settings"].includes(hash) ? hash : "overview";
  });
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type, data }
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  // Sync hash with activeTab
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (["overview", "payments", "borrowed", "settings"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = `#${tab}`;
  };

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      showToast("Storage error: Could not save data locally", "error");
    }
  }, [state]);

  // Apply Theme & Theme Accent
  useEffect(() => {
    const root = document.documentElement;
    const theme = state.settings.theme || "auto";
    const accent = state.settings.themeAccent || "emerald";

    root.setAttribute("data-accent", accent);

    if (theme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [state.settings.theme, state.settings.themeAccent]);

  // Toast system
  const showToast = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Modal system
  const openModal = useCallback((type, data = null) => {
    setModal({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"],
      });
    } catch {
      // fallback if canvas-confetti is not loaded
    }
  }, []);

  // Active rate lookup
  const currentRate = useMemo(() => {
    if (state.settings.rate) return state.settings.rate;
    const all = [...state.payments, ...state.borrowings].sort((a, b) =>
      b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0)
    );
    return all[0]?.rate || null;
  }, [state.settings.rate, state.payments, state.borrowings]);

  // Quiet rate refresh on load
  const refreshRate = useCallback(async (customDate = null) => {
    const { localCur, loanCur } = state.settings;
    if (localCur === loanCur) {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, rate: 1, rateDate: todayISO() },
      }));
      return 1;
    }

    setIsFetchingRate(true);
    try {
      const res = await fetchExchangeRate(localCur, loanCur, customDate);
      setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          rate: r4(res.rate),
          rateDate: res.date || todayISO(),
        },
      }));
      showToast(`Exchange rate updated: 1 ${localCur} = ${r2(res.rate)} ${loanCur}`);
      return res.rate;
    } catch {
      showToast("Could not fetch latest rate. Try manual rate in Settings.", "error");
      return null;
    } finally {
      setIsFetchingRate(false);
    }
  }, [state.settings, showToast]);

  // Auto-fetch rate on initial mount if not updated today
  useEffect(() => {
    if (state.settings.onboarded && state.settings.rateDate !== todayISO()) {
      refreshRate();
    }
  }, [state.settings.onboarded, state.settings.rateDate, refreshRate]);

  // Comprehensive calculations
  const calc = useMemo(() => {
    const sum = (arr, fn) => arr.reduce((acc, item) => acc + (fn(item) || 0), 0);

    const borrowed = {
      loan: sum(state.borrowings, (b) => b.loan),
      local: sum(state.borrowings, (b) => b.local),
    };

    const paid = {
      loan: sum(state.payments, (p) => p.loan),
      local: sum(state.payments, (p) => p.local),
    };

    const remaining = Math.max(0, borrowed.loan - paid.loan);
    const rate = currentRate;
    const remainingLocal = rate && rate > 0 ? remaining / rate : null;
    const pct = borrowed.loan > 0 ? Math.min(100, Math.max(0, (paid.loan / borrowed.loan) * 100)) : 0;
    const isLoanFree = remaining <= 0 && borrowed.loan > 0;

    const group = (arr, key) =>
      arr.reduce((m, x) => {
        const g = (m[x[key]] ||= { loan: 0, local: 0, count: 0 });
        g.loan += x.loan;
        g.local += x.local;
        g.count++;
        return m;
      }, {});

    const byPayer = group(state.payments, "payerId");
    const byLender = group(state.borrowings, "fromId");
    const paidTo = group(state.payments, "toId");
    const byReason = group(
      state.borrowings.map((b) => ({ ...b, reason: b.reason || "Other" })),
      "reason"
    );

    // Payoff forecast from last 6 months' average pace
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsISO = sixMonthsAgo.toISOString().slice(0, 10);

    const recentPaid = sum(
      state.payments.filter((p) => p.date >= sixMonthsISO),
      (p) => p.loan
    );
    const pace = recentPaid / 6;

    let payoff = null;
    if (remaining > 0 && pace > 0) {
      const months = Math.ceil(remaining / pace);
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + months);
      payoff = { date: targetDate, months };
    }

    const currentYear = String(new Date().getFullYear());
    const thisYear = {
      loan: sum(state.payments.filter((p) => p.date.startsWith(currentYear)), (p) => p.loan),
      local: sum(state.payments.filter((p) => p.date.startsWith(currentYear)), (p) => p.local),
    };

    // 12 months chart data
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const chartData = months.map((m) => {
      const byPerson = {};
      state.payments
        .filter((p) => monthKey(p.date) === m)
        .forEach((p) => {
          byPerson[p.payerId] = (byPerson[p.payerId] || 0) + (state.settings.display === "local" ? p.local : p.loan);
        });
      const total = Object.values(byPerson).reduce((a, b) => a + b, 0);
      return { month: m, byPerson, total };
    });

    // Recent activity (latest 8 transactions)
    const recentActivity = [
      ...state.payments.map((x) => ({ ...x, kind: "pay" })),
      ...state.borrowings.map((x) => ({ ...x, kind: "borrow" })),
    ].sort(
      (a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0)
    ).slice(0, 8);

    return {
      borrowed,
      paid,
      remaining,
      remainingLocal,
      rate,
      pct,
      isLoanFree,
      byPayer,
      byLender,
      paidTo,
      byReason,
      pace,
      payoff,
      thisYear,
      chartData,
      recentActivity,
    };
  }, [state, currentRate]);

  // People helpers
  const getPerson = useCallback(
    (id) => state.people.find((p) => p.id === id) || { id, name: "Unknown", color: "#94a3b8" },
    [state.people]
  );

  // Currency toggle
  const toggleDisplayCurrency = useCallback(() => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        display: prev.settings.display === "loan" ? "local" : "loan",
      },
    }));
  }, []);

  const setDisplayCurrency = useCallback((side) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        display: side,
      },
    }));
  }, []);

  // CRUD for Payments
  const addPayment = useCallback(
    (paymentData) => {
      const newPayment = {
        id: uid(),
        created: Date.now(),
        ...paymentData,
      };
      setState((prev) => ({
        ...prev,
        payments: [newPayment, ...prev.payments],
      }));
      showToast("Repayment recorded successfully");
      closeModal();

      // Check if this cleared the loan!
      const totalBorrowed = state.borrowings.reduce((s, b) => s + b.loan, 0);
      const totalPaid = state.payments.reduce((s, p) => s + p.loan, 0) + newPayment.loan;
      if (totalBorrowed > 0 && totalPaid >= totalBorrowed) {
        setTimeout(triggerConfetti, 300);
      }
    },
    [showToast, closeModal, state.borrowings, state.payments, triggerConfetti]
  );

  const updatePayment = useCallback(
    (id, updates) => {
      setState((prev) => ({
        ...prev,
        payments: prev.payments.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
      showToast("Repayment updated");
      closeModal();
    },
    [showToast, closeModal]
  );

  const deletePayment = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        payments: prev.payments.filter((p) => p.id !== id),
      }));
      showToast("Repayment deleted", "info");
      closeModal();
    },
    [showToast, closeModal]
  );

  // CRUD for Borrowings
  const addBorrowing = useCallback(
    (borrowingData) => {
      const newBorrowing = {
        id: uid(),
        created: Date.now(),
        ...borrowingData,
      };
      setState((prev) => ({
        ...prev,
        borrowings: [newBorrowing, ...prev.borrowings],
      }));
      showToast("Borrowing recorded successfully");
      closeModal();
    },
    [showToast, closeModal]
  );

  const updateBorrowing = useCallback(
    (id, updates) => {
      setState((prev) => ({
        ...prev,
        borrowings: prev.borrowings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      }));
      showToast("Borrowing updated");
      closeModal();
    },
    [showToast, closeModal]
  );

  const deleteBorrowing = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        borrowings: prev.borrowings.filter((b) => b.id !== id),
      }));
      showToast("Borrowing deleted", "info");
      closeModal();
    },
    [showToast, closeModal]
  );

  // CRUD for People
  const addPerson = useCallback(
    (name, color) => {
      const newPerson = {
        id: uid(),
        name: name.trim().slice(0, 40),
        color: color || COLORS[state.people.length % COLORS.length],
      };
      setState((prev) => ({
        ...prev,
        people: [...prev.people, newPerson],
      }));
      showToast(`Added ${newPerson.name}`);
      return newPerson;
    },
    [state.people.length, showToast]
  );

  const updatePerson = useCallback(
    (id, updates) => {
      setState((prev) => ({
        ...prev,
        people: prev.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
      showToast("Person updated");
      closeModal();
    },
    [showToast, closeModal]
  );

  const deletePerson = useCallback(
    (id) => {
      const isUsed =
        state.payments.some((p) => p.payerId === id || p.toId === id) ||
        state.borrowings.some((b) => b.fromId === id);
      if (isUsed) {
        showToast("Cannot remove person who has recorded transactions", "error");
        return false;
      }
      setState((prev) => ({
        ...prev,
        people: prev.people.filter((p) => p.id !== id),
      }));
      showToast("Person removed", "info");
      closeModal();
      return true;
    },
    [state.payments, state.borrowings, showToast, closeModal]
  );

  // Settings update
  const updateSettings = useCallback(
    (newSettings) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...newSettings },
      }));
      showToast("Settings saved");
    },
    [showToast]
  );

  // Load sample demo data
  const loadDemo = useCallback(() => {
    const demo = generateDemoData(state.settings);
    setState(demo);
    showToast("Sample loan dataset loaded!");
    triggerConfetti();
  }, [state.settings, showToast, triggerConfetti]);

  // Wipe all data
  const wipeAll = useCallback(() => {
    const fresh = freshState();
    fresh.settings.loanCur = state.settings.loanCur;
    fresh.settings.localCur = state.settings.localCur;
    fresh.settings.theme = state.settings.theme;
    fresh.settings.themeAccent = state.settings.themeAccent;
    fresh.settings.onboarded = false;
    setState(fresh);
    showToast("All data cleared", "info");
  }, [state.settings, showToast]);

  // Export JSON
  const exportJSON = useCallback(() => {
    const jsonStr = JSON.stringify({ app: "mukt", ...state }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mukt-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("JSON backup downloaded");
  }, [state, showToast]);

  // Export CSV
  const exportCSV = useCallback(() => {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const L = state.settings.loanCur;
    const C = state.settings.localCur;

    const rows = [
      ...state.borrowings.map((b) => [
        "Borrowed",
        b.date,
        getPerson(b.fromId).name,
        "",
        b.reason || "Other",
        b.loan,
        b.local,
        b.rate,
        b.note || "",
      ]),
      ...state.payments.map((p) => [
        "Repaid",
        p.date,
        getPerson(p.payerId).name,
        getPerson(p.toId).name,
        p.mode || "—",
        p.loan,
        p.local,
        p.rate,
        p.note || "",
      ]),
    ].sort((a, b) => a[1].localeCompare(b[1]));

    const header = [
      "Type",
      "Date",
      "Person",
      "Paid to",
      "Reason / Method",
      `Amount in ${L}`,
      `Amount in ${C}`,
      `Exchange Rate (${L} per ${C})`,
      "Notes",
    ];

    const csvContent =
      "\uFEFF" +
      [header, ...rows]
        .map((row) => row.map(q).join(","))
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mukt-ledger-${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("CSV ledger exported");
  }, [state, getPerson, showToast]);

  // Restore JSON
  const restoreJSON = useCallback(
    (jsonData) => {
      try {
        let s = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
        if (s.payments?.[0]?.inr || s.borrowings?.[0]?.inr) {
          s = migrateLegacy(s);
        }
        if (!Array.isArray(s.people) || !Array.isArray(s.payments) || !Array.isArray(s.borrowings)) {
          throw new Error("Invalid format");
        }
        setState({
          version: 2,
          people: s.people,
          borrowings: s.borrowings,
          payments: s.payments,
          settings: { ...freshState().settings, ...(s.settings || {}), onboarded: true },
        });
        showToast("Backup restored successfully!");
        triggerConfetti();
        closeModal();
      } catch {
        showToast("Invalid backup file. Could not restore.", "error");
      }
    },
    [showToast, triggerConfetti, closeModal]
  );

  return (
    <MuktContext.Provider
      value={{
        state,
        calc,
        activeTab,
        changeTab,
        toast,
        showToast,
        dismissToast,
        modal,
        openModal,
        closeModal,
        getPerson,
        currentRate,
        isFetchingRate,
        refreshRate,
        toggleDisplayCurrency,
        setDisplayCurrency,
        addPayment,
        updatePayment,
        deletePayment,
        addBorrowing,
        updateBorrowing,
        deleteBorrowing,
        addPerson,
        updatePerson,
        deletePerson,
        updateSettings,
        loadDemo,
        wipeAll,
        exportJSON,
        exportCSV,
        restoreJSON,
        triggerConfetti,
      }}
    >
      {children}
    </MuktContext.Provider>
  );
}

export const useMukt = () => {
  const ctx = useContext(MuktContext);
  if (!ctx) throw new Error("useMukt must be used within a MuktProvider");
  return ctx;
};
