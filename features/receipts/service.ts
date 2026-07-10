import { isSupabaseConfigured, supabase, syncReceiptsUp } from "@/lib/supabase";
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
  },
};
