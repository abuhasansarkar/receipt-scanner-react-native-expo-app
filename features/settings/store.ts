import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface SettingsState {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  dailyRemindersEnabled: boolean;
  reminderTime: string; // "HH:MM" 24h format
  hasHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyRemindersEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      notificationsEnabled: false,
      dailyRemindersEnabled: false,
      reminderTime: "20:00",
      hasHydrated: false,

      setThemeMode: (themeMode) => set({ themeMode }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setDailyRemindersEnabled: (dailyRemindersEnabled) => set({ dailyRemindersEnabled }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
    }),
    {
      name: "receiptbrain/settings",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useSettingsStore.setState({ hasHydrated: true });
      },
    }
  )
);
