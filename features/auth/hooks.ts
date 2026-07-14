import { useContext } from "react";

import { isClerkConfigured } from "@/lib/clerk";

import { AuthContext } from "./provider";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useIsClerkReady() {
  const context = useContext(AuthContext);
  return isClerkConfigured && (context?.isLoaded ?? false);
}
