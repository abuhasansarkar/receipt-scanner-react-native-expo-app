import { useMemo } from "react";
import type { Receipt, ReceiptCategory } from "@/types/receipt";
import { useReceiptStore } from "./store";

export function useReceipts(): Receipt[] {
  return useReceiptStore((state) => state.receipts);
}

export function useReceipt(id: string | undefined): Receipt | undefined {
  return useReceiptStore((state) =>
    id ? state.receipts.find((r) => r.id === id) : undefined
  );
}

export function useReceiptActions() {
  const addReceipt = useReceiptStore((state) => state.addReceipt);
  const updateReceipt = useReceiptStore((state) => state.updateReceipt);
  const removeReceipt = useReceiptStore((state) => state.removeReceipt);
  return { addReceipt, updateReceipt, removeReceipt };
}

export function useCategoryTotals(): Map<ReceiptCategory, number> {
  const receipts = useReceipts();
  return useMemo(() => {
    const totals = new Map<ReceiptCategory, number>();
    for (const receipt of receipts) {
      totals.set(receipt.category, (totals.get(receipt.category) ?? 0) + receipt.total);
    }
    return totals;
  }, [receipts]);
}

export function useTotalSpent(): number {
  const receipts = useReceipts();
  return useMemo(() => receipts.reduce((sum, receipt) => sum + receipt.total, 0), [receipts]);
}

export function useTaxDeductibleTotal(): number {
  const receipts = useReceipts();
  return useMemo(
    () => receipts.filter((r) => r.isTaxDeductible).reduce((sum, r) => sum + r.total, 0),
    [receipts]
  );
}

export function useReceiptCountByStatus() {
  const receipts = useReceipts();
  return useMemo(() => {
    const counts = { needs_review: 0, verified: 0, flagged: 0 };
    for (const r of receipts) {
      if (counts[r.status] !== undefined) counts[r.status]++;
    }
    return counts;
  }, [receipts]);
}
