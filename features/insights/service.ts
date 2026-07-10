import { addDays, isWithinRange, percentChange, startOfMonth, startOfWeek, endOfMonth } from "@/lib/utils";
import type { Receipt, ReceiptCategory } from "@/types/receipt";

export interface CategoryBreakdown {
  category: ReceiptCategory;
  total: number;
  percentage: number;
  count: number;
}

export interface WeeklyInsights {
  weekTotal: number;
  previousWeekTotal: number;
  changeVsLastWeek: number;
  topCategory: ReceiptCategory | null;
  categoryBreakdown: CategoryBreakdown[];
  alerts: string[];
}

export interface MonthlyInsights {
  monthTotal: number;
  previousMonthTotal: number;
  changeVsLastMonth: number;
  dailyAverage: number;
  projectedTotal: number;
  topCategory: ReceiptCategory | null;
  categoryBreakdown: CategoryBreakdown[];
  alerts: string[];
}

export interface SpendingTrend {
  month: string;
  total: number;
  count: number;
}

export function computeWeeklyInsights(receipts: Receipt[], now: Date = new Date()): WeeklyInsights {
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const previousWeekStart = addDays(weekStart, -7);

  const thisWeek = receipts.filter((r) => isWithinRange(r.date, weekStart, weekEnd));
  const lastWeek = receipts.filter((r) => isWithinRange(r.date, previousWeekStart, weekStart));

  const weekTotal = sumTotals(thisWeek);
  const previousWeekTotal = sumTotals(lastWeek);
  const changeVsLastWeek = percentChange(weekTotal, previousWeekTotal);

  const categoryBreakdown = buildCategoryBreakdown(thisWeek, weekTotal);
  const topCategory = categoryBreakdown[0]?.category ?? null;

  const alerts = buildAlerts(thisWeek, lastWeek, weekTotal, previousWeekTotal, categoryBreakdown);

  return { weekTotal, previousWeekTotal, changeVsLastWeek, topCategory, categoryBreakdown, alerts };
}

export function computeMonthlyInsights(receipts: Receipt[], now: Date = new Date()): MonthlyInsights {
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(addDays(monthStart, -1));
  const prevMonthEnd = endOfMonth(prevMonthStart);

  const thisMonth = receipts.filter((r) => isWithinRange(r.date, monthStart, monthEnd));
  const lastMonth = receipts.filter((r) => isWithinRange(r.date, prevMonthStart, prevMonthEnd));

  const monthTotal = sumTotals(thisMonth);
  const previousMonthTotal = sumTotals(lastMonth);
  const changeVsLastMonth = percentChange(monthTotal, previousMonthTotal);

  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - monthStart.getTime()) / 86_400_000));
  const daysInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / 86_400_000);
  const dailyAverage = monthTotal / daysElapsed;
  const projectedTotal = dailyAverage * daysInMonth;

  const categoryBreakdown = buildCategoryBreakdown(thisMonth, monthTotal);
  const topCategory = categoryBreakdown[0]?.category ?? null;

  const alerts = buildAlerts(thisMonth, lastMonth, monthTotal, previousMonthTotal, categoryBreakdown);

  return {
    monthTotal, previousMonthTotal, changeVsLastMonth,
    dailyAverage, projectedTotal, topCategory, categoryBreakdown, alerts,
  };
}

export function computeSpendingTrends(receipts: Receipt[]): SpendingTrend[] {
  const grouped = new Map<string, { total: number; count: number }>();
  for (const r of receipts) {
    const month = new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const entry = grouped.get(month) ?? { total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    grouped.set(month, entry);
  }
  return Array.from(grouped.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const [aM, aY] = a.month.split(" ");
      const [bM, bY] = b.month.split(" ");
      return parseInt(aY) - parseInt(bY) || months.indexOf(aM) - months.indexOf(bM);
    });
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sumTotals(receipts: Receipt[]): number {
  return receipts.reduce((sum, receipt) => sum + receipt.total, 0);
}

function buildCategoryBreakdown(receipts: Receipt[], total: number): CategoryBreakdown[] {
  const totals = new Map<ReceiptCategory, { total: number; count: number }>();
  for (const receipt of receipts) {
    const entry = totals.get(receipt.category) ?? { total: 0, count: 0 };
    entry.total += receipt.total;
    entry.count += 1;
    totals.set(receipt.category, entry);
  }
  return Array.from(totals.entries())
    .map(([category, { total: catTotal, count }]) => ({
      category, total: catTotal,
      percentage: total ? catTotal / total : 0, count,
    }))
    .sort((a, b) => b.total - a.total);
}

function buildAlerts(
  current: Receipt[], previous: Receipt[],
  currentTotal: number, previousTotal: number,
  breakdown: CategoryBreakdown[]
): string[] {
  const alerts: string[] = [];

  if (previousTotal > 0) {
    const change = percentChange(currentTotal, previousTotal);
    if (change > 0.3) {
      alerts.push(`Spending surged ${Math.round(change * 100)}% — ${Math.round(currentTotal - previousTotal)} more than last period.`);
    } else if (change < -0.3) {
      alerts.push(`Great job! Spending dropped ${Math.round(Math.abs(change) * 100)}% vs last period.`);
    }
  }

  if (breakdown[0] && breakdown[0].percentage > 0.4) {
    alerts.push(`${Math.round(breakdown[0].percentage * 100)}% of spending went to ${breakdown[0].category}.`);
  }

  for (const merchant of findDuplicateMerchants(current)) {
    alerts.push(`Duplicate: two ${merchant} receipts for the same amount within 24h.`);
  }

  const subscriptions = current.filter((r) =>
    r.category === "software" && r.items?.some((i) =>
      /monthly|annual|subscription|pro|premium/i.test(i.name)
    )
  );
  if (subscriptions.length > 2) {
    const subTotal = sumTotals(subscriptions);
    alerts.push(`${subscriptions.length} subscription payments totaling ${subTotal.toFixed(2)} detected.`);
  }

  return alerts;
}

function findDuplicateMerchants(receipts: Receipt[]): string[] {
  const seen: { merchant: string; total: number; date: number }[] = [];
  const duplicates: string[] = [];
  for (const receipt of receipts) {
    const date = new Date(receipt.date).getTime();
    const isDuplicate = seen.some(
      (entry) =>
        entry.merchant === receipt.merchant &&
        entry.total === receipt.total &&
        Math.abs(entry.date - date) < 24 * 60 * 60 * 1000
    );
    if (isDuplicate) duplicates.push(receipt.merchant);
    seen.push({ merchant: receipt.merchant, total: receipt.total, date });
  }
  return duplicates;
}
