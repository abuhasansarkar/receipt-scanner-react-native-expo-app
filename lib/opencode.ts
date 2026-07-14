import { parseScanResult, SCAN_SYSTEM_PROMPT } from "@/lib/scan-parser";
import type { ScanResult } from "@/types/api";

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
        { role: "system", content: SCAN_SYSTEM_PROMPT },
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

  return parseScanResult(content, "OpenCode");
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
