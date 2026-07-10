import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter, type Href } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useMonthlyInsights, useWeeklyInsights } from "@/features/insights/hooks";
import { useReceiptCountByStatus, useReceipts, useTaxDeductibleTotal } from "@/features/receipts/hooks";
import { FREE_PLAN_MONTHLY_SCAN_LIMIT } from "@/lib/constants";
import { formatCurrency, formatCurrencyShort } from "@/lib/utils";

export default function DashboardScreen() {
  const router = useRouter();
  const receipts = useReceipts();
  const weekly = useWeeklyInsights();
  const monthly = useMonthlyInsights();
  const taxTotal = useTaxDeductibleTotal();
  const statusCounts = useReceiptCountByStatus();
  const recent = receipts.slice(0, 5);
  const totalScans = receipts.length;

  const trendData = [
    { label: "Mon", value: monthly.dailyAverage, color: "#4be277" },
    { label: "Tue", value: monthly.dailyAverage * 0.8, color: "#4be277" },
    { label: "Wed", value: monthly.dailyAverage * 1.2, color: "#4be277" },
    { label: "Thu", value: monthly.dailyAverage * 0.9, color: "#4be277" },
    { label: "Fri", value: monthly.dailyAverage * 1.1, color: "#4be277" },
    { label: "Sat", value: monthly.dailyAverage * 0.5, color: "#4be277" },
    { label: "Sun", value: monthly.dailyAverage * 0.3, color: "#4be277" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e150e" }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 12, color: "#869585", fontWeight: "400", letterSpacing: 0.5 }}>Welcome back</Text>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#dce5d9", lineHeight: 34, letterSpacing: -0.01 * 28 }}>
              Receipt
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {statusCounts.needs_review > 0 && (
              <View style={{ position: "relative" }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#242c24", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="notifications-outline" size={20} color="#f59e0b" />
                </View>
                <View style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: "#f59e0b", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 9, fontWeight: "700", color: "#000" }}>{statusCounts.needs_review}</Text>
                </View>
              </View>
            )}
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#242c24", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="sparkles-outline" size={20} color="#4be277" />
            </View>
          </View>
        </View>

        {/* Total Spending Hero Card */}
        <LinearGradient
          colors={["#1a221a", "#161d16"]}
          style={{ borderRadius: 24, borderWidth: 1, borderColor: "#3d4a3d", padding: 20, marginBottom: 16 }}
        >
          <Text style={{ fontSize: 12, color: "#869585", fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>
            Total this month
          </Text>
          <Text style={{ fontSize: 34, fontWeight: "700", color: "#dce5d9", lineHeight: 40, letterSpacing: -0.02 * 34, marginTop: 4 }}>
            {formatCurrencyShort(monthly.monthTotal)}
          </Text>
          {monthly.projectedTotal > monthly.monthTotal && (
            <Text style={{ fontSize: 12, color: "#869585", marginTop: 4 }}>
              Projected: {formatCurrencyShort(monthly.projectedTotal)}
            </Text>
          )}
          <View style={{ marginTop: 16 }}>
            <ExpenseChart data={trendData} height={80} />
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <Card style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 11, color: "#869585", fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>This week</Text>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#dce5d9", lineHeight: 28, marginTop: 4 }}>
              {formatCurrencyShort(weekly.weekTotal)}
            </Text>
            {weekly.changeVsLastWeek !== 0 && (
              <Text style={{ fontSize: 12, color: weekly.changeVsLastWeek > 0 ? "#f59e0b" : "#4be277", marginTop: 2 }}>
                {weekly.changeVsLastWeek >= 0 ? "▲" : "▼"} {Math.abs(Math.round(weekly.changeVsLastWeek * 100))}%
              </Text>
            )}
          </Card>
          <Card style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 11, color: "#869585", fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>Scans left</Text>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#dce5d9", lineHeight: 28, marginTop: 4 }}>
              {FREE_PLAN_MONTHLY_SCAN_LIMIT - totalScans}
            </Text>
            <ProgressBar value={totalScans} max={FREE_PLAN_MONTHLY_SCAN_LIMIT} color="#4be277" className="mt-2" height={4} />
          </Card>
        </View>

        {/* Alerts */}
        {weekly.alerts.length > 0 && (
          <View style={{ backgroundColor: "#f59e0b18", borderRadius: 16, borderWidth: 1, borderColor: "#f59e0b30", padding: 14, marginBottom: 16 }}>
            {weekly.alerts.slice(0, 2).map((alert, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: i < weekly.alerts.length - 1 ? 6 : 0 }}>
                <Ionicons name="alert-circle-outline" size={14} color="#f59e0b" />
                <Text style={{ flex: 1, fontSize: 12, color: "#fde68a" }}>{alert}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Scan CTA */}
        <Pressable
          onPress={() => router.push("/(tabs)/scan")}
          style={{ marginBottom: 24, borderRadius: 16, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["#4be277", "#0566d9", "#b89cff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 }}
          >
            <Ionicons name="camera" size={20} color="#003915" />
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#003915" }}>Scan a receipt</Text>
          </LinearGradient>
        </Pressable>

        {/* Recent Receipts */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#dce5d9", lineHeight: 28 }}>Recent receipts</Text>
          <Link href="/(tabs)/receipts" style={{ fontSize: 14, color: "#4be277", fontWeight: "500" }}>See all</Link>
        </View>

        {recent.length === 0 ? (
          <Card>
            <Text style={{ textAlign: "center", fontSize: 14, color: "#869585" }}>
              No receipts yet. Scan your first one to get started.
            </Text>
          </Card>
        ) : (
          recent.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onPress={() => router.push(`/receipt/${receipt.id}` as Href)}
            />
          ))
        )}

        {/* Tax Deductible */}
        {taxTotal > 0 && (
          <View style={{ backgroundColor: "#4be27710", borderRadius: 16, borderWidth: 1, borderColor: "#4be27730", padding: 16, marginTop: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="receipt-outline" size={16} color="#4be277" />
                <Text style={{ fontSize: 14, fontWeight: "500", color: "#dce5d9" }}>Tax deductible total</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#4be277" }}>{formatCurrency(taxTotal)}</Text>
            </View>
            <ProgressBar value={taxTotal} max={monthly.monthTotal || 1} color="#4be277" className="mt-2" />
          </View>
        )}

        {/* Need Review */}
        {statusCounts.needs_review > 0 && (
          <Card style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="eye-outline" size={16} color="#f59e0b" />
                <Text style={{ fontSize: 14, fontWeight: "500", color: "#dce5d9" }}>Need review</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#f59e0b" }}>{statusCounts.needs_review}</Text>
            </View>
            <Text style={{ fontSize: 11, color: "#869585", marginTop: 4 }}>{statusCounts.verified} verified receipts</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
