import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { generateId } from "@/lib/utils";
import type { Receipt, ReceiptDraft } from "@/types/receipt";

interface ReceiptState {
  receipts: Receipt[];
  hasHydrated: boolean;
  addReceipt: (draft: ReceiptDraft) => Receipt;
  updateReceipt: (id: string, data: Partial<Receipt>) => void;
  removeReceipt: (id: string) => void;
  getReceipt: (id: string) => Receipt | undefined;
}

/**
 * Offline-first receipt store. Every mutation is written straight to
 * AsyncStorage via the `persist` middleware, so the app works with zero
 * network connectivity. See `features/receipts/service.ts` for the optional
 * cloud-sync hook.
 */
export const useReceiptStore = create<ReceiptState>()(
  persist(
    (set, get) => ({
      receipts: [],
      hasHydrated: false,

      addReceipt: (draft) => {
        const now = new Date().toISOString();
        const receipt: Receipt = {
          ...draft,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ receipts: [receipt, ...state.receipts] }));
        return receipt;
      },

      updateReceipt: (id, data) =>
        set((state) => ({
          receipts: state.receipts.map((receipt) =>
            receipt.id === id
              ? { ...receipt, ...data, updatedAt: new Date().toISOString() }
              : receipt
          ),
        })),

      removeReceipt: (id) =>
        set((state) => ({
          receipts: state.receipts.filter((receipt) => receipt.id !== id),
        })),

      getReceipt: (id) => get().receipts.find((receipt) => receipt.id === id),
    }),
    {
      name: "receiptbrain/receipts",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ receipts: state.receipts }),
      onRehydrateStorage: () => () => {
        useReceiptStore.setState({ hasHydrated: true });
      },
    }
  )
);
