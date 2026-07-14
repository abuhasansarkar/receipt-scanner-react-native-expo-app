import type { ScanResult, ScanResultItem } from "@/types/api";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY
  ?? process.env.GOOGLE_GEMINI_API_KEY
  ?? "";

const GEMINI_MODEL = "gemini-2.0-flash";

export const isGeminiConfigured = Boolean(API_KEY);

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiCandidate {
  content: {
    parts: GeminiPart[];
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
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

function buildGeminiContents(base64: string, mimeType: string): GeminiPart[] {
  return [
    {
      text:
        "Extract the receipt data from this document. Return ONLY valid JSON matching the schema specified in the system instructions.",
    },
    {
      inlineData: {
        mimeType,
        data: base64,
      },
    },
  ];
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
        throw new Error("Failed to parse Gemini response as JSON");
      }
    } else {
      throw new Error("Failed to parse Gemini response as JSON");
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

async function geminiGenerate(
  parts: GeminiPart[],
  signal?: AbortSignal
): Promise<ScanResult> {
  if (!API_KEY) {
    throw new Error("Google Gemini API key is not configured");
  }

  const res = await fetch(
    `${API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
      signal,
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(text);
      if (parsed.error?.message) {
        const msg = parsed.error.message;
        if (res.status === 429) {
          const retryMatch = msg.match(/Please retry in ([\d.]+)s/);
          const retrySec = retryMatch ? ` Please retry in ${Math.round(parseFloat(retryMatch[1]))}s.` : "";
          throw new Error(`Quota Limit Exceeded (429): You have hit the Gemini API rate limits.${retrySec}`);
        }
        throw new Error(`Gemini scan failed (${res.status}): ${msg}`);
      }
    } catch (e) {
      if (e instanceof Error) throw e;
    }
    throw new Error(`Gemini scan failed (${res.status}): ${text || res.statusText}`);
  }

  const data: GeminiResponse = await res.json();

  if (data.error) {
    throw new Error(
      `Gemini error (${data.error.code}): ${data.error.message}`
    );
  }

  if (data.promptFeedback?.blockReason) {
    throw new Error(
      `Gemini request blocked: ${data.promptFeedback.blockReason}`
    );
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("Gemini returned an empty response");
  }

  return parseScanResult(content);
}

export async function scanReceiptImage(
  base64: string,
  signal?: AbortSignal
): Promise<ScanResult> {
  const parts = buildGeminiContents(base64, "image/jpeg");
  return geminiGenerate(parts, signal);
}

export async function scanReceiptPDF(
  base64: string,
  signal?: AbortSignal
): Promise<ScanResult> {
  const parts = buildGeminiContents(base64, "application/pdf");
  return geminiGenerate(parts, signal);
}
