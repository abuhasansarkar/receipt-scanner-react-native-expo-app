import type { Receipt, ReportConfig } from "@/types/receipt";
import { getCategoryMeta } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export interface ReportRow {
  date: string;
  merchant: string;
  category: string;
  total: number;
  currency: string;
  taxDeductible: boolean;
  status: string;
  notes: string;
}

export function generateCsv(receipts: Receipt[], config: ReportConfig): string {
  const filtered = filterReceipts(receipts, config);
  const rows = filtered.map(toReportRow);

  const headers = ["Date", "Merchant", "Category", "Total", "Currency", "Tax Deductible", "Status", "Notes"];
  const csvRows = [headers.join(",")];

  for (const row of rows) {
    csvRows.push([
      escapeCsv(row.date),
      escapeCsv(row.merchant),
      escapeCsv(row.category),
      row.total.toFixed(2),
      escapeCsv(row.currency),
      row.taxDeductible ? "Yes" : "No",
      escapeCsv(row.status),
      escapeCsv(row.notes),
    ].join(","));
  }

  return csvRows.join("\n");
}

export function generateTaxReport(receipts: Receipt[]): {
  totalDeductible: number;
  byCategory: { category: string; total: number; count: number }[];
  rows: ReportRow[];
} {
  const deductible = receipts.filter((r) => r.isTaxDeductible);
  const rows = deductible.map(toReportRow);
  const totalDeductible = deductible.reduce((sum, r) => sum + r.total, 0);

  const byCategoryMap = new Map<string, { total: number; count: number }>();
  for (const r of deductible) {
    const meta = getCategoryMeta(r.category);
    const entry = byCategoryMap.get(meta.label) ?? { total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    byCategoryMap.set(meta.label, entry);
  }

  return {
    totalDeductible,
    byCategory: Array.from(byCategoryMap.entries()).map(([category, data]) => ({ category, ...data })),
    rows,
  };
}

function filterReceipts(receipts: Receipt[], config: ReportConfig): Receipt[] {
  let filtered = receipts;
  if (config.dateRange) {
    const start = new Date(config.dateRange.start).getTime();
    const end = new Date(config.dateRange.end).getTime();
    filtered = filtered.filter((r) => {
      const t = new Date(r.date).getTime();
      return t >= start && t <= end;
    });
  }
  if (config.includeTaxInfo) {
    filtered = filtered.filter((r) => r.isTaxDeductible);
  }
  return filtered;
}

function toReportRow(receipt: Receipt): ReportRow {
  return {
    date: formatDate(receipt.date),
    merchant: receipt.merchant,
    category: getCategoryMeta(receipt.category).label,
    total: receipt.total,
    currency: receipt.currency,
    taxDeductible: receipt.isTaxDeductible ?? false,
    status: receipt.status,
    notes: receipt.notes ?? "",
  };
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
