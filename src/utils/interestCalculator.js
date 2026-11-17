/**
 * Variable / Floating Interest Rate Calculator for Education Loans
 * Implements Banking Industry Standard: Daily Reducing Balance with Historical Rate Revisions
 */

export function parseDate(iso) {
  if (!iso) return new Date();
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function calculateVariableInterest({
  borrowings = [],
  payments = [],
  interestConfig = {},
  today = null,
  exchangeRate = 1,
}) {
  const todayStr = today || formatISO(new Date());
  const {
    enabled = false,
    lenderId = null,
    rates = [],
    compounding = "simple",
  } = interestConfig || {};

  if (!enabled || !rates || rates.length === 0) {
    return {
      enabled: false,
      hasData: false,
      currentRate: 0,
      currentPrincipal: 0,
      accruedInterest: 0,
      totalOutstanding: 0,
      totalInterestAccrued: 0,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      dailyBurnLoan: 0,
      dailyBurnLocal: 0,
      monthlyBurnLoan: 0,
      interestPaidCurrentFY: 0,
      monthlyTimeline: [],
    };
  }

  // Filter for the specific bank lender if specified
  const targetLenderId = lenderId && lenderId !== "all" ? lenderId : (borrowings[0]?.fromId || null);

  const bankBorrowings = targetLenderId
    ? borrowings.filter((b) => b.fromId === targetLenderId)
    : borrowings;

  const bankPayments = targetLenderId
    ? payments.filter((p) => p.toId === targetLenderId)
    : payments.filter((p) => p.toId !== "me");

  if (bankBorrowings.length === 0) {
    const currentRate = rates[rates.length - 1]?.rate || rates[0]?.rate || 0;
    return {
      enabled: true,
      hasData: false,
      currentRate,
      currentPrincipal: 0,
      accruedInterest: 0,
      totalOutstanding: 0,
      totalInterestAccrued: 0,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      dailyBurnLoan: 0,
      dailyBurnLocal: 0,
      monthlyBurnLoan: 0,
      interestPaidCurrentFY: 0,
      monthlyTimeline: [],
    };
  }

  // Sort rates ascending by effective date
  const sortedRates = [...rates].sort((a, b) =>
    (a.effectiveDate || "").localeCompare(b.effectiveDate || "")
  );

  // Collect starting date
  const allDates = [
    ...bankBorrowings.map((b) => b.date),
    ...sortedRates.map((r) => r.effectiveDate),
  ].filter(Boolean).sort();

  const startDateStr = allDates[0] || todayStr;
  const endDateStr = todayStr;

  // Group events by date
  const eventsByDate = {};
  function addEvent(date, type, item) {
    if (!date) return;
    const cleanDate = String(date).slice(0, 10);
    if (!eventsByDate[cleanDate]) {
      eventsByDate[cleanDate] = { borrowings: [], payments: [], rateChanges: [] };
    }
    eventsByDate[cleanDate][type].push(item);
  }

  bankBorrowings.forEach((b) => addEvent(b.date, "borrowings", b));
  bankPayments.forEach((p) => addEvent(p.date, "payments", p));
  sortedRates.forEach((r) => addEvent(r.effectiveDate, "rateChanges", r));

  let currentPrincipal = 0;
  let accruedInterest = 0;
  let totalInterestAccrued = 0;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  let currentRate = sortedRates[0]?.rate || 0;

  // Track Indian FY interest paid (Apr 1 to Mar 31) for 80E tax deduction
  const todayDate = parseDate(todayStr);
  const currentYear = todayDate.getFullYear();
  const fyStartYear = todayDate.getMonth() >= 3 ? currentYear : currentYear - 1;
  const fyStart = `${fyStartYear}-04-01`;
  const fyEnd = `${fyStartYear + 1}-03-31`;
  let interestPaidCurrentFY = 0;

  // Monthly timeline aggregator
  const monthlyTimeline = {};

  const cur = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  // Day-by-day continuous calculation
  while (cur <= end) {
    const dateStr = formatISO(cur);
    const mKey = dateStr.slice(0, 7);

    if (!monthlyTimeline[mKey]) {
      monthlyTimeline[mKey] = {
        month: mKey,
        startPrincipal: currentPrincipal,
        endPrincipal: currentPrincipal,
        interestAccrued: 0,
        interestPaid: 0,
        principalPaid: 0,
        borrowed: 0,
        rate: currentRate,
      };
    }

    const dayEvents = eventsByDate[dateStr];
    if (dayEvents) {
      // 1. Apply rate changes effective today
      if (dayEvents.rateChanges.length > 0) {
        currentRate = Number(dayEvents.rateChanges[dayEvents.rateChanges.length - 1].rate) || currentRate;
        monthlyTimeline[mKey].rate = currentRate;
      }

      // 2. Apply disbursements
      dayEvents.borrowings.forEach((b) => {
        const amt = Number(b.loan) || 0;
        currentPrincipal += amt;
        monthlyTimeline[mKey].borrowed += amt;
      });

      // 3. Apply payments (Interest serviced first, remainder reduces principal)
      dayEvents.payments.forEach((p) => {
        const payAmt = Number(p.loan) || 0;
        const intPortion = Math.min(accruedInterest, payAmt);
        accruedInterest = Math.max(0, accruedInterest - intPortion);
        totalInterestPaid += intPortion;
        monthlyTimeline[mKey].interestPaid += intPortion;

        if (dateStr >= fyStart && dateStr <= fyEnd) {
          interestPaidCurrentFY += intPortion;
        }

        const prinPortion = Math.max(0, payAmt - intPortion);
        const actualPrinPaid = Math.min(currentPrincipal, prinPortion);
        currentPrincipal = Math.max(0, currentPrincipal - actualPrinPaid);
        totalPrincipalPaid += actualPrinPaid;
        monthlyTimeline[mKey].principalPaid += actualPrinPaid;
      });
    }

    // 4. Daily interest calculation
    if (currentPrincipal > 0 && currentRate > 0) {
      const dailyInterest = (currentPrincipal * currentRate) / (365 * 100);
      accruedInterest += dailyInterest;
      totalInterestAccrued += dailyInterest;
      monthlyTimeline[mKey].interestAccrued += dailyInterest;
    }

    monthlyTimeline[mKey].endPrincipal = currentPrincipal;

    // Advance 1 day
    cur.setDate(cur.getDate() + 1);
  }

  const dailyBurnLoan = currentPrincipal > 0 && currentRate > 0
    ? (currentPrincipal * currentRate) / (365 * 100)
    : 0;

  const validExchangeRate = Number(exchangeRate) > 0 ? Number(exchangeRate) : 1;
  const dailyBurnLocal = dailyBurnLoan / validExchangeRate;

  return {
    enabled: true,
    hasData: true,
    currentRate,
    currentPrincipal: Math.round(currentPrincipal),
    accruedInterest: Math.round(accruedInterest),
    totalOutstanding: Math.round(currentPrincipal + accruedInterest),
    totalInterestAccrued: Math.round(totalInterestAccrued),
    totalInterestPaid: Math.round(totalInterestPaid),
    totalPrincipalPaid: Math.round(totalPrincipalPaid),
    dailyBurnLoan: Math.round(dailyBurnLoan * 100) / 100,
    dailyBurnLocal: Math.round(dailyBurnLocal * 100) / 100,
    monthlyBurnLoan: Math.round(dailyBurnLoan * 30.416),
    interestPaidCurrentFY: Math.round(interestPaidCurrentFY),
    monthlyTimeline: Object.values(monthlyTimeline).reverse(), // newest first
    sortedRates,
  };
}

/**
 * Calculates interest saved and accelerated payoff date with extra monthly repayments
 */
export function simulateInterestPayoff({
  currentPrincipal,
  currentRate,
  baseMonthlyPayment,
  extraMonthlyPayment = 0,
}) {
  if (!(currentPrincipal > 0) || !(currentRate > 0)) {
    return { monthsNormal: 0, monthsExtra: 0, interestSaved: 0, monthsSaved: 0 };
  }

  const monthlyRate = currentRate / (12 * 100);

  function simulate(payment) {
    if (payment <= currentPrincipal * monthlyRate) {
      // Payment does not cover interest!
      return { months: 360, totalInterest: currentPrincipal * monthlyRate * 360 };
    }

    let bal = currentPrincipal;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 360; // 30 years cap

    while (bal > 0 && months < maxMonths) {
      months++;
      const int = bal * monthlyRate;
      totalInterest += int;
      const prin = Math.min(bal, payment - int);
      bal -= prin;
    }

    return { months, totalInterest };
  }

  const normal = simulate(baseMonthlyPayment);
  const accelerated = simulate(baseMonthlyPayment + extraMonthlyPayment);

  const monthsSaved = Math.max(0, normal.months - accelerated.months);
  const interestSaved = Math.max(0, normal.totalInterest - accelerated.totalInterest);

  return {
    monthsNormal: normal.months,
    monthsExtra: accelerated.months,
    monthsSaved,
    interestSaved: Math.round(interestSaved),
  };
}
