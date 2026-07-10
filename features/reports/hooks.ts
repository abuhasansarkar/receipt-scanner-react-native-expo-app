import { useMemo } from "react";
import { useReceipts } from "@/features/receipts/hooks";
import { generateCsv, generateTaxReport } from "./service";

export function useCsvExport() {
  const receipts = useReceipts();
  return useMemo(
    () => ({
      generateCsv: (dateRange?: { start: string; end: string }) =>
        generateCsv(receipts, {
          dateRange: dateRange ?? { start: new Date(0).toISOString(), end: new Date().toISOString() },
          includeTaxInfo: false,
          includeImages: false,
          format: "csv",
          groupBy: "category",
        }),
    }),
    [receipts]
  );
}

export function useTaxReport() {
  const receipts = useReceipts();
  return useMemo(() => generateTaxReport(receipts), [receipts]);
}
