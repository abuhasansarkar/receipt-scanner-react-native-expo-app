import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { Sparkline } from "@/components/charts/Sparkline";
import {
  useAnchorDate,
  useMonthlyInsights,
  useSpendingTrends,
  useWeeklyInsights,
} from "@/features/insights/hooks";
import { useReceipts } from "@/features/receipts/hooks";
import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type TimePeriod = "week" | "month";

export default function InsightsScreen() {
  const receipts = useReceipts();
  const weekly = useWeeklyInsights();
  const monthly = useMonthlyInsights();
  const trends = useSpendingTrends();
  const anchorDate = useAnchorDate();
  const [period, setPeriod] = useState<TimePeriod>("week");

  const insights = period === "week" ? weekly : monthly;
  const total =
    period === "week" ? weekly.weekTotal : monthly.monthTotal;
  const previousTotal =
    period === "week"
      ? weekly.previousWeekTotal
      : monthly.previousMonthTotal;
  const changePercent =
    previousTotal > 0
      ? Math.round(((total - previousTotal) / previousTotal) * 100)
      : 0;
  const isPositive = changePercent >= 0;

  const sparkData = useMemo(() => {
    const dayOfWeek = (anchorDate.getDay() + 6) % 7;
    return Array.from({ length: dayOfWeek + 1 }, (_, i) => {
      const dayReceipts = receipts.filter((r) => {
        const d = new Date(r.date);
        const diff = Math.floor(
          (anchorDate.getTime() - d.getTime()) / 86_400_000
        );
        return diff === dayOfWeek - i;
      });
      return dayReceipts.reduce((sum, r) => sum + r.total, 0);
    });
  }, [receipts, anchorDate]);

  const topCategories = useMemo(
    () => insights.categoryBreakdown.slice(0, 5),
    [insights]
  );

  const trendData = useMemo(
    () =>
      trends.map((t) => ({
        label: t.month,
        value: t.total,
      })),
    [trends]
  );

  const barData = useMemo(
    () =>
      topCategories.map((entry) => ({
        label: getCategoryMeta(entry.category).label.split(" ")[0],
        value: Math.round(entry.total),
        color: getCategoryMeta(entry.category).color,
      })),
    [topCategories]
  );

  if (receipts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-base" edges={["top"]}>
        <View className="flex-1 px-5 pt-2">
          <Text className="text-headline-lg mb-6">Insights</Text>
          <View className="flex-1 items-center justify-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-surface-container">
              <Ionicons name="bar-chart-outline" size={36} color="#3d4a3d" />
            </View>
            <Text className="mb-2 text-lg font-semibold text-surface-text">
              No insights yet
            </Text>
            <Text className="text-center text-sm leading-5 text-muted">
              Scan your first receipt to see spending patterns and AI-powered
              insights.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-5 mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="header-avatar">
              <Text className="text-sm font-semibold text-brand">U</Text>
            </View>
            <Text className="text-lg font-bold tracking-tight text-brand">
              ReceiptBrain
            </Text>
          </View>
          <View className="icon-40">
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#dce5d9"
            />
          </View>
        </View>

        {/* Title + Period Selector */}
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-headline-lg">Insights</Text>
          <Pressable
            onPress={() => setPeriod(period === "week" ? "month" : "week")}
            className="flex-row items-center gap-1.5 rounded-full border border-surface-border bg-surface-container px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-on-surface-variant">
              {period === "week" ? "This Week" : "This Month"}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#869585" />
          </Pressable>
        </View>

        {/* Spending Trend Card */}
        <View className="card-dark mb-4 p-5">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-on-surface-variant">
              Spending Trend
            </Text>
            <View className="trend-up-badge">
              <Ionicons
                name={isPositive ? "trending-up" : "trending-down"}
                size={12}
                color="#4be277"
              />
              <Text className="text-xs font-semibold text-brand">
                {isPositive ? "+" : ""}
                {changePercent}%
              </Text>
            </View>
          </View>
          <Text className="mb-3 text-[28px] font-bold text-brand leading-8">
            {isPositive ? "+" : ""}
            {formatCurrency(total)}
          </Text>

          {trendData.length >= 2 ? (
            <LineChart data={trendData} height={130} />
          ) : (
            <Sparkline data={sparkData} height={120} strokeWidth={2.5} />
          )}
        </View>

        {/* Top Categories Card */}
        <View className="card-dark mb-4 p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-body font-semibold">Top Categories</Text>
            <Pressable>
              <Text className="text-sm font-semibold text-brand">
                See All
              </Text>
            </Pressable>
          </View>

          {topCategories.length === 0 ? (
            <Text className="text-sm text-muted">No categories yet</Text>
          ) : barData.length > 0 ? (
            <>
              <BarChart
                data={barData}
                height={140}
                showValues={true}
              />
              <View className="mt-4 gap-3">
                {topCategories.map((entry) => {
                  const meta = getCategoryMeta(entry.category);
                  return (
                    <View key={entry.category}>
                      <View className="mb-1.5 flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-surface-text">
                          {meta.label.split(" ")[0]}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-semibold text-surface-text">
                            {formatCurrency(entry.total)}
                          </Text>
                          <Text className="w-8 text-right text-xs text-muted">
                            {Math.round(entry.percentage * 100)}%
                          </Text>
                        </View>
                      </View>
                      <View className="progress-bar">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(entry.percentage * 100, 4)}%`,
                            backgroundColor: meta.color,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            topCategories.map((entry) => {
              const meta = getCategoryMeta(entry.category);
              return (
                <View key={entry.category}>
                  <View className="mb-1.5 flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-surface-text">
                      {meta.label.split(" ")[0]}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-semibold text-surface-text">
                        {formatCurrency(entry.total)}
                      </Text>
                      <Text className="w-8 text-right text-xs text-muted">
                        {Math.round(entry.percentage * 100)}%
                      </Text>
                    </View>
                  </View>
                  <View className="progress-bar">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(entry.percentage * 100, 4)}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* AI Alert Card */}
        {weekly.alerts.length > 0 && (
          <View className="ai-alert-card mb-4">
            <View className="mb-3 flex-row items-center gap-3">
              <LinearGradient
                colors={["rgba(173,198,255,0.15)", "rgba(209,189,255,0.15)"]}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <Ionicons name="sparkles" size={20} color="#adc6ff" />
              </LinearGradient>
              <Text className="text-body font-semibold text-surface-text">
                AI Alert
              </Text>
            </View>
            <Text className="mb-4 text-sm leading-5 text-on-surface-variant">
              {weekly.alerts[0]}
            </Text>
            <Pressable className="self-start rounded-full border border-surface-border px-4 py-2">
              <Text className="text-xs font-semibold text-surface-text">
                Review
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
