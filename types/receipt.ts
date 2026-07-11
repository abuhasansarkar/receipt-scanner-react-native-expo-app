export type ReceiptCategory =
  | "food" | "travel" | "software" | "office"
  | "utilities" | "entertainment" | "health" | "other";

export type ReceiptSource = "camera" | "gallery" | "manual" | "email" | "pdf";

export type ReceiptStatus = "needs_review" | "verified" | "flagged";

export type SupportedCurrency =
  | "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "INR"
  | "BRL" | "MXN" | "CHF" | "CNY" | "KRW" | "SGD" | "NZD";

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  confidence?: number;
  category?: ReceiptCategory;
}

export interface FieldConfidence {
  merchant?: number;
  total?: number;
  date?: number;
  category?: number;
  currency?: number;
  items?: number;
}

export interface AIFixSuggestion {
  field: keyof FieldConfidence;
  originalValue: string;
  suggestion: string;
  reason: string;
  confidence: number;
}

export interface TaxInfo {
  isDeductible: boolean;
  deductionCategory?: string;
  percentage?: number;
}

export interface MileageEntry {
  id: string;
  date: string;
  distanceKm: number;
  purpose: string;
  startLocation?: string;
  endLocation?: string;
}

export interface Receipt {
  id: string;
  merchant: string;
  total: number;
  currency: string;
  date: string;
  category: ReceiptCategory;
  status: ReceiptStatus;
  notes?: string;
  imageUri?: string;
  paymentMethod?: string;
  items?: ReceiptItem[];
  confidence?: FieldConfidence;
  aiSuggestions?: AIFixSuggestion[];
  isTaxDeductible?: boolean;
  taxInfo?: TaxInfo;
  source: ReceiptSource;
  mileage?: MileageEntry;
  receiptNumber?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ReceiptDraft = Omit<Receipt, "id" | "createdAt" | "updatedAt">;

export interface ReportConfig {
  dateRange: { start: string; end: string };
  includeTaxInfo: boolean;
  includeImages: boolean;
  format: "csv" | "pdf" | "excel";
  groupBy: "category" | "merchant" | "month";
}
