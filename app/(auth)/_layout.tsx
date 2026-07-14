import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { isClerkConfigured } from "@/lib/clerk";

export default function AuthLayout() {
  if (isClerkConfigured) {
    const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false });
    if (!isLoaded) {
      return (
        <View className="flex-1 items-center justify-center bg-surface-base">
          <ActivityIndicator size="large" color="#4be277" />
        </View>
      );
    }
    if (isSignedIn) return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0e150e" },
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
