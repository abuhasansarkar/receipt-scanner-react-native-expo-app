import { createClient } from "@supabase/supabase-js";

import type { Receipt } from "@/types/receipt";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export async function syncReceiptsUp(receipts: Receipt[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase || receipts.length === 0) return;

  const rows = receipts.map((r) => ({
    id: r.id,
    merchant: r.merchant,
    total: r.total,
    currency: r.currency,
    date: r.date,
    category: r.category,
    status: r.status,
    notes: r.notes ?? null,
    image_uri: r.imageUri ?? null,
    items: JSON.stringify(r.items ?? []),
    confidence: r.confidence ? JSON.stringify(r.confidence) : null,
    is_tax_deductible: r.isTaxDeductible ?? false,
    source: r.source,
    receipt_number: r.receiptNumber ?? null,
    tags: r.tags ? JSON.stringify(r.tags) : null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  }));

  const { error } = await supabase.from("receipts").upsert(rows, {
    onConflict: "id",
  });
  if (error) throw error;
}

export async function syncReceiptsDown(): Promise<Receipt[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(supabaseRowToReceipt);
}

export function supabaseRowToReceipt(row: Record<string, unknown>): Receipt {
  return {
    id: String(row.id),
    merchant: String(row.merchant),
    total: Number(row.total),
    currency: String(row.currency ?? "USD"),
    date: new Date(row.date as string).toISOString(),
    category: String(row.category) as Receipt["category"],
    status: String(row.status ?? "needs_review") as Receipt["status"],
    notes: row.notes ? String(row.notes) : undefined,
    imageUri: row.image_uri ? String(row.image_uri) : undefined,
    items: typeof row.items === "string" ? JSON.parse(row.items) : (row.items ?? []),
    confidence:
      typeof row.confidence === "string"
        ? JSON.parse(row.confidence)
        : (row.confidence as Receipt["confidence"]),
    isTaxDeductible: Boolean(row.is_tax_deductible),
    source: String(row.source ?? "manual") as Receipt["source"],
    receiptNumber: row.receipt_number ? String(row.receipt_number) : undefined,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags as string[] | undefined),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
  };
}
