import "@/global.css";

import { ClerkProvider } from "@clerk/clerk-expo";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { isClerkConfigured, publishableKey, tokenCache } from "@/lib/clerk";

function RootLayoutInner() {
  return (
    <ThemeProvider value={DarkTheme}>
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
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootLayoutInner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        {content}
      </ClerkProvider>
    );
  }

  return content;
}
