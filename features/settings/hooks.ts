import { useColorScheme } from "nativewind";
import { useColorScheme as useReactNativeColorScheme } from "react-native";
import { useSettingsStore } from "./store";

export function useThemeColors() {
  const { themeMode } = useSettingsStore();
  const systemScheme = useReactNativeColorScheme();

  const isDark = themeMode === "system"
    ? systemScheme === "dark"
    : themeMode === "dark";

  return {
    isDark,
    brand: isDark ? "#4be277" : "#22c55e",
    surfaceBase: isDark ? "#0e150e" : "#f8fafc",
    surfaceCard: isDark ? "#1a221a" : "#ffffff",
    surfaceBorder: isDark ? "#3d4a3d" : "#e2e8f0",
    text: isDark ? "#dce5d9" : "#0f172a",
    muted: isDark ? "#869585" : "#64748b",
    subtle: isDark ? "#bccbb9" : "#475569",
    outline: isDark ? "#869585" : "#64748b",
    tint: isDark ? "#4be277" : "#22c55e",
    chevron: isDark ? "#5a6d5a" : "#94a3b8",
  };
}
