import type { ScanResult, ScanResultItem } from "@/types/api";

export const SCAN_SYSTEM_PROMPT = `You are a receipt OCR assistant. Extract structured data from the receipt image or document and return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{
  "merchant": "store name",
  "total": 12.34,
  "currency": "USD",
  "date": "2024-01-15T00:00:00.000Z",
  "category": "food" | "travel" | "software" | "office" | "utilities" | "entertainment" | "health" | "other",
  "items": [{ "name": "item", "price": 5.00, "quantity": 1 }],
  "receiptNumber": "optional receipt number or null",
  "paymentMethod": "payment method if visible (e.g. 'Visa ending in 1234') or null",
  "confidence": {
    "merchant": 0.95,
    "total": 0.95,
    "date": 0.9,
    "category": 0.8,
    "currency": 0.95,
    "items": 0.85
  }
}

Rules:
- total must equal sum of items (price * quantity)
- currency must be a 3-letter ISO code (USD, EUR, GBP, etc.)
- date should be ISO 8601; if only date is visible use T00:00:00.000Z
- category must be one of the listed values based on merchant/items
- items array must not be empty
- confidence values between 0 and 1 reflecting OCR certainty
- receiptNumber: null if not visible`;

export function parseScanResult(raw: string, source: string): ScanResult {
  const cleaned = raw
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/\s*```/g, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        throw new Error(`Failed to parse ${source} response as JSON`);
      }
    } else {
      throw new Error(`Failed to parse ${source} response as JSON`);
    }
  }

  const items: ScanResultItem[] = Array.isArray(parsed.items)
    ? parsed.items.map((item: Record<string, unknown>) => ({
        name: String(item.name ?? ""),
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      }))
    : [];

  const total =
    Number(parsed.total) ||
    items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);
  const confidenceRaw = parsed.confidence as Record<string, unknown> | undefined;

  return {
    merchant: String(parsed.merchant ?? "Unknown Merchant"),
    total: Math.round(total * 100) / 100,
    currency: String(parsed.currency ?? "USD").toUpperCase(),
    date: String(parsed.date ?? new Date().toISOString()),
    category: String(parsed.category ?? "other"),
    items,
    receiptNumber: parsed.receiptNumber
      ? String(parsed.receiptNumber)
      : undefined,
    paymentMethod: parsed.paymentMethod
      ? String(parsed.paymentMethod)
      : undefined,
    confidence: {
      merchant: Number(confidenceRaw?.merchant) || 0.5,
      total: Number(confidenceRaw?.total) || 0.5,
      date: Number(confidenceRaw?.date) || 0.5,
      category: Number(confidenceRaw?.category) || 0.5,
      currency: Number(confidenceRaw?.currency) || 0.5,
      items: Number(confidenceRaw?.items) || 0.5,
    },
  };
}
