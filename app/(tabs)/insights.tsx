import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryBreakdownBar } from "@/components/charts/CategoryBreakdownBar";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { Card } from "@/components/ui/Card";
import { useMonthlyInsights, useSpendingTrends, useWeeklyInsights } from "@/features/insights/hooks";
import { useReceipts, useTaxDeductibleTotal } from "@/features/receipts/hooks";
import { formatCurrency, formatCurrencyShort } from "@/lib/utils";

export default function InsightsScreen() {
  const receipts = useReceipts();
  const weekly = useWeeklyInsights();
  const monthly = useMonthlyInsights();
  const trends = useSpendingTrends();
  const taxTotal = useTaxDeductibleTotal();

  const trendChartData = useMemo(
    () => trends.map((t) => ({ label: t.month, value: t.total, color: "#4be277" })),
    [trends]
  );

  if (receipts.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0e150e" }} edges={["top"]}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#dce5d9", lineHeight: 34, letterSpacing: -0.28, marginBottom: 24 }}>
            AI Insights
          </Text>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#1a221a", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="bar-chart-outline" size={36} color="#3d4a3d" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#dce5d9", marginBottom: 8 }}>No insights yet</Text>
            <Text style={{ fontSize: 14, color: "#869585", textAlign: "center", lineHeight: 20 }}>
              Scan your first receipt to see spending patterns and AI-powered insights.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e150e" }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#dce5d9", lineHeight: 34, letterSpacing: -0.28 }}>
            AI Insights
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#4be27715", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#4be27730" }}>
            <Ionicons name="sparkles" size={14} color="#4be277" />
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4be277" }}>AI Powered</Text>
          </View>
        </View>

        {/* Hero Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <LinearGradient
            colors={["#1a221a", "#161d16"]}
            style={{ flex: 1, borderRadius: 24, borderWidth: 1, borderColor: "#3d4a3d", padding: 16 }}
          >
            <Text style={{ fontSize: 11, color: "#869585", fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>This week</Text>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#dce5d9", lineHeight: 28, marginTop: 4 }}>
              {formatCurrencyShort(weekly.weekTotal)}
            </Text>
            <Text style={{ fontSize: 12, color: "#869585", marginTop: 2 }}>
              {formatCurrency(weekly.previousWeekTotal)} last week
            </Text>
          </LinearGradient>
          <LinearGradient
            colors={["#1a221a", "#161d16"]}
            style={{ flex: 1, borderRadius: 24, borderWidth: 1, borderColor: "#3d4a3d", padding: 16 }}
          >
            <Text style={{ fontSize: 11, color: "#869585", fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>This month</Text>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#dce5d9", lineHeight: 28, marginTop: 4 }}>
              {formatCurrencyShort(monthly.monthTotal)}
            </Text>
            {monthly.changeVsLastMonth !== 0 && (
              <Text style={{ fontSize: 12, color: monthly.changeVsLastMonth > 0 ? "#f59e0b" : "#4be277", marginTop: 2 }}>
                {monthly.changeVsLastMonth >= 0 ? "▲" : "▼"} {Math.abs(Math.round(monthly.changeVsLastMonth * 100))}% vs last month
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Projection */}
        {monthly.projectedTotal > monthly.monthTotal && (
          <View style={{ backgroundColor: "#4be27710", borderRadius: 16, borderWidth: 1, borderColor: "#4be27730", padding: 14, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="trending-up-outline" size={18} color="#4be277" />
            <Text style={{ flex: 1, fontSize: 14, color: "#dce5d9", lineHeight: 20 }}>
              On track to spend{" "}
              <Text style={{ fontWeight: "700", color: "#4be277" }}>{formatCurrency(monthly.projectedTotal)}</Text>
              {" "}this month
            </Text>
          </View>
        )}

        {/* AI Alerts */}
        {weekly.alerts.length > 0 && (
          <View style={{ backgroundColor: "#0566d915", borderRadius: 20, borderWidth: 1, borderColor: "#0566d930", padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#0566d930", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="bulb" size={14} color="#adc6ff" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#adc6ff", textTransform: "uppercase", letterSpacing: 0.5 }}>
                AI Insights
              </Text>
            </View>
            {weekly.alerts.map((alert, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: i < weekly.alerts.length - 1 ? 8 : 0 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#adc6ff", marginTop: 7 }} />
                <Text style={{ flex: 1, fontSize: 13, color: "#adc6ff", lineHeight: 20 }}>{alert}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Category Breakdown */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#dce5d9", lineHeight: 24, marginBottom: 16 }}>
            Spending by category
          </Text>
          <CategoryBreakdownBar data={weekly.categoryBreakdown} />
        </Card>

        {/* Monthly Trend Chart */}
        {trendChartData.length > 1 && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#dce5d9", lineHeight: 24, marginBottom: 16 }}>
              Monthly spending trend
            </Text>
            <ExpenseChart data={trendChartData} height={140} />
          </Card>
        )}

        {/* Monthly Summary */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#dce5d9", lineHeight: 24, marginBottom: 16 }}>
            Monthly summary
          </Text>
          <View style={{ gap: 12 }}>
            <SummaryRow label="Total spent" value={formatCurrency(monthly.monthTotal)} />
            <SummaryRow label="Daily average" value={formatCurrency(monthly.dailyAverage)} />
            <SummaryRow label="Projected total" value={formatCurrency(monthly.projectedTotal)} />
            <SummaryRow label="Top category" value={weekly.topCategory ?? "N/A"} />
            {taxTotal > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#4be27710", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="receipt-outline" size={14} color="#4be277" />
                  <Text style={{ fontSize: 14, color: "#4be277", fontWeight: "500" }}>Tax deductible</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#4be277" }}>{formatCurrency(taxTotal)}</Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Text style={{ fontSize: 14, color: "#869585" }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "500", color: "#dce5d9" }}>{value}</Text>
    </View>
  );
}
