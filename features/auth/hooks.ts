import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-expo";

import { isClerkConfigured } from "@/lib/clerk";

import { useLocalAuthStore } from "./store";
import type { PlanTier } from "./types";

export function useAuth() {
  const local = useLocalAuthStore();

  const clerkAuth = useClerkAuth({ treatPendingAsSignedOut: false });
  const { user: clerkUser, isLoaded: clerkUserLoaded } = useUser();

  if (isClerkConfigured && clerkAuth.isLoaded && clerkUserLoaded) {
    return {
      user: clerkAuth.isSignedIn && clerkUser
        ? {
            id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || "User",
            email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
            imageUrl: clerkUser.imageUrl,
            plan: "free" as PlanTier,
          }
        : null,
      isSignedIn: clerkAuth.isSignedIn ?? false,
      isLoaded: clerkAuth.isLoaded,
      signIn: () => {},
      signOut: () => clerkAuth.signOut(),
      setPlan: local.setPlan,
    };
  }

  return {
    user: local.user,
    isSignedIn: Boolean(local.user),
    isLoaded: true,
    signIn: local.signIn,
    signOut: local.signOut,
    setPlan: local.setPlan,
  };
}

export function useIsClerkReady() {
  const clerkAuth = useClerkAuth({ treatPendingAsSignedOut: false });
  return isClerkConfigured && clerkAuth.isLoaded;
}
