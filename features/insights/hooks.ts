import { useMemo } from "react";
import { useReceipts } from "@/features/receipts/hooks";
import { computeMonthlyInsights, computeSpendingTrends, computeWeeklyInsights } from "./service";

export function useAnchorDate(): Date {
  const receipts = useReceipts();
  return useMemo(() => {
    if (receipts.length === 0) return new Date();
    const dates = receipts.map((r) => new Date(r.date).getTime());
    return new Date(Math.max(...dates));
  }, [receipts]);
}

export function useWeeklyInsights() {
  const receipts = useReceipts();
  const anchor = useAnchorDate();
  return useMemo(() => computeWeeklyInsights(receipts, anchor), [receipts, anchor]);
}

export function useMonthlyInsights() {
  const receipts = useReceipts();
  const anchor = useAnchorDate();
  return useMemo(() => computeMonthlyInsights(receipts, anchor), [receipts, anchor]);
}

export function useSpendingTrends() {
  const receipts = useReceipts();
  return useMemo(() => computeSpendingTrends(receipts), [receipts]);
}
