import { parseScanResult, SCAN_SYSTEM_PROMPT } from "@/lib/scan-parser";
import type { ScanResult } from "@/types/api";

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

async function geminiGenerate(
  parts: GeminiPart[],
  signal?: AbortSignal
): Promise<ScanResult> {
  if (!API_KEY) {
    throw new Error("Google Gemini API key is not configured");
  }

  const res = await fetch(
    `${API_BASE}/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SCAN_SYSTEM_PROMPT }],
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

  return parseScanResult(content, "Gemini");
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
