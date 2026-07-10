import { useMemo } from "react";
import { useReceipts } from "@/features/receipts/hooks";
import { computeMonthlyInsights, computeSpendingTrends, computeWeeklyInsights } from "./service";

export function useWeeklyInsights() {
  const receipts = useReceipts();
  return useMemo(() => computeWeeklyInsights(receipts), [receipts]);
}

export function useMonthlyInsights() {
  const receipts = useReceipts();
  return useMemo(() => computeMonthlyInsights(receipts), [receipts]);
}

export function useSpendingTrends() {
  const receipts = useReceipts();
  return useMemo(() => computeSpendingTrends(receipts), [receipts]);
}
