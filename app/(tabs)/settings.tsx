import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/hooks";
import { useCsvExport, useTaxReport } from "@/features/reports/hooks";
import { useReceipts } from "@/features/receipts/hooks";
import { isClerkConfigured } from "@/lib/clerk";
import { formatCurrency } from "@/lib/utils";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isSignedIn, signOut } = useAuth();
  const receipts = useReceipts();
  const csvExport = useCsvExport();
  const taxReport = useTaxReport();
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = useCallback(() => {
    setExporting(true);
    try {
      const csv = csvExport.generateCsv();
      Alert.alert("CSV Generated", `${receipts.length} receipts exported (${csv.length} chars). In production this would trigger a download/share sheet.`);
    } finally {
      setExporting(false);
    }
  }, [csvExport, receipts.length]);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      "Sign out",
      isClerkConfigured
        ? "You will be signed out of your account."
        : "Your local receipts stay on this device.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: signOut },
      ]
    );
  }, [signOut]);

  const handleExportTaxReport = useCallback(() => {
    Alert.alert(
      "Tax Report",
      `${taxReport.totalDeductible > 0
        ? `Total deductible: ${formatCurrency(taxReport.totalDeductible)}\nCategories: ${taxReport.byCategory.map((c) => `${c.category}: ${formatCurrency(c.total)}`).join("\n")}`
        : "No deductible expenses found. Mark receipts as tax deductible in the receipt editor."}`
    );
  }, [taxReport]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-4 text-2xl font-bold text-white">Settings</Text>

        <Card className="mb-4">
          {isSignedIn && user ? (
            <View>
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-500/15">
                  <Text className="text-lg font-bold text-brand-500">{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">{user.name}</Text>
                  <Text className="text-sm text-zinc-500">{user.email}</Text>
                </View>
                <View className="rounded-full bg-brand-500/15 px-3 py-1">
                  <Text className="text-xs font-semibold uppercase text-brand-500">{user.plan}</Text>
                </View>
              </View>
              <View className="mt-4">
                <Button label="Sign out" variant="secondary" onPress={handleSignOut} />
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-base font-semibold text-white">Using ReceiptBrain offline</Text>
              <Text className="mt-1 text-sm text-zinc-500">Sign in to unlock cloud sync and access your receipts on other devices.</Text>
              <View className="mt-4">
                <Button label="Sign in" onPress={() => router.push("/(auth)/sign-in" as Href)} />
              </View>
            </View>
          )}
        </Card>

        <Text className="mb-2 text-sm font-semibold text-white">Data & Export</Text>
        <Card className="mb-4 gap-0 p-0">
          <SettingsRow
            icon="download-outline"
            label="Export all as CSV"
            subtitle={receipts.length > 0 ? `${receipts.length} receipts` : "No receipts yet"}
            onPress={handleExportCsv}
            disabled={receipts.length === 0 || exporting}
          />
          <SettingsRow
            icon="receipt-outline"
            label="Tax report"
            subtitle={taxReport.totalDeductible > 0 ? formatCurrency(taxReport.totalDeductible) : "No deductible marked"}
            onPress={handleExportTaxReport}
            disabled={taxReport.totalDeductible === 0}
            border
          />
          <SettingsRow
            icon="cloud-upload-outline"
            label="Cloud sync"
            subtitle="Optional Supabase sync"
            onPress={() => Alert.alert("Cloud sync", "Configure EXPO_PUBLIC_SUPABASE_URL in your .env to enable.")}
            border
          />
        </Card>

        <Text className="mb-2 text-sm font-semibold text-white">Account</Text>
        <Card className="mb-4 gap-0 p-0">
          <SettingsRow icon="card-outline" label="Manage subscription" subtitle="Free plan" onPress={() => Alert.alert("Subscription", "Upgrade to Pro for unlimited scans and AI insights.")} />
          <SettingsRow icon="help-circle-outline" label="Help & support" subtitle="Documentation" onPress={() => Alert.alert("Help", "Visit https://receiptbrain.app/support")} border />
          <SettingsRow icon="information-circle-outline" label="Version" subtitle="1.0.0" onPress={() => {}} border />
        </Card>

        <Card className="mb-4 border-brand-500/20 bg-brand-500/5">
          <View className="flex-row items-center gap-3">
            <Ionicons name="sparkles-outline" size={20} color="#22c55e" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white">Upgrade to Pro</Text>
              <Text className="text-xs text-zinc-500">Unlimited scans, AI insights, and cloud sync</Text>
            </View>
            <Pressable className="rounded-full bg-brand-500 px-4 py-2">
              <Text className="text-xs font-bold text-black">Pro</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  disabled,
  border,
}: {
  icon: keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  border?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-3 px-4 py-3.5 ${border ? "border-b border-surface-border" : ""} ${disabled ? "opacity-50" : "active:opacity-70"}`}
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-surface">
        <Ionicons name={icon} size={16} color="#a1a1aa" />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-white">{label}</Text>
        {subtitle && <Text className="text-xs text-zinc-500">{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#52525b" />
    </Pressable>
  );
}
