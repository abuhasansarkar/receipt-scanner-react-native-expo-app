import "@/global.css";

import { ClerkProvider } from "@clerk/clerk-expo";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useColorScheme as useReactNativeColorScheme } from "react-native";
import { useColorScheme } from "nativewind";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/features/auth/provider";
import { useSettingsStore } from "@/features/settings/store";
import { NotificationService } from "@/features/notifications/service";

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0e150e",
    card: "#1a221a",
    text: "#dce5d9",
    border: "#3d4a3d",
    primary: "#4be277",
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f8fafc",
    card: "#ffffff",
    text: "#0f172a",
    border: "#e2e8f0",
    primary: "#22c55e",
  },
};

function RootLayoutInner() {
  const { themeMode, hasHydrated } = useSettingsStore();
  const systemScheme = useReactNativeColorScheme();
  const { setColorScheme } = useColorScheme();

  const isDark = themeMode === "system"
    ? systemScheme === "dark"
    : themeMode === "dark";

  // Synchronize NativeWind Theme
  React.useEffect(() => {
    if (hasHydrated) {
      setColorScheme(isDark ? "dark" : "light");
    }
  }, [isDark, hasHydrated]);

  // Initialize Notification Listeners
  React.useEffect(() => {
    const cleanup = NotificationService.init();
    return cleanup;
  }, []);

  const activeTheme = isDark ? CustomDarkTheme : CustomLightTheme;

  if (!hasHydrated) {
    return null; // Prevent theme flashing while store hydrates
  }

  return (
    <ThemeProvider value={activeTheme}>
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
              headerStyle: { backgroundColor: isDark ? "#0e150e" : "#f8fafc" },
              headerTintColor: isDark ? "#dce5d9" : "#0f172a",
            }}
          />
          <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="settings/notifications"
            options={{
              headerShown: true,
              title: "Notifications",
              headerStyle: { backgroundColor: isDark ? "#0e150e" : "#f8fafc" },
              headerTintColor: isDark ? "#dce5d9" : "#0f172a",
            }}
          />
          <Stack.Screen
            name="settings/data-export"
            options={{
              headerShown: true,
              title: "Data & Export",
              headerStyle: { backgroundColor: isDark ? "#0e150e" : "#f8fafc" },
              headerTintColor: isDark ? "#dce5d9" : "#0f172a",
            }}
          />
        </Stack>
      </ErrorBoundary>
      <StatusBar style={isDark ? "light" : "dark"} />
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
