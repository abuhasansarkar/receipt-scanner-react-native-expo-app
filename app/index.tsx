import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/features/auth/hooks";
import { useOnboardingStore } from "@/lib/onboarding";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const [hydrated, setHydrated] = useState(useOnboardingStore.persist.hasHydrated());

  useEffect(() => {
    if (useOnboardingStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated || !isLoaded) {
    return (
      <View className="flex-1 bg-surface-base items-center justify-center">
        <ActivityIndicator size="large" color="#4be277" />
      </View>
    );
  }

  const { completed } = useOnboardingStore.getState();

  if (!completed) return <Redirect href="/onboarding" />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)" />;
}
