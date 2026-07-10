export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const CURRENCY_FORMATS: Record<string, { locale: string; symbol: string }> = {
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "\u20AC" },
  GBP: { locale: "en-GB", symbol: "\u00A3" },
  JPY: { locale: "ja-JP", symbol: "\u00A5" },
  CAD: { locale: "en-CA", symbol: "CA$" },
  AUD: { locale: "en-AU", symbol: "A$" },
  INR: { locale: "en-IN", symbol: "\u20B9" },
  BRL: { locale: "pt-BR", symbol: "R$" },
  MXN: { locale: "es-MX", symbol: "MX$" },
  CHF: { locale: "de-CH", symbol: "CHF" },
  CNY: { locale: "zh-CN", symbol: "\u00A5" },
  KRW: { locale: "ko-KR", symbol: "\u20A9" },
  SGD: { locale: "en-SG", symbol: "S$" },
  NZD: { locale: "en-NZ", symbol: "NZ$" },
};

const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.52, INR: 83.2, BRL: 4.97, MXN: 17.2, CHF: 0.88, CNY: 7.24, KRW: 1320, SGD: 1.34, NZD: 1.63 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5, CAD: 1.48, AUD: 1.65, INR: 90.4, BRL: 5.4, MXN: 18.7, CHF: 0.96, CNY: 7.87, KRW: 1435, SGD: 1.46, NZD: 1.77 },
};

export function formatCurrency(amount: number, currency = "USD"): string {
  const fmt = CURRENCY_FORMATS[currency];
  if (!fmt) return `${currency} ${amount.toFixed(2)}`;
  try {
    return new Intl.NumberFormat(fmt.locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${fmt.symbol}${amount.toFixed(2)}`;
  }
}

export function formatCurrencyShort(amount: number, currency = "USD"): string {
  const fmt = CURRENCY_FORMATS[currency];
  const symbol = fmt?.symbol ?? currency;
  if (Math.abs(amount) >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount, currency);
}

export function convertCurrency(amount: number, from: string, to: string): { amount: number; rate: number } {
  if (from === to) return { amount, rate: 1 };
  const fromRates = EXCHANGE_RATES[from];
  if (!fromRates || !fromRates[to]) return { amount, rate: 1 };
  const rate = fromRates[to];
  return { amount: Math.round(amount * rate * 100) / 100, rate };
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(iso);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isWithinRange(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 1;
  return (current - previous) / previous;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function groupByMonth(receipts: { date: string; total: number }[]): { month: string; total: number; count: number }[] {
  const grouped = new Map<string, { total: number; count: number }>();
  for (const r of receipts) {
    const month = new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const entry = grouped.get(month) ?? { total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    grouped.set(month, entry);
  }
  return Array.from(grouped.entries()).map(([month, data]) => ({ month, ...data }));
}
