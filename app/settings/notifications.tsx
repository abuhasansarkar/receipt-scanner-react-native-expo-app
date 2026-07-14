import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSettingsStore } from "@/features/settings/store";
import { useThemeColors } from "@/features/settings/hooks";
import { NotificationService } from "@/features/notifications/service";

const REMINDER_PRESETS = [
  { label: "9:00 AM (Morning)", value: "09:00" },
  { label: "12:00 PM (Lunch)", value: "12:00" },
  { label: "6:00 PM (End of day)", value: "18:00" },
  { label: "9:00 PM (Before bed)", value: "21:00" },
];

export default function NotificationsSettingsScreen() {
  const colors = useThemeColors();
  const settings = useSettingsStore();

  const [permissionStatus, setPermissionStatus] = useState<string>("undetermined");
  const [testing, setTesting] = useState(false);

  const checkPermission = async () => {
    const status = await NotificationService.getPermissionStatus();
    setPermissionStatus(status);
    if (status !== "granted" && settings.notificationsEnabled) {
      settings.setNotificationsEnabled(false);
      settings.setDailyRemindersEnabled(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Please enable notifications in your device system settings to receive scan reminders."
        );
      }
      checkPermission();
    } else {
      await NotificationService.cancelAllScheduledReminders();
      settings.setNotificationsEnabled(false);
      settings.setDailyRemindersEnabled(false);
      checkPermission();
    }
  };

  const handleToggleReminders = async (value: boolean) => {
    if (value) {
      const status = await NotificationService.getPermissionStatus();
      if (status !== "granted") {
        const granted = await NotificationService.requestPermissions();
        if (!granted) {
          Alert.alert("Permission Required", "Notifications must be enabled first.");
          return;
        }
      }
      await NotificationService.scheduleDailyScanReminder(settings.reminderTime);
    } else {
      await NotificationService.cancelAllScheduledReminders();
    }
  };

  const handleSelectPresetTime = async (time24h: string) => {
    settings.setReminderTime(time24h);
    if (settings.dailyRemindersEnabled) {
      await NotificationService.scheduleDailyScanReminder(time24h);
    }
  };

  const handleSendTestNotification = async () => {
    const status = await NotificationService.getPermissionStatus();
    if (status !== "granted") {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert("Permission Required", "Please allow notifications permission first.");
        return;
      }
    }

    setTesting(true);
    try {
      await NotificationService.sendTestNotificationAfterDelay(3);
      Alert.alert(
        "Test Scheduled",
        "A test notification will be sent in 3 seconds. Lock your screen or go to the home screen to see the banner!"
      );
    } catch (error) {
      Alert.alert("Test Failed", error instanceof Error ? error.message : "Could not send test notification.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["bottom"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Intro */}
        <View className="px-5 py-6 items-center">
          <View 
            className="w-16 h-16 rounded-3xl items-center justify-center mb-4"
            style={{ backgroundColor: colors.isDark ? "#242c24" : "#f1f5f9" }}
          >
            <Ionicons name="notifications-outline" size={32} color={colors.brand} />
          </View>
          <Text className="text-xl font-bold text-surface-text mb-2 text-center">
            Push Notifications
          </Text>
          <Text className="text-sm text-muted text-center max-w-xs leading-5">
            Configure system permission, budget thresholds alerts, and scan reminders to keep track of your expense data.
          </Text>
        </View>

        {/* Permission Toggle */}
        <View className="settings-group">
          <View className="settings-row justify-between">
            <View className="flex-row items-center gap-3 flex-1 mr-4">
              <Ionicons name="notifications-circle-outline" size={24} color={colors.text} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-surface-text">
                  Allow Notifications
                </Text>
                <Text className="text-xs text-muted mt-0.5">
                  Permission: {permissionStatus.toUpperCase()}
                </Text>
              </View>
            </View>
            <Switch
              value={permissionStatus === "granted"}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: "#3d4a3d", true: colors.brand }}
              thumbColor={colors.isDark ? "#dce5d9" : "#ffffff"}
            />
          </View>
        </View>

        {/* Daily Scan Reminder Switch */}
        <Text className="section-label px-5 mt-4">Reminder Settings</Text>
        <View className="settings-group">
          <View className="settings-row justify-between">
            <View className="flex-row items-center gap-3 flex-1 mr-4">
              <Ionicons name="alarm-outline" size={22} color={colors.text} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-surface-text">
                  Daily Scan Reminder
                </Text>
                <Text className="text-xs text-muted mt-0.5">
                  Sends a daily alert to scan collected receipts
                </Text>
              </View>
            </View>
            <Switch
              value={settings.dailyRemindersEnabled}
              disabled={permissionStatus !== "granted"}
              onValueChange={handleToggleReminders}
              trackColor={{ false: "#3d4a3d", true: colors.brand }}
              thumbColor={colors.isDark ? "#dce5d9" : "#ffffff"}
            />
          </View>

          {/* Time Picker presets if enabled */}
          {settings.dailyRemindersEnabled && (
            <View className="settings-row-border flex-col items-stretch gap-2.5">
              <Text className="text-xs font-semibold text-muted mb-1">
                SELECT REMINDER TIME
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {REMINDER_PRESETS.map((preset) => {
                  const isSelected = settings.reminderTime === preset.value;
                  return (
                    <Pressable
                      key={preset.value}
                      onPress={() => handleSelectPresetTime(preset.value)}
                      className={`rounded-xl border px-3 py-2 ${
                        isSelected 
                          ? "bg-brand/10 border-brand" 
                          : "border-surface-border bg-surface-base"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-brand" : "text-surface-text"
                        }`}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Test Section */}
        <Text className="section-label px-5 mt-4">Testing</Text>
        <View className="settings-group">
          <Pressable
            onPress={handleSendTestNotification}
            disabled={testing}
            className="settings-row active:opacity-75"
          >
            <Ionicons name="rocket-outline" size={22} color={colors.text} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-surface-text">
                Trigger Test Notification
              </Text>
              <Text className="text-xs text-muted mt-0.5">
                Sends a test alert to your device after 3 seconds
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.chevron} />
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
