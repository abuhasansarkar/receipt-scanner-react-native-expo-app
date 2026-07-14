import { isSupabaseConfigured, supabase, syncReceiptsUp, supabaseRowToReceipt } from "@/lib/supabase";
import { deleteFile } from "@/lib/utils";
import type { Receipt, ReceiptDraft } from "@/types/receipt";

import { useReceiptStore } from "./store";

export const ReceiptService = {
  list(): Receipt[] {
    return useReceiptStore.getState().receipts;
  },

  get(id: string): Receipt | undefined {
    return useReceiptStore.getState().getReceipt(id);
  },

  create(draft: ReceiptDraft): Receipt {
    return useReceiptStore.getState().addReceipt(draft);
  },

  update(id: string, data: Partial<Receipt>): void {
    useReceiptStore.getState().updateReceipt(id, data);
  },

  remove(id: string): void {
    const receipt = useReceiptStore.getState().getReceipt(id);
    if (receipt?.imageUri) {
      deleteFile(receipt.imageUri).catch(() => {});
    }
    useReceiptStore.getState().removeReceipt(id);
  },

  async syncToCloud(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const receipts = useReceiptStore.getState().receipts;
    if (receipts.length === 0) return;

    try {
      await syncReceiptsUp(receipts);
    } catch (error) {
      console.error("Failed to sync receipts to cloud:", error);
      throw error;
    }
  },

  async syncFromCloud(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    if (!data) return;

    const store = useReceiptStore.getState();
    const localReceipts = store.receipts;
    for (const row of data) {
      const receipt = supabaseRowToReceipt(row as Record<string, unknown>);
      const existing = localReceipts.find((r) => r.id === receipt.id);
      if (!existing || new Date(receipt.updatedAt) > new Date(existing.updatedAt)) {
        store.addOrReplaceReceipt(receipt);
      }
    }
  },
};
