import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { generateId } from "@/lib/utils";

import type { PlanTier, UserProfile } from "./types";

interface AuthState {
  user: UserProfile | null;
  signIn: (profile: { name: string; email: string }) => void;
  signOut: () => void;
  setPlan: (plan: PlanTier) => void;
}

export const useLocalAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (profile) =>
        set({ user: { id: generateId(), plan: "free", ...profile } }),
      signOut: () => set({ user: null }),
      setPlan: (plan) =>
        set((state) => (state.user ? { user: { ...state.user, plan } } : state)),
    }),
    {
      name: "receiptbrain/auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
