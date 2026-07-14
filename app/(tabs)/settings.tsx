import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/hooks";
import { useSettingsStore, type ThemeMode } from "@/features/settings/store";
import { useThemeColors } from "@/features/settings/hooks";

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View className="settings-group">{children}</View>;
}

function SettingsRow({
  icon,
  label,
  value,
  href,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  href?: string;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  
  const handlePress = () => {
    if (onPress) onPress();
    else if (href) router.push(href as Href);
  };

  return (
    <Pressable onPress={handlePress} className="settings-row active:opacity-70">
      <View className="w-6 h-6 items-center justify-center">
        <Ionicons name={icon} size={20} color={colors.text} />
      </View>
      <Text className="flex-1 text-sm font-medium text-surface-text">{label}</Text>
      {value && (
        <Text className="text-sm text-muted">{value}</Text>
      )}
      <Ionicons name="chevron-forward" size={18} color={colors.chevron} />
    </Pressable>
  );
}

function SettingsRowBorder({
  icon,
  label,
  value,
  href,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  href?: string;
  onPress?: () => void;
}) {
  return (
    <>
      <View className="h-px bg-surface-border mx-4" />
      <SettingsRow icon={icon} label={label} value={value} href={href} onPress={onPress} />
    </>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const settings = useSettingsStore();
  const colors = useThemeColors();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";

  const themeDisplay = {
    light: "Light",
    dark: "Dark",
    system: "System Default",
  }[settings.themeMode];

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)/sign-in" as Href);
          } catch {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const handleThemeChange = () => {
    Alert.alert("Select Theme", "Choose your appearance preference", [
      {
        text: "Light Mode",
        onPress: () => settings.setThemeMode("light" as ThemeMode),
      },
      {
        text: "Dark Mode",
        onPress: () => settings.setThemeMode("dark" as ThemeMode),
      },
      {
        text: "System Default",
        onPress: () => settings.setThemeMode("system" as ThemeMode),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View className="items-center px-5 pb-8 pt-6">
          <View className="avatar-lg mb-4">
            <Text className="text-2xl font-bold text-brand">{userInitial}</Text>
          </View>
          <Text className="mb-1 text-xl font-bold text-surface-text">{userName}</Text>
          {userEmail ? (
            <Text className="mb-3 text-sm text-muted">{userEmail}</Text>
          ) : null}
          {user?.plan && user.plan !== "free" && (
            <View className="pro-badge">
              <Ionicons name="diamond-outline" size={12} color={colors.brand} />
              <Text className="text-xs font-bold text-brand">
                {user.plan.toUpperCase()} PLAN
              </Text>
            </View>
          )}
        </View>

        {/* Account Group */}
        <SettingsGroup>
          <SettingsRow icon="person-outline" label="Account" onPress={() => {}} />
          <SettingsRowBorder icon="desktop-outline" label="Subscription" />
          <SettingsRowBorder icon="card-outline" label="Payment Methods" />
          <SettingsRowBorder
            icon="download-outline"
            label="Data & Export"
            href="settings/data-export"
          />
        </SettingsGroup>

        {/* Preferences Group */}
        <SettingsGroup>
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            href="settings/notifications"
          />
          <SettingsRowBorder
            icon="moon-outline"
            label="Theme"
            value={themeDisplay}
            onPress={handleThemeChange}
          />
        </SettingsGroup>

        {/* Support Group */}
        <SettingsGroup>
          <SettingsRow icon="help-circle-outline" label="Help & Support" />
          <SettingsRowBorder icon="information-circle-outline" label="About ReceiptBrain" />
        </SettingsGroup>

        {/* Sign Out */}
        <View className="px-5">
          <Pressable
            onPress={handleSignOut}
            className="items-center rounded-2xl border border-red-500/40 py-3.5 active:bg-red-500/10"
          >
            <Text className="text-sm font-semibold text-red-500">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
