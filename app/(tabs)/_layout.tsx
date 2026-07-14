import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

import { useThemeColors } from "@/features/settings/hooks";

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.isDark ? "#5a6d5a" : "#94a3b8",
        tabBarStyle: {
          backgroundColor: colors.surfaceCard,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 96 : 76,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          tabBarLabel: "Receipts",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.brand,
                alignItems: "center",
                justifyContent: "center",
                marginTop: -16,
                shadowColor: colors.brand,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Ionicons name="scan" size={24} color={colors.isDark ? "#003915" : "#ffffff"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarLabel: "Insights",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
