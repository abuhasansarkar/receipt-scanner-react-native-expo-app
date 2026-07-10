import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryBreakdownBar } from "@/components/charts/CategoryBreakdownBar";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
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
    () => trends.map((t) => ({ label: t.month, value: t.total, color: "#22c55e" })),
    [trends]
  );

  if (receipts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        <ScrollView className="flex-1 px-5 pt-2">
          <Text className="mb-4 text-2xl font-bold text-white">Insights</Text>
          <EmptyState
            icon={<Ionicons name="bar-chart-outline" size={40} color="#52525b" />}
            title="No insights yet"
            subtitle="Scan your first receipt to see spending patterns and AI-powered insights."
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-4 text-2xl font-bold text-white">Insights</Text>

        <View className="mb-4 flex-row gap-3">
          <Card className="flex-1">
            <Text className="text-xs uppercase tracking-wide text-zinc-500">This week</Text>
            <Text className="mt-1 text-2xl font-bold text-white">{formatCurrencyShort(weekly.weekTotal)}</Text>
            <Text className="mt-0.5 text-xs text-zinc-500">{formatCurrency(weekly.previousWeekTotal)} last week</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-xs uppercase tracking-wide text-zinc-500">This month</Text>
            <Text className="mt-1 text-2xl font-bold text-white">{formatCurrencyShort(monthly.monthTotal)}</Text>
            {monthly.changeVsLastMonth !== 0 && (
              <Text className={`mt-0.5 text-xs ${monthly.changeVsLastMonth > 0 ? "text-amber-400" : "text-brand-500"}`}>
                {monthly.changeVsLastMonth >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(Math.round(monthly.changeVsLastMonth * 100))}% vs last month
              </Text>
            )}
          </Card>
        </View>

        {monthly.projectedTotal > monthly.monthTotal && (
          <Card className="mb-4 border-brand-500/20 bg-brand-500/5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="trending-up-outline" size={16} color="#22c55e" />
              <Text className="flex-1 text-sm text-white">
                On track to spend <Text className="font-bold text-brand-500">{formatCurrency(monthly.projectedTotal)}</Text> this month
              </Text>
            </View>
          </Card>
        )}

        {weekly.alerts.length > 0 && (
          <Card className="mb-4 gap-2 border-amber-500/30 bg-amber-500/10">
            <View className="flex-row items-center gap-2">
              <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
              <Text className="text-xs font-semibold uppercase tracking-wide text-amber-300">AI Insights</Text>
            </View>
            {weekly.alerts.map((alert, i) => (
              <View key={i} className="flex-row items-start gap-2">
                <Text className="mt-0.5 text-amber-200 text-xs">\u2022</Text>
                <Text className="flex-1 text-xs text-amber-200">{alert}</Text>
              </View>
            ))}
          </Card>
        )}

        <Card className="mb-4">
          <Text className="mb-3 text-base font-semibold text-white">Spending by category</Text>
          <CategoryBreakdownBar data={weekly.categoryBreakdown} />
        </Card>

        {trendChartData.length > 1 && (
          <Card className="mb-4">
            <Text className="mb-3 text-base font-semibold text-white">Monthly spending trend</Text>
            <ExpenseChart data={trendChartData} height={140} />
          </Card>
        )}

        <Card className="mb-4">
          <Text className="mb-3 text-base font-semibold text-white">Monthly summary</Text>
          <View className="gap-2">
            <SummaryRow label="Total spent" value={formatCurrency(monthly.monthTotal)} />
            <SummaryRow label="Daily average" value={formatCurrency(monthly.dailyAverage)} />
            <SummaryRow label="Projected total" value={formatCurrency(monthly.projectedTotal)} />
            <SummaryRow label="Top category" value={weekly.topCategory ?? "N/A"} />
            {taxTotal > 0 && (
              <View className="flex-row items-center justify-between rounded-lg bg-brand-500/10 px-3 py-2">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="receipt-outline" size={14} color="#22c55e" />
                  <Text className="text-sm text-brand-500 font-medium">Tax deductible</Text>
                </View>
                <Text className="text-sm font-semibold text-brand-500">{formatCurrency(taxTotal)}</Text>
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
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-zinc-500">{label}</Text>
      <Text className="text-sm font-medium text-white">{value}</Text>
    </View>
  );
}
