import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const isClerkConfigured = Boolean(publishableKey);

interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
}

const secureStoreTokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
  clearToken(key: string) {},
};

const memoryTokenCache: TokenCache = {
  async getToken(_key: string) {
    return null;
  },
  async saveToken(_key: string, _value: string) {},
  clearToken(_key: string) {},
};

export const tokenCache =
  Platform.OS === "web" ? memoryTokenCache : secureStoreTokenCache;
