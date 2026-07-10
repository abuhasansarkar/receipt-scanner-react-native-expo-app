import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

import { isClerkConfigured } from "@/lib/clerk";

export default function AuthLayout() {
  if (isClerkConfigured) {
    const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false });
    if (!isLoaded) return null;
    if (isSignedIn) return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0b0b0f" },
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
