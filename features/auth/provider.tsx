import React, { createContext, useContext, ReactNode } from "react";
import { ClerkProvider, useAuth as useClerkAuth, useUser } from "@clerk/clerk-expo";

import { isClerkConfigured, publishableKey, tokenCache } from "@/lib/clerk";

import { useLocalAuthStore } from "./store";
import type { PlanTier, UserProfile } from "./types";

interface AuthContextType {
  user: UserProfile | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  signIn: (profile: { name: string; email: string }) => void;
  signOut: () => Promise<void> | void;
  setPlan: (plan: PlanTier) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function ClerkAuthProviderInner({ children }: { children: ReactNode }) {
  const clerkAuth = useClerkAuth({ treatPendingAsSignedOut: false });
  const { user: clerkUser, isLoaded: clerkUserLoaded } = useUser();
  const localStore = useLocalAuthStore();

  const value: AuthContextType = {
    user: clerkAuth.isSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || "User",
          email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
          imageUrl: clerkUser.imageUrl,
          plan: localStore.user?.plan ?? ("free" as PlanTier),
        }
      : null,
    isSignedIn: clerkAuth.isSignedIn ?? false,
    isLoaded: clerkAuth.isLoaded && clerkUserLoaded,
    signIn: () => {}, // Handled by Clerk UI
    signOut: () => clerkAuth.signOut(),
    setPlan: localStore.setPlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function LocalAuthProviderInner({ children }: { children: ReactNode }) {
  const local = useLocalAuthStore();

  const value: AuthContextType = {
    user: local.user,
    isSignedIn: Boolean(local.user),
    isLoaded: true,
    signIn: local.signIn,
    signOut: local.signOut,
    setPlan: local.setPlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkAuthProviderInner>{children}</ClerkAuthProviderInner>
      </ClerkProvider>
    );
  }

  return <LocalAuthProviderInner>{children}</LocalAuthProviderInner>;
}
