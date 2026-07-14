import "@/global.css";

import { ClerkProvider } from "@clerk/clerk-expo";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/features/auth/provider";

function RootLayoutInner() {
  return (
    <ThemeProvider value={DarkTheme}>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="receipt/[id]"
            options={{
              headerShown: true,
              title: "Receipt",
              presentation: "modal",
              headerStyle: { backgroundColor: "#0e150e" },
              headerTintColor: "#dce5d9",
            }}
          />
          <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
        </Stack>
      </ErrorBoundary>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootLayoutInner />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
