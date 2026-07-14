import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useSettingsStore } from "../settings/store";

// Configure foreground handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  // Check permission
  async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  },

  // Request permissions and register
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    const granted = finalStatus === "granted";
    useSettingsStore.getState().setNotificationsEnabled(granted);
    return granted;
  },

  // Send local notification instantly
  async sendLocalNotification(title: string, body: string, data?: object) {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      console.warn("Notifications permission is not granted; local notification skipped.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // trigger immediately
    });
  },

  // Send a delayed notification for testing
  async sendTestNotificationAfterDelay(seconds = 3) {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Notification permission not granted.");
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Push Notification 🚀",
        body: "Success! Push notifications are working perfectly in ReceiptBrain.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });
  },

  // Schedule daily reminder to scan receipts
  async scheduleDailyScanReminder(time24h: string) {
    await this.cancelAllScheduledReminders();

    const [hoursStr, minutesStr] = time24h.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid reminder time format. Must be HH:MM");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Scan Your Receipts 🧾",
        body: "Keep your expenses up to date! Scan any receipts you collected today.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
    
    useSettingsStore.getState().setDailyRemindersEnabled(true);
    useSettingsStore.getState().setReminderTime(time24h);
  },

  // Cancel reminders
  async cancelAllScheduledReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    useSettingsStore.getState().setDailyRemindersEnabled(false);
  },

  // Initialize listeners
  init() {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Foreground notification received:", notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification clicked/tapped:", response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  },
};
