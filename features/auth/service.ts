import { isClerkConfigured } from "@/lib/clerk";

import { useLocalAuthStore } from "./store";
import type { PlanTier } from "./types";

export const AuthService = {
  isClerkConfigured() {
    return isClerkConfigured;
  },

  signIn(name: string, email: string): void {
    useLocalAuthStore.getState().signIn({ name, email });
  },

  signOut(): void {
    useLocalAuthStore.getState().signOut();
  },

  setPlan(plan: PlanTier): void {
    useLocalAuthStore.getState().setPlan(plan);
  },
};
