import type { ScanResult, ScanResultItem } from "@/types/api";

const API_BASE = "https://opencode.ai/zen/v1";

const API_KEY = process.env.EXPO_PUBLIC_OPENCODE_API_KEY
  ?? process.env.OPENCODE_API_KEY
  ?? "";

export const isOpencodeConfigured = Boolean(API_KEY);

interface OpencodeMessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

interface OpencodeChoice {
  message: {
    role: string;
    content: string;
  };
}

interface OpencodeResponse {
  id: string;
  model: string;
  choices: OpencodeChoice[];
  error?: { code: number; message: string };
}

const SYSTEM_PROMPT = `You are a receipt OCR assistant. Extract structured data from the receipt image or document and return ONLY valid JSON (no markdown, no code fences) with this exact shape:
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

function buildScanPrompt(base64: string, isPdf: boolean): OpencodeMessageContent[] {
  const mimeType = isPdf ? "application/pdf" : "image/jpeg";
  return [
    { 
      type: "text", 
      text: "Extract the receipt data from this document. Return ONLY valid JSON matching the schema specified in the system instructions." 
    },
    {
      type: "image_url",
      image_url: { url: `data:${mimeType};base64,${base64}` },
    },
  ];
}

async function opencodeChat(
  messages: OpencodeMessageContent[],
  signal?: AbortSignal
): Promise<ScanResult> {
  if (!API_KEY) {
    throw new Error("OpenCode API key is not configured");
  }

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mimo-v2.5-free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: messages },
      ],
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenCode scan failed (${res.status}): ${text}`);
  }

  const data: OpencodeResponse = await res.json();

  if (data.error) {
    throw new Error(`OpenCode error (${data.error.code}): ${data.error.message}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenCode returned an empty response");
  }

  return parseScanResult(content);
}

function parseScanResult(raw: string): ScanResult {
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
        throw new Error("Failed to parse OpenCode response as JSON");
      }
    } else {
      throw new Error("Failed to parse OpenCode response as JSON");
    }
  }

  const items: ScanResultItem[] = Array.isArray(parsed.items)
    ? parsed.items.map((item: Record<string, unknown>) => ({
        name: String(item.name ?? ""),
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      }))
    : [];

  const total = Number(parsed.total) || items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);
  const confidenceRaw = parsed.confidence as Record<string, unknown> | undefined;

  return {
    merchant: String(parsed.merchant ?? "Unknown Merchant"),
    total: Math.round(total * 100) / 100,
    currency: String(parsed.currency ?? "USD").toUpperCase(),
    date: String(parsed.date ?? new Date().toISOString()),
    category: String(parsed.category ?? "other"),
    items,
    receiptNumber: parsed.receiptNumber ? String(parsed.receiptNumber) : undefined,
    paymentMethod: parsed.paymentMethod ? String(parsed.paymentMethod) : undefined,
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

export async function scanReceiptImage(
  base64: string,
  signal?: AbortSignal
): Promise<ScanResult> {
  const messages = buildScanPrompt(base64, false);
  return opencodeChat(messages, signal);
}

export async function scanReceiptPDF(
  base64: string,
  signal?: AbortSignal
): Promise<ScanResult> {
  const messages = buildScanPrompt(base64, true);
  return opencodeChat(messages, signal);
}
