import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { useAuth } from "./AuthContext";
import { calculateVariableInterest } from "../utils/interestCalculator";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  fetchFullStateFromSupabase,
  insertPaymentToSupabase,
  updatePaymentInSupabase,
  deletePaymentFromSupabase,
  insertBorrowingToSupabase,
  updateBorrowingInSupabase,
  deleteBorrowingFromSupabase,
  insertPersonToSupabase,
  updatePersonInSupabase,
  deletePersonFromSupabase,
  upsertSettingsInSupabase,
  syncAllToSupabase,
  wipeSupabaseData,
  checkSupabaseHealth,
} from "../services/supabaseService";

const MuktContext = createContext(null);

function freshState() {
  return {
    version: 2,
    people: [{ id: "me", name: "Me", color: COLORS[0] }],
    borrowings: [],
    payments: [],
    interestConfig: {
      enabled: false,
      lenderId: null,
      rates: [
        { id: "rate_init", effectiveDate: todayISO(), rate: 9.5, note: "Current floating rate" },
      ],
      compounding: "simple",
    },
    settings: {
      loanCur: "INR",
      localCur: "CAD",
      display: "loan", // 'loan' or 'local'
      rate: null,
      rateDate: null,
      rateLastFetched: null,
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
  st.settings.rateLastFetched = todayISO();
  st.settings.display = s.settings?.display === "CAD" ? "local" : "loan";
  st.settings.onboarded = true;
  return st;
}

export function dedupePeople(list) {
  if (!Array.isArray(list)) return [{ id: "me", name: "Me", color: COLORS[0] }];
  const seenNames = new Set();
  const seenIds = new Set();
  const res = [];
  list.forEach((p) => {
    if (!p) return;
    const nameKey = (p.id === "me" ? "me" : (p.name || "").trim()).toLowerCase();
    if (!seenNames.has(nameKey) && !seenIds.has(p.id)) {
      seenNames.add(nameKey);
      seenIds.add(p.id);
      res.push(p);
    }
  });
  return res.length > 0 ? res : [{ id: "me", name: "Me", color: COLORS[0] }];
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const d = freshState();
      return {
        version: 2,
        people: dedupePeople(s.people?.length ? s.people : d.people),
        borrowings: s.borrowings || [],
        payments: s.payments || [],
        interestConfig: s.interestConfig || s.settings?.interestConfig || d.interestConfig,
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
    return ["overview", "payments", "borrowed", "settings", "auth"].includes(hash) ? hash : "overview";
  });
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type, data }
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [cloudHealth, setCloudHealth] = useState({
    configured: isSupabaseConfigured,
    ready: false,
    message: isSupabaseConfigured ? "Connecting to Supabase Cloud..." : "Supabase not configured",
  });

  const { user } = useAuth();

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Sync state whenever authenticated user logs in
  useEffect(() => {
    if (!user) return;
    let active = true;

    async function loadUserCloudData() {
      setIsSyncing(true);
      try {
        const remote = await fetchFullStateFromSupabase();
        if (active) {
          const remoteSettings = remote?.settings || {};
          const nextSettings = {
            ...stateRef.current.settings,
            ...remoteSettings,
            onboarded: true, // Logging in guarantees onboarded is true
          };

          const userName = user?.user_metadata?.name || user?.email?.split("@")[0];
          let nextPeople = remote?.people?.length ? dedupePeople(remote.people) : stateRef.current.people;
          if (userName && nextPeople.some((p) => p.id === "me" && (p.name === "Me" || !p.name))) {
            nextPeople = nextPeople.map((p) => (p.id === "me" ? { ...p, name: userName } : p));
          }

          setState((prev) => ({
            ...prev,
            people: dedupePeople(nextPeople),
            borrowings: remote?.borrowings || prev.borrowings,
            payments: remote?.payments || prev.payments,
            interestConfig: remote?.interestConfig || prev.interestConfig,
            settings: nextSettings,
          }));
          setLastSynced(new Date());

          // Persist onboarded: true to Supabase
          upsertSettingsInSupabase(nextSettings).catch((err) => {
            console.warn("Supabase settings sync error:", err);
          });
        }
      } catch (err) {
        console.warn("User data hydration warning:", err);
      } finally {
        if (active) setIsSyncing(false);
      }
    }

    loadUserCloudData();
    return () => {
      active = false;
    };
  }, [user]);

  // Initial check & hydration from Supabase
  useEffect(() => {
    let active = true;

    async function initCloud() {
      if (!isSupabaseConfigured) return;

      try {
        const health = await checkSupabaseHealth();
        if (!active) return;
        setCloudHealth(health);

        if (health.ready) {
          setIsSyncing(true);
          const remote = await fetchFullStateFromSupabase();
          if (!active) return;

          if (remote) {
            const hasRemoteData =
              (remote.borrowings && remote.borrowings.length > 0) ||
              (remote.payments && remote.payments.length > 0) ||
              Boolean(remote.settings?.onboarded);

            const currentState = stateRef.current;
            const hasLocalData =
              currentState.borrowings.length > 0 ||
              currentState.payments.length > 0 ||
              currentState.settings.onboarded;

            if (hasRemoteData) {
              setState((prev) => ({
                ...prev,
                people: remote.people?.length ? dedupePeople(remote.people) : prev.people,
                borrowings: remote.borrowings || [],
                payments: remote.payments || [],
                interestConfig: remote.interestConfig || prev.interestConfig,
                settings: { ...prev.settings, ...(remote.settings || {}) },
              }));
              setLastSynced(new Date());
            } else if (hasLocalData) {
              // Remote tables are empty, sync local data up to Supabase
              await syncAllToSupabase(currentState);
              if (active) setLastSynced(new Date());
            }
          }
        }
      } catch (err) {
        console.warn("Cloud hydration warning:", err);
      } finally {
        if (active) setIsSyncing(false);
      }
    }

    initCloud();

    // Setup Supabase Realtime channel for live updates from other devices/tabs
    let channel = null;
    if (supabase) {
      try {
        channel = supabase
          .channel("mukt-realtime")
          .on("postgres_changes", { event: "*", schema: "public" }, () => {
            fetchFullStateFromSupabase().then((remote) => {
              if (remote && active) {
                setState((prev) => ({
                  ...prev,
                  people: remote.people?.length ? dedupePeople(remote.people) : prev.people,
                  borrowings: remote.borrowings || prev.borrowings,
                  payments: remote.payments || prev.payments,
                  settings: remote.settings ? { ...prev.settings, ...remote.settings } : prev.settings,
                }));
                setLastSynced(new Date());
              }
            });
          })
          .subscribe();
      } catch (err) {
        console.warn("Realtime subscription notice:", err);
      }
    }

    return () => {
      active = false;
      if (channel) {
        supabase?.removeChannel(channel);
      }
    };
  }, []);

  // Sync hash with activeTab
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (["overview", "payments", "borrowed", "settings", "auth"].includes(hash)) {
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

  // Exchange rate fetcher
  const autoFetchedDateRef = useRef(null);

  const refreshRate = useCallback(
    async (customDate = null, silent = false) => {
      const { localCur, loanCur } = state.settings;
      if (localCur === loanCur) {
        setState((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            rate: 1,
            rateDate: todayISO(),
            rateLastFetched: todayISO(),
          },
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
            rateLastFetched: todayISO(),
          },
        }));
        if (!silent) {
          showToast(`Exchange rate updated: 1 ${localCur} = ${r2(res.rate)} ${loanCur}`);
        }
        return res.rate;
      } catch {
        setState((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            rateLastFetched: todayISO(),
          },
        }));
        if (!silent) {
          showToast("Could not fetch latest rate. Try manual rate in Settings.", "error");
        }
        return null;
      } finally {
        setIsFetchingRate(false);
      }
    },
    [state.settings.localCur, state.settings.loanCur, showToast]
  );

  // Auto-fetch rate once per calendar day quietly when onboarded
  useEffect(() => {
    const today = todayISO();
    if (
      state.settings.onboarded &&
      state.settings.rateLastFetched !== today &&
      autoFetchedDateRef.current !== today
    ) {
      autoFetchedDateRef.current = today;
      refreshRate(null, true);
    }
  }, [state.settings.onboarded, state.settings.rateLastFetched, refreshRate]);

  // Comprehensive calculations
  const calc = useMemo(() => {
    const sum = (arr, fn) => arr.reduce((acc, item) => acc + (fn(item) || 0), 0);
    const rate = currentRate;

    // 1. Calculate variable / floating interest for bank loan
    const interest = calculateVariableInterest({
      borrowings: state.borrowings,
      payments: state.payments,
      interestConfig: state.interestConfig,
      today: todayISO(),
      exchangeRate: rate || 1,
    });

    const isInterestEnabled = Boolean(state.interestConfig?.enabled);
    const configuredBankId =
      state.interestConfig?.lenderId && state.interestConfig.lenderId !== "all"
        ? state.interestConfig.lenderId
        : (state.borrowings[0]?.fromId || null);

    // 2. Identify all counterparty stakeholders (excluding "me")
    const candidateIds = new Set([
      ...state.people.filter((p) => p && p.id !== "me").map((p) => p.id),
      ...state.borrowings.map((b) => b.fromId).filter(Boolean),
      ...state.payments.map((p) => p.toId).filter(Boolean),
      ...state.payments.map((p) => p.payerId).filter((id) => id && id !== "me"),
    ]);

    // 3. Build per-lender / stakeholder tracking
    // Handles direct borrowings, floating bank interest, and third-party family assistance (Mom/Dad paying bank)
    const lendersList = [];
    const byLender = {};
    const paidTo = {};

    candidateIds.forEach((id) => {
      const person = state.people.find((p) => p.id === id) || { id, name: id, color: COLORS[1] };
      const isBank = Boolean(isInterestEnabled && configuredBankId === id);

      // Direct borrowings taken from this lender
      const directBorrowings = state.borrowings.filter((b) => b.fromId === id);
      const directBorrowLoan = sum(directBorrowings, (b) => b.loan);
      const directBorrowLocal = sum(directBorrowings, (b) => b.local);

      // Third-party payments: this person paid on user's behalf to someone else (e.g. Dad paying Bank)
      const indirectPayments = state.payments.filter(
        (p) => p.payerId === id && p.toId !== id && p.toId !== "me"
      );
      const indirectPaidLoan = sum(indirectPayments, (p) => p.loan);
      const indirectPaidLocal = sum(indirectPayments, (p) => p.local);

      // Payments made by user ("me") directly to this person
      const repaymentsFromMe = state.payments.filter(
        (p) => p.payerId === "me" && p.toId === id
      );
      const repaidByMeLoan = sum(repaymentsFromMe, (p) => p.loan);
      const repaidByMeLocal = sum(repaymentsFromMe, (p) => p.local);

      // All payments received by this person from all payers (e.g. Bank receiving from Me, Dad, Mom)
      const allPaymentsToThisLender = state.payments.filter((p) => p.toId === id);
      const allPaidToThisLenderLoan = sum(allPaymentsToThisLender, (p) => p.loan);
      const allPaidToThisLenderLocal = sum(allPaymentsToThisLender, (p) => p.local);

      let totalFundedLoan = 0;
      let totalFundedLocal = 0;
      let repaidLoan = 0;
      let repaidLocal = 0;
      let leftLoan = 0;
      let leftLocal = 0;

      if (isBank) {
        // Bank with floating interest
        totalFundedLoan = directBorrowLoan + (interest.totalInterestAccrued || 0);
        totalFundedLocal = rate && rate > 0 ? totalFundedLoan / rate : directBorrowLocal;
        repaidLoan = allPaidToThisLenderLoan;
        repaidLocal = allPaidToThisLenderLocal;
        leftLoan = Math.max(0, interest.totalOutstanding);
        leftLocal = rate && rate > 0 ? leftLoan / rate : 0;
      } else if (indirectPaidLoan > 0) {
        // Third-party sponsor (e.g. Dad/Mom who paid to bank on user's behalf)
        totalFundedLoan = directBorrowLoan + indirectPaidLoan;
        totalFundedLocal = directBorrowLocal + indirectPaidLocal;
        repaidLoan = repaidByMeLoan;
        repaidLocal = repaidByMeLocal;
        leftLoan = Math.max(0, totalFundedLoan - repaidByMeLoan);
        leftLocal = rate && rate > 0 ? leftLoan / rate : Math.max(0, totalFundedLocal - repaidByMeLocal);
      } else {
        // Direct lender without interest or other family lender
        totalFundedLoan = directBorrowLoan;
        totalFundedLocal = directBorrowLocal;
        repaidLoan = allPaidToThisLenderLoan;
        repaidLocal = allPaidToThisLenderLocal;
        leftLoan = Math.max(0, directBorrowLoan - allPaidToThisLenderLoan);
        leftLocal = rate && rate > 0 ? leftLoan / rate : Math.max(0, directBorrowLocal - allPaidToThisLenderLocal);
      }

      const pctRepaid = totalFundedLoan > 0 ? Math.min(100, (repaidLoan / totalFundedLoan) * 100) : 100;
      const isCleared = leftLoan < 1;

      // Populate byLender and paidTo objects for backward compatibility with existing views
      byLender[id] = {
        loan: totalFundedLoan,
        local: totalFundedLocal,
        count: directBorrowings.length + (indirectPaidLoan > 0 ? indirectPayments.length : 0),
      };
      paidTo[id] = {
        loan: repaidLoan,
        local: repaidLocal,
        count: isBank ? allPaymentsToThisLender.length : repaymentsFromMe.length,
      };

      // Only add to active lenders list if there is financial activity
      if (totalFundedLoan > 0 || repaidLoan > 0 || leftLoan > 0 || (isBank && interest.hasData)) {
        lendersList.push({
          id,
          person,
          isBank,
          isCleared,
          b: byLender[id],
          pd: paidTo[id],
          directBorrowLoan,
          indirectPaidLoan,
          interestAccrued: isBank ? (interest.accruedInterest || 0) : 0,
          leftLoan,
          leftLocal,
          pctRepaid,
          pct: pctRepaid,
        });
      }
    });

    // Sort lenders by outstanding balance descending
    lendersList.sort((a, b) => b.leftLoan - a.leftLoan);

    // Sum overall remaining across all lenders (Principal + Accrued Unpaid Interest + Family Debt)
    const remaining = lendersList.reduce((acc, l) => acc + l.leftLoan, 0);
    const remainingLocal = rate && rate > 0 ? remaining / rate : null;

    // Principal Borrowed
    const borrowed = {
      loan: sum(state.borrowings, (b) => b.loan),
      local: sum(state.borrowings, (b) => b.local),
    };

    // Total Obligation (Borrowed Principal + Accrued Interest)
    const totalAccruedInterest = isInterestEnabled ? (interest.totalInterestAccrued || 0) : 0;
    const totalObligationLoan = borrowed.loan + totalAccruedInterest;

    // Repaid
    const paid = {
      loan: sum(state.payments, (p) => p.loan),
      local: sum(state.payments, (p) => p.local),
    };

    // Progress percentage
    const totalCleared = Math.max(0, totalObligationLoan - remaining);
    const pct = totalObligationLoan > 0 ? Math.min(100, Math.max(0, (totalCleared / totalObligationLoan) * 100)) : 0;

    // Loan-Free condition: MUST have true remaining <= 0 AND have had debt
    const isLoanFree = remaining <= 0 && (borrowed.loan > 0 || totalObligationLoan > 0);

    const group = (arr, key) =>
      arr.reduce((m, x) => {
        const g = (m[x[key]] ||= { loan: 0, local: 0, count: 0 });
        g.loan += x.loan;
        g.local += x.local;
        g.count++;
        return m;
      }, {});

    const byPayer = group(state.payments, "payerId");
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

    // Interest breakdown for UI displays
    const interestBreakdown = isInterestEnabled ? {
      accruedInterest: interest.accruedInterest || 0,
      currentPrincipal: interest.currentPrincipal || 0,
      totalInterestAccrued: interest.totalInterestAccrued || 0,
      totalInterestPaid: interest.totalInterestPaid || 0,
      totalPrincipalRemaining: Math.max(0, remaining - (interest.accruedInterest || 0)),
    } : null;

    return {
      borrowed,
      paid,
      remaining,
      remainingLocal,
      totalObligationLoan,
      totalAccruedInterest,
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
      interest,
      interestBreakdown,
      lendersList,
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
      // Async Supabase push
      insertPaymentToSupabase(newPayment);
      setLastSynced(new Date());

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
      // Async Supabase push
      updatePaymentInSupabase(id, updates);
      setLastSynced(new Date());

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
      // Async Supabase delete
      deletePaymentFromSupabase(id);
      setLastSynced(new Date());

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
      // Async Supabase push
      insertBorrowingToSupabase(newBorrowing);
      setLastSynced(new Date());

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
      // Async Supabase push
      updateBorrowingInSupabase(id, updates);
      setLastSynced(new Date());

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
      // Async Supabase delete
      deleteBorrowingFromSupabase(id);
      setLastSynced(new Date());

      showToast("Borrowing deleted", "info");
      closeModal();
    },
    [showToast, closeModal]
  );

  // CRUD for People
  const addPerson = useCallback(
    (name, color) => {
      const clean = (name || "").trim().slice(0, 40);
      if (!clean) return null;
      if (state.people.some((p) => p.name.toLowerCase() === clean.toLowerCase())) {
        showToast(`"${clean}" already exists`, "error");
        return null;
      }
      const newPerson = {
        id: uid(),
        name: clean,
        color: color || COLORS[state.people.length % COLORS.length],
      };
      setState((prev) => ({
        ...prev,
        people: dedupePeople([...prev.people, newPerson]),
      }));
      // Async Supabase push
      insertPersonToSupabase(newPerson);
      setLastSynced(new Date());

      showToast(`Added ${newPerson.name}`);
      return newPerson;
    },
    [state.people, showToast]
  );

  const updatePerson = useCallback(
    (id, updates) => {
      setState((prev) => ({
        ...prev,
        people: prev.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
      // Async Supabase push
      updatePersonInSupabase(id, updates);
      setLastSynced(new Date());

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
      // Async Supabase delete
      deletePersonFromSupabase(id);
      setLastSynced(new Date());

      showToast("Person removed", "info");
      closeModal();
      return true;
    },
    [state.payments, state.borrowings, showToast, closeModal]
  );

  // Atomic onboarding completion
  const completeOnboarding = useCallback(
    ({ userName, loanCur, localCur, stakeholders = [] }) => {
      const cleanUserName = (userName || "").trim().slice(0, 40) || "Me";
      const mePerson = { id: "me", name: cleanUserName, color: COLORS[0] };
      const seenNames = new Set([cleanUserName.toLowerCase(), "me"]);
      const nextPeople = [mePerson];

      stakeholders.forEach((sName) => {
        const clean = (sName || "").trim().slice(0, 40);
        if (clean && !seenNames.has(clean.toLowerCase())) {
          seenNames.add(clean.toLowerCase());
          nextPeople.push({
            id: uid(),
            name: clean,
            color: COLORS[nextPeople.length % COLORS.length],
          });
        }
      });

      const dedupedPeople = dedupePeople(nextPeople);

      setState((prev) => {
        const nextSettings = {
          ...prev.settings,
          loanCur,
          localCur,
          onboarded: true,
          rateLastFetched: todayISO(),
        };
        return {
          ...prev,
          people: dedupedPeople,
          settings: nextSettings,
        };
      });

      // Synchronize with Supabase outside setState updater
      syncAllToSupabase({
        ...stateRef.current,
        people: dedupedPeople,
        settings: {
          ...stateRef.current.settings,
          loanCur,
          localCur,
          onboarded: true,
          rateLastFetched: todayISO(),
        },
      }).then(() => setLastSynced(new Date())).catch((err) => {
        console.warn("Supabase onboarding sync error:", err);
      });

      showToast("Welcome to Mukt! Your loan tracker is ready.");
      triggerConfetti();
      closeModal();
    },
    [showToast, triggerConfetti, closeModal]
  );

  // Settings update
  const updateSettings = useCallback(
    (newSettings, toastMessage = "Settings saved") => {
      setState((prev) => {
        const nextSettings = { ...prev.settings, ...newSettings };
        upsertSettingsInSupabase(nextSettings).then(() => setLastSynced(new Date()));
        return {
          ...prev,
          settings: nextSettings,
        };
      });
      if (toastMessage) {
        showToast(toastMessage);
      }
    },
    [showToast]
  );

  // Interest Rate Configuration & Revisions
  const updateInterestConfig = useCallback(
    (updates) => {
      setState((prev) => {
        const nextConfig = {
          ...(prev.interestConfig || {}),
          ...updates,
        };
        const nextState = {
          ...prev,
          interestConfig: nextConfig,
        };
        syncAllToSupabase(nextState).then(() => setLastSynced(new Date())).catch(() => {});
        return nextState;
      });
      showToast("Interest settings saved");
    },
    [showToast]
  );

  const addInterestRateRevision = useCallback(
    ({ effectiveDate, rate, note }) => {
      setState((prev) => {
        const currentRates = prev.interestConfig?.rates || [];
        const newRate = {
          id: uid(),
          effectiveDate: effectiveDate || todayISO(),
          rate: Number(rate) || 0,
          note: (note || "").trim(),
        };
        const nextRates = [...currentRates, newRate].sort((a, b) =>
          (a.effectiveDate || "").localeCompare(b.effectiveDate || "")
        );
        const nextState = {
          ...prev,
          interestConfig: {
            ...(prev.interestConfig || {}),
            enabled: true,
            rates: nextRates,
          },
        };
        syncAllToSupabase(nextState).then(() => setLastSynced(new Date())).catch(() => {});
        return nextState;
      });
      showToast("Interest rate revision added");
      closeModal();
    },
    [showToast, closeModal]
  );

  const deleteInterestRateRevision = useCallback(
    (id) => {
      let allowed = true;
      setState((prev) => {
        const currentRates = prev.interestConfig?.rates || [];
        if (currentRates.length <= 1) {
          allowed = false;
          return prev;
        }
        const nextRates = currentRates.filter((r) => r.id !== id);
        const nextState = {
          ...prev,
          interestConfig: {
            ...(prev.interestConfig || {}),
            rates: nextRates,
          },
        };
        syncAllToSupabase(nextState).then(() => setLastSynced(new Date())).catch(() => {});
        return nextState;
      });
      if (!allowed) {
        showToast("At least one interest rate entry is required", "error");
      } else {
        showToast("Rate revision removed", "info");
      }
    },
    [showToast]
  );

  const updateInterestRateRevision = useCallback(
    (id, updates) => {
      setState((prev) => {
        const currentRates = prev.interestConfig?.rates || [];
        const nextRates = currentRates
          .map((r) => (r.id === id ? { ...r, ...updates } : r))
          .sort((a, b) => (a.effectiveDate || "").localeCompare(b.effectiveDate || ""));
        const nextState = {
          ...prev,
          interestConfig: {
            ...(prev.interestConfig || {}),
            rates: nextRates,
          },
        };
        syncAllToSupabase(nextState).then(() => setLastSynced(new Date())).catch(() => {});
        return nextState;
      });
      showToast("Rate revision updated");
      closeModal();
    },
    [showToast, closeModal]
  );

  // Load sample demo data
  const loadDemo = useCallback(() => {
    const demo = generateDemoData(state.settings);
    setState(demo);
    syncAllToSupabase(demo).then(() => setLastSynced(new Date()));
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
    wipeSupabaseData().then(() => setLastSynced(new Date()));
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
        const restored = {
          version: 2,
          people: s.people,
          borrowings: s.borrowings,
          payments: s.payments,
          settings: { ...freshState().settings, ...(s.settings || {}), onboarded: true },
        };
        setState(restored);
        syncAllToSupabase(restored).then(() => setLastSynced(new Date()));
        showToast("Backup restored successfully!");
        triggerConfetti();
        closeModal();
      } catch {
        showToast("Invalid backup file. Could not restore.", "error");
      }
    },
    [showToast, triggerConfetti, closeModal]
  );

  // Manual Cloud Sync operations
  const syncToCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllToSupabase(state);
      if (res.success) {
        setLastSynced(new Date());
        showToast("All data synced to Supabase Cloud", "success");
        return true;
      } else {
        showToast(res.error?.message || "Sync failed. Check database tables.", "error");
        return false;
      }
    } catch (err) {
      showToast("Sync failed: " + err.message, "error");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [state, showToast]);

  const fetchFromCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const remote = await fetchFullStateFromSupabase();
      if (remote && (remote.borrowings?.length || remote.payments?.length || remote.people?.length)) {
        setState((prev) => ({
          ...prev,
          people: remote.people?.length ? remote.people : prev.people,
          borrowings: remote.borrowings || [],
          payments: remote.payments || [],
          settings: { ...prev.settings, ...(remote.settings || {}) },
        }));
        setLastSynced(new Date());
        showToast("Loaded latest records from Supabase", "success");
        return true;
      } else {
        showToast("No remote records found in Supabase", "info");
        return false;
      }
    } catch (err) {
      showToast("Could not pull from Supabase: " + err.message, "error");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

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
        updateInterestConfig,
        addInterestRateRevision,
        deleteInterestRateRevision,
        updateInterestRateRevision,
        completeOnboarding,
        loadDemo,
        wipeAll,
        exportJSON,
        exportCSV,
        restoreJSON,
        triggerConfetti,
        // Supabase Cloud Sync
        isSupabaseConfigured,
        isSyncing,
        lastSynced,
        cloudHealth,
        syncToCloud,
        fetchFromCloud,
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
