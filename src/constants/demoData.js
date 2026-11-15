import { uid, r2, r4, COLORS } from "./index";

export function generateDemoData(currentSettings) {
  const loanCur = currentSettings?.loanCur || "INR";
  const localCur = currentSettings?.localCur || "CAD";

  const me = { id: "me", name: "Rohan", color: COLORS[0] };
  const bank = { id: uid(), name: "SBI Education Loan", color: COLORS[1] };
  const dad = { id: uid(), name: "Dad", color: COLORS[4] };
  const mom = { id: uid(), name: "Mom", color: COLORS[3] };
  const uncle = { id: uid(), name: "Uncle Rajesh", color: COLORS[2] };

  const people = [me, bank, dad, mom, uncle];

  // Base exchange rate
  let baseRate = 63.5;
  if (loanCur === "INR" && localCur === "USD") baseRate = 86.4;
  else if (loanCur === "INR" && localCur === "GBP") baseRate = 108.2;
  else if (loanCur === "INR" && localCur === "EUR") baseRate = 92.8;
  else if (loanCur === localCur) baseRate = 1;

  const R = (step) => r4(baseRate * (0.97 + step * 0.0022 + ((step * 7) % 5) * 0.0015));

  const now = new Date();
  const y0 = now.getFullYear() - 2;
  const iso = (y, m, d) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);

  const borrowings = [
    {
      id: uid(),
      created: Date.now() - 600 * 86400000,
      date: iso(y0, 6, 12),
      fromId: dad.id,
      entered: "loan",
      loan: 350000,
      local: r2(350000 / R(0)),
      rate: R(0),
      reason: "Visa & travel",
      note: "Flight tickets & consular visa processing",
    },
    {
      id: uid(),
      created: Date.now() - 580 * 86400000,
      date: iso(y0, 7, 24),
      fromId: bank.id,
      entered: "loan",
      loan: 1850000,
      local: r2(1850000 / R(1)),
      rate: R(1),
      reason: "Tuition",
      note: "Semester 1 tuition disbursement",
    },
    {
      id: uid(),
      created: Date.now() - 560 * 86400000,
      date: iso(y0, 8, 5),
      fromId: mom.id,
      entered: "loan",
      loan: 250000,
      local: r2(250000 / R(2)),
      rate: R(2),
      reason: "Living costs",
      note: "Initial security deposit and first 2 months groceries",
    },
    {
      id: uid(),
      created: Date.now() - 500 * 86400000,
      date: iso(y0, 10, 15),
      fromId: uncle.id,
      entered: "loan",
      loan: 150000,
      local: r2(150000 / R(3)),
      rate: R(3),
      reason: "Books & laptop",
      note: "MacBook Pro M-series & engineering course materials",
    },
    {
      id: uid(),
      created: Date.now() - 400 * 86400000,
      date: iso(y0 + 1, 0, 18),
      fromId: bank.id,
      entered: "loan",
      loan: 1400000,
      local: r2(1400000 / R(4)),
      rate: R(4),
      reason: "Tuition",
      note: "Semester 2 tuition fees",
    },
    {
      id: uid(),
      created: Date.now() - 250 * 86400000,
      date: iso(y0 + 1, 11, 28),
      fromId: bank.id,
      entered: "loan",
      loan: 220000,
      local: r2(220000 / R(5)),
      rate: R(5),
      reason: "Interest",
      note: "Simple interest accumulated during moratorium",
    },
  ];

  const payments = [];
  // Last 13 months repayments
  for (let i = 12; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 14);
    const k = 13 - i;
    const r = R(6 + k);

    // Self monthly repayment in local currency
    const selfAmt = 1550 + (k % 4) * 120;
    payments.push({
      id: uid(),
      created: Date.now() - i * 30 * 86400000,
      date: iso(d.getFullYear(), d.getMonth(), 14),
      payerId: me.id,
      toId: bank.id,
      entered: "local",
      local: selfAmt,
      loan: r2(selfAmt * r),
      rate: r,
      mode: "International wire",
      note: `Monthly paycheck transfer · month ${k}`,
    });

    // Occasional co-payment by Dad
    if (k % 3 === 0) {
      payments.push({
        id: uid(),
        created: Date.now() - i * 30 * 86400000 + 100,
        date: iso(d.getFullYear(), d.getMonth(), 6),
        payerId: dad.id,
        toId: bank.id,
        entered: "loan",
        loan: 55000,
        local: r2(55000 / r),
        rate: r,
        mode: "Auto-debit (EMI)",
        note: "Auto-debit EMI from savings account",
      });
    }

    // Occasional co-payment by Mom toward uncle's loan
    if (k % 4 === 1) {
      payments.push({
        id: uid(),
        created: Date.now() - i * 30 * 86400000 + 200,
        date: iso(d.getFullYear(), d.getMonth(), 22),
        payerId: mom.id,
        toId: uncle.id,
        entered: "loan",
        loan: 30000,
        local: r2(30000 / r),
        rate: r,
        mode: "UPI",
        note: "Part repayment to Uncle Rajesh",
      });
    }
  }

  return {
    people,
    borrowings,
    payments,
    settings: {
      ...currentSettings,
      loanCur,
      localCur,
      rate: R(20),
      rateDate: iso(now.getFullYear(), now.getMonth(), now.getDate()),
      onboarded: true,
    },
  };
}
