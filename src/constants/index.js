export const APP_VERSION = "2.0.0";
export const KEY = "mukt-v2";
export const LEGACY_KEY = "rin-ledger-v1";

export const COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
  "#e11d48", // Rose
  "#64748b", // Slate
];

export const THEME_ACCENTS = [
  { id: "emerald", name: "Emerald Forest", color: "#10b981" },
  { id: "indigo", name: "Royal Indigo", color: "#6366f1" },
  { id: "teal", name: "Ocean Teal", color: "#0d9488" },
  { id: "amber", name: "Warm Amber", color: "#f59e0b" },
  { id: "rose", name: "Velvet Rose", color: "#f43f5e" },
];

export const REASONS = [
  "Tuition",
  "Living costs",
  "Rent",
  "Visa & travel",
  "Books & laptop",
  "Insurance",
  "Interest",
  "Other",
];

export const MODES = [
  "Bank transfer",
  "UPI",
  "International wire",
  "Auto-debit (EMI)",
  "Card",
  "Cash",
  "Other",
];

export const CURRENCIES = {
  INR: "Indian rupee",
  CAD: "Canadian dollar",
  USD: "US dollar",
  GBP: "British pound",
  EUR: "Euro",
  AUD: "Australian dollar",
  NZD: "New Zealand dollar",
  SGD: "Singapore dollar",
  HKD: "Hong Kong dollar",
  JPY: "Japanese yen",
  CNY: "Chinese yuan",
  KRW: "South Korean won",
  CHF: "Swiss franc",
  SEK: "Swedish krona",
  NOK: "Norwegian krone",
  DKK: "Danish krone",
  PLN: "Polish zloty",
  CZK: "Czech koruna",
  HUF: "Hungarian forint",
  RON: "Romanian leu",
  BGN: "Bulgarian lev",
  TRY: "Turkish lira",
  ILS: "Israeli shekel",
  ZAR: "South African rand",
  BRL: "Brazilian real",
  MXN: "Mexican peso",
  MYR: "Malaysian ringgit",
  THB: "Thai baht",
  IDR: "Indonesian rupiah",
  PHP: "Philippine peso",
  ISK: "Icelandic krona",
};

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const r4 = (n) => Math.round((Number(n) || 0) * 10000) / 10000;

export const localeFor = (curr) => (curr === "INR" ? "en-IN" : "en-US");
export const zeroDec = (curr) => ["JPY", "KRW", "IDR", "HUF", "ISK"].includes(curr);

const fmtCache = {};
export function formatMoney(n, curr, opts = {}) {
  const c = curr || "INR";
  const num = Number(n) || 0;
  const dec = zeroDec(c) ? 0 : opts.round ? 0 : 2;
  const key = `${c}_${dec}_${opts.round ? "r" : ""}`;

  if (!fmtCache[key]) {
    fmtCache[key] = new Intl.NumberFormat(localeFor(c), {
      style: "currency",
      currency: c,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: opts.round ? 0 : Math.min(dec, 2),
      maximumFractionDigits: dec,
    });
  }

  let s = fmtCache[key].format(Math.abs(num));
  if (c !== "INR" && c !== "USD" && /^\$/.test(s)) {
    s = c.slice(0, 2) + s; // CA$, AU$, NZ$, SG$, HK$
  }
  return (num < 0 ? "−" : "") + s;
}

export function formatCompact(n, curr) {
  const c = curr || "INR";
  const num = Number(n) || 0;
  const a = Math.abs(num);
  const sym = formatMoney(0, c, { round: true }).replace(/[\d.,\s]/g, "");

  if (c === "INR") {
    if (a >= 1e7) return sym + (num / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Cr";
    if (a >= 1e5) return sym + (num / 1e5).toFixed(2).replace(/\.?0+$/, "") + " L";
  }
  if (a >= 1e9) return sym + (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (a >= 1e6) return sym + (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (a >= 1e3) return sym + (num / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "k";

  return sym + Math.round(num).toLocaleString(localeFor(c));
}

export const rateFmt = (r) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(Number(r) || 0);

export const fmtDate = (iso, opts = { day: "numeric", month: "short", year: "numeric" }) => {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", opts);
  } catch {
    return iso;
  }
};

export const monthKey = (iso) => (iso ? iso.slice(0, 7) : "");
export const monthName = (key, long = true) => {
  if (!key) return "";
  try {
    return new Date(key + "-01T00:00:00").toLocaleDateString("en-GB", {
      month: long ? "long" : "short",
      year: "numeric",
    });
  } catch {
    return key;
  }
};

export const initials = (name = "") =>
  (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2) || "?"
  ).toUpperCase();

const rateCache = {};
export async function fetchExchangeRate(fromCur, toCur, date) {
  if (fromCur === toCur) return { rate: 1, date: date || todayISO() };
  const d = !date || date >= todayISO() ? "latest" : date;
  const k = `${fromCur}_${toCur}_${d}`;
  if (rateCache[k]) return rateCache[k];

  const urls = [
    `https://api.frankfurter.dev/v1/${d}?base=${fromCur}&symbols=${toCur}`,
    `https://api.frankfurter.app/${d}?from=${fromCur}&to=${toCur}`,
  ];

  for (const u of urls) {
    try {
      const ctl = new AbortController();
      const tm = setTimeout(() => ctl.abort(), 6500);
      const res = await fetch(u, { signal: ctl.signal });
      clearTimeout(tm);
      if (!res.ok) continue;
      const j = await res.json();
      const v = j?.rates?.[toCur];
      if (v) {
        rateCache[k] = { rate: v, date: j.date };
        return rateCache[k];
      }
    } catch {
      // try next mirror
    }
  }
  throw new Error("Exchange rate unavailable");
}
