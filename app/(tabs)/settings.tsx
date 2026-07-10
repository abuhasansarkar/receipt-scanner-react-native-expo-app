import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
      Alert.alert("CSV Generated", `${receipts.length} receipts exported (${csv.length} chars).`);
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
      taxReport.totalDeductible > 0
        ? `Total deductible: ${formatCurrency(taxReport.totalDeductible)}\nCategories: ${taxReport.byCategory.map((c) => `${c.category}: ${formatCurrency(c.total)}`).join("\n")}`
        : "No deductible expenses found."
    );
  }, [taxReport]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e150e" }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#dce5d9", lineHeight: 34, letterSpacing: -0.28, marginTop: 8, marginBottom: 24 }}>
          Profile
        </Text>

        {/* Profile Card */}
        {isSignedIn && user ? (
          <Card style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <LinearGradient
                colors={["#4be277", "#0566d9"]}
                style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 22, fontWeight: "700", color: "#003915" }}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#dce5d9" }}>{user.name}</Text>
                <Text style={{ fontSize: 13, color: "#869585", marginTop: 2 }}>{user.email}</Text>
              </View>
              <View style={{ backgroundColor: "#4be27720", borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#4be277", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {user.plan}
                </Text>
              </View>
            </View>
            <Button label="Sign out" variant="secondary" onPress={handleSignOut} />
          </Card>
        ) : (
          <Card style={{ marginBottom: 24 }}>
            <View style={{ alignItems: "center", paddingVertical: 8 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#242c24", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Ionicons name="person-outline" size={28} color="#869585" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#dce5d9", marginBottom: 6 }}>
                Using ReceiptBrain offline
              </Text>
              <Text style={{ fontSize: 13, color: "#869585", textAlign: "center", lineHeight: 20, marginBottom: 16 }}>
                Sign in to unlock cloud sync and access your receipts on other devices.
              </Text>
              <Button label="Sign in" onPress={() => router.push("/(auth)/sign-in" as Href)} />
            </View>
          </Card>
        )}

        {/* Upgrade Banner */}
        <Pressable style={{ borderRadius: 20, overflow: "hidden", marginBottom: 24 }}>
          <LinearGradient
            colors={["#4be27720", "#0566d920", "#b89cff20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#4be27730" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#4be27720", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="sparkles" size={18} color="#4be277" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#dce5d9" }}>Upgrade to Pro</Text>
                <Text style={{ fontSize: 12, color: "#869585", marginTop: 2 }}>Unlimited scans, AI insights & cloud sync</Text>
              </View>
              <View style={{ backgroundColor: "#4be277", borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#003915" }}>Upgrade</Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Data & Export */}
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#869585", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Data & Export
        </Text>
        <Card style={{ marginBottom: 24, padding: 0 }}>
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
            divider
          />
          <SettingsRow
            icon="cloud-upload-outline"
            label="Cloud sync"
            subtitle="Optional Supabase sync"
            onPress={() => Alert.alert("Cloud sync", "Configure EXPO_PUBLIC_SUPABASE_URL in your .env to enable.")}
            divider
          />
        </Card>

        {/* Account */}
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#869585", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Account
        </Text>
        <Card style={{ marginBottom: 24, padding: 0 }}>
          <SettingsRow
            icon="card-outline"
            label="Manage subscription"
            subtitle="Free plan"
            onPress={() => Alert.alert("Subscription", "Upgrade to Pro for unlimited scans and AI insights.")}
          />
          <SettingsRow
            icon="help-circle-outline"
            label="Help & support"
            subtitle="Documentation"
            onPress={() => Alert.alert("Help", "Visit https://receiptbrain.app/support")}
            divider
          />
          <SettingsRow
            icon="information-circle-outline"
            label="Version"
            subtitle="1.0.0"
            onPress={() => {}}
            divider
          />
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
  divider,
}: {
  icon: keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  divider?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: "#3d4a3d",
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
      })}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#242c24", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={18} color="#bccbb9" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#dce5d9" }}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 12, color: "#869585", marginTop: 1 }}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#3d4a3d" />
    </Pressable>
  );
}
