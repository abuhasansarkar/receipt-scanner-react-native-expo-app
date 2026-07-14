import { parseScanResult, SCAN_SYSTEM_PROMPT } from "@/lib/scan-parser";
import type { ScanResult } from "@/types/api";

const API_BASE = "https://openrouter.ai/api/v1";

const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY
  ?? process.env.OPENROUTER
  ?? "";

const APP_TITLE = "ReceiptBrain";
const SITE_URL = "https://receiptbrain.app";

export const isOpenRouterConfigured = Boolean(API_KEY);

interface OpenRouterMessageContent {
  type: "text" | "image_url" | "file";
  text?: string;
  image_url?: { url: string };
  file?: { filename: string; file_data: string };
}

interface OpenRouterChoice {
  message: {
    role: string;
    content: string;
  };
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: OpenRouterChoice[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  error?: { code: number; message: string };
}

function buildScanPrompt(base64: string, isPdf: boolean): OpenRouterMessageContent[] {
  const content: OpenRouterMessageContent[] = [
    { type: "text", text: "Extract the receipt data from this document." },
  ];

  if (isPdf) {
    content.push({
      type: "file",
      file: {
        filename: "receipt.pdf",
        file_data: `data:application/pdf;base64,${base64}`,
      },
    });
  } else {
    content.push({
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${base64}` },
    });
  }

  return content;
}

async function openRouterChat(
  messages: OpenRouterMessageContent[],
  signal?: AbortSignal
): Promise<ScanResult> {
  if (!API_KEY) {
    throw new Error("OpenRouter API key is not configured");
  }

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_URL,
      "X-OpenRouter-Title": APP_TITLE,
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [
        { role: "system", content: SCAN_SYSTEM_PROMPT },
        { role: "user", content: messages },
      ],
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter scan failed (${res.status}): ${text}`);
  }

  const data: OpenRouterResponse = await res.json();

  if (data.error) {
    throw new Error(`OpenRouter error (${data.error.code}): ${data.error.message}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  return parseScanResult(content, "OpenRouter");
}

export async function scanReceiptImage(
  base64: string,
  signal?: AbortSignal
): Promise<ScanResult> {
  const messages = buildScanPrompt(base64, false);
  return openRouterChat(messages, signal);
}

export async function scanReceiptPDF(
  base64: string,
  signal?: AbortSignal
): Promise<ScanResult> {
  const messages = buildScanPrompt(base64, true);
  return openRouterChat(messages, signal);
}
