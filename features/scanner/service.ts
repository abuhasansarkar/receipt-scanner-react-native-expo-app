import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";

import { isOpenRouterConfigured, scanReceiptImage, scanReceiptPDF } from "@/lib/openrouter";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { ScanResult, ScanResultItem } from "@/types/api";
import type { SupportedCurrency } from "@/types/receipt";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export async function prepareReceiptImage(uri: string): Promise<ProcessedImage> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    {
      compress: 0.7,
      format: SaveFormat.JPEG,
      base64: true,
    }
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    base64: result.base64,
  };
}

export async function readFileAsBase64(uri: string): Promise<string> {
  const content = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  return content;
}

export async function extractReceiptData(
  image: ProcessedImage
): Promise<ScanResult> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: image.base64 }),
    });
    if (!res.ok) throw new Error(`Scan failed with status ${res.status}`);
    return res.json() as Promise<ScanResult>;
  }

  if (isOpenRouterConfigured && image.base64) {
    const result = await scanReceiptImage(image.base64);
    await logScan({ ...result, source: "camera", fileType: "image", modelUsed: "openrouter/free" });
    return result;
  }

  return mockExtractReceiptData();
}

export async function extractReceiptDataFromPDF(
  base64: string
): Promise<ScanResult> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf: base64 }),
    });
    if (!res.ok) throw new Error(`Scan failed with status ${res.status}`);
    return res.json() as Promise<ScanResult>;
  }

  if (isOpenRouterConfigured) {
    const result = await scanReceiptPDF(base64);
    await logScan({ ...result, source: "pdf", fileType: "pdf", modelUsed: "openrouter/free" });
    return result;
  }

  return mockExtractReceiptData();
}

async function logScan(data: {
  merchant: string;
  total: number;
  source: string;
  fileType: string;
  modelUsed: string;
}) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from("ScanLog").insert({
      source: data.source,
      fileType: data.fileType,
      modelUsed: data.modelUsed,
      confidence: 0.8,
      success: true,
    });
  } catch {
    // non-critical
  }
}

const MOCK_MERCHANTS: {
  name: string;
  items: ScanResultItem[];
  category: string;
  currency: SupportedCurrency;
}[] = [
  {
    name: "Blue Bottle Coffee",
    items: [
      { name: "Latte", price: 5.75, quantity: 1 },
      { name: "Cold Brew", price: 4.5, quantity: 2 },
      { name: "Avocado Toast", price: 12.0, quantity: 1 },
    ],
    category: "food",
    currency: "USD",
  },
  {
    name: "Uber",
    items: [{ name: "Trip: Downtown to Airport", price: 34.5, quantity: 1 }],
    category: "travel",
    currency: "USD",
  },
  {
    name: "Staples",
    items: [
      { name: "Sticky Notes (pack of 12)", price: 3.99, quantity: 2 },
      { name: "Ballpoint Pens (box)", price: 8.49, quantity: 1 },
      { name: "Printer Paper (ream)", price: 11.99, quantity: 1 },
    ],
    category: "office",
    currency: "USD",
  },
  {
    name: "Whole Foods Market",
    items: [
      { name: "Organic Bananas", price: 2.49, quantity: 1 },
      { name: "Almond Milk", price: 4.99, quantity: 2 },
      { name: "Sourdough Bread", price: 5.99, quantity: 1 },
    ],
    category: "food",
    currency: "USD",
  },
  {
    name: "Adobe Inc.",
    items: [{ name: "Creative Cloud Monthly", price: 54.99, quantity: 1 }],
    category: "software",
    currency: "USD",
  },
  {
    name: "Delta Air Lines",
    items: [
      { name: "Flight JFK-SFO (Economy)", price: 345.0, quantity: 1 },
      { name: "Seat Upgrade", price: 45.0, quantity: 1 },
    ],
    category: "travel",
    currency: "USD",
  },
  {
    name: "Le Petit Café",
    items: [
      { name: "Croissant", price: 3.5, quantity: 2 },
      { name: "Cappuccino", price: 4.25, quantity: 1 },
    ],
    category: "food",
    currency: "EUR",
  },
  {
    name: "Tesco",
    items: [{ name: "Weekly Groceries", price: 62.3, quantity: 1 }],
    category: "food",
    currency: "GBP",
  },
];

function mockExtractReceiptData(): ScanResult {
  const selected =
    MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)];
  const total = selected.items.reduce(
    (sum, item) => sum + item.price * (item.quantity ?? 1),
    0
  );

  return {
    merchant: selected.name,
    total: Math.round(total * 100) / 100,
    currency: selected.currency,
    date: new Date().toISOString(),
    category: selected.category,
    items: selected.items,
    receiptNumber: `RCP-${Date.now().toString(36).toUpperCase()}`,
    confidence: {
      merchant: 0.85,
      total: 0.88,
      date: 0.92,
      category: 0.75,
      currency: 0.95,
      items: 0.7,
    },
  };
}
