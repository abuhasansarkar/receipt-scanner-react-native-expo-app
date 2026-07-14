import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart } from "@/components/charts/LineChart";
import { useAuth } from "@/features/auth/hooks";
import { useThemeColors } from "@/features/settings/hooks";
import {
  useMonthlyInsights,
  useSpendingTrends,
  useWeeklyInsights,
} from "@/features/insights/hooks";
import { useReceipts } from "@/features/receipts/hooks";
import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency, formatCurrencyShort } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";

function formatReceiptTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-1 rounded-xl border border-surface-border bg-surface-container p-3">
      <View
        className="mb-2 h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="text-lg font-bold text-surface-text">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-muted">{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const receipts = useReceipts();
  const weekly = useWeeklyInsights();
  const monthly = useMonthlyInsights();
  const trends = useSpendingTrends();

  const [timePeriod, setTimePeriod] = useState<"week" | "month">("week");
  const [showInsight, setShowInsight] = useState(true);

  const insights = timePeriod === "week" ? weekly : monthly;
  const recent = receipts.slice(0, 5);
  const totalSpending =
    timePeriod === "week" ? weekly.weekTotal : monthly.monthTotal;
  const trendPercentage =
    timePeriod === "week"
      ? weekly.changeVsLastWeek
      : monthly.changeVsLastMonth;
  const trendLabel =
    timePeriod === "week" ? "vs last week" : "vs last month";

  const topInsight = useMemo(() => weekly.alerts[0] ?? null, [weekly.alerts]);
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const trendUp = trendPercentage > 0;
  const trendColor = trendUp ? "#f59e0b" : "#4be277";

  const avgReceipt = receipts.length > 0
    ? receipts.reduce((s, r) => s + r.total, 0) / receipts.length
    : 0;

  const trendData = useMemo(
    () =>
      trends.map((t) => ({
        label: t.month,
        value: t.total,
      })),
    [trends]
  );

  const spendData = useMemo(
    () =>
      insights.categoryBreakdown.map((cat) => ({
        label: getCategoryMeta(cat.category).label.split(" ")[0],
        value: Math.round(cat.total),
        color: getCategoryMeta(cat.category).color,
      })),
    [insights]
  );

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-5 mt-1 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="header-avatar">
              <Text className="text-sm font-semibold text-brand">
                {userInitial}
              </Text>
            </View>
            <View>
              <Text className="text-lg font-bold tracking-tight text-brand">
                ReceiptBrain
              </Text>
              <Text className="text-xs text-muted">
                {user?.name ?? "Guest"}
              </Text>
            </View>
          </View>
          <View className="icon-40">
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.text}
            />
          </View>
        </View>

        {/* Period Toggle + Total */}
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-label-caps mb-1">Total Spending</Text>
            <Text className="text-[30px] font-bold text-surface-text leading-9 tracking-tight">
              {formatCurrency(totalSpending)}
            </Text>
            {trendPercentage !== 0 && (
              <View className="mt-0.5 flex-row items-center gap-1">
                <Ionicons
                  name={trendUp ? "trending-up" : "trending-down"}
                  size={13}
                  color={trendColor}
                />
                <Text
                  className="text-xs font-medium"
                  style={{ color: trendColor }}
                >
                  {trendUp ? "+" : ""}
                  {Math.abs(Math.round(trendPercentage * 100))}% {trendLabel}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row rounded-full border border-surface-border bg-surface-container p-0.5">
            <Pressable
              onPress={() => setTimePeriod("week")}
              className={`rounded-full px-3 py-1.5 ${
                timePeriod === "week" ? "bg-brand" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  timePeriod === "week" ? "text-on-primary" : "text-muted"
                }`}
              >
                Week
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTimePeriod("month")}
              className={`rounded-full px-3 py-1.5 ${
                timePeriod === "month" ? "bg-brand" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  timePeriod === "month" ? "text-on-primary" : "text-muted"
                }`}
              >
                Month
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View className="mb-4 flex-row gap-2.5">
          <StatCard
            icon="receipt-outline"
            label="Receipts"
            value={String(receipts.length)}
            color="#4be277"
          />
          <StatCard
            icon="calculator-outline"
            label="Avg / Receipt"
            value={formatCurrencyShort(avgReceipt)}
            color="#3b82f6"
          />
          <StatCard
            icon="calendar-outline"
            label={timePeriod === "week" ? "This Week" : "This Month"}
            value={String(insights.categoryBreakdown.reduce((s, c) => s + c.count, 0))}
            color="#8b5cf6"
          />
          <StatCard
            icon="trending-up-outline"
            label={trendUp ? "Up" : "Down"}
            value={`${Math.abs(Math.round(trendPercentage * 100))}%`}
            color={trendColor}
          />
        </View>

        {/* Spending Trend (Line Chart) - only when receipts exist */}
        {trendData.length >= 2 && (
          <View className="card-dark mb-4 p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-body font-semibold">Spending Trend</Text>
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.chevron} />
            </View>
            <LineChart data={trendData} height={140} />
          </View>
        )}

        {/* Category Breakdown Card */}
        <View className="card-dark mb-4 p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-body font-semibold">Category Breakdown</Text>
            <Link
              href="/(tabs)/insights"
              className="text-xs font-semibold text-brand"
            >
              Details
            </Link>
          </View>

          {insights.categoryBreakdown.length === 0 ? (
            <Text className="py-4 text-center text-sm text-muted">
              No spending recorded {timePeriod === "week" ? "this week" : "this month"}.
            </Text>
          ) : (
            <>
              <View className="mb-4 flex-row items-center gap-5">
                <DonutChart
                  data={insights.categoryBreakdown.map((cat) => ({
                    value: cat.total,
                    color: getCategoryMeta(cat.category).color,
                    label: getCategoryMeta(cat.category).label,
                  }))}
                  size={110}
                  strokeWidth={10}
                />
                <View className="flex-1 gap-2">
                  {insights.categoryBreakdown.slice(0, 5).map((cat) => {
                    const meta = getCategoryMeta(cat.category);
                    return (
                      <View key={cat.category} className="flex-row items-center gap-2">
                        <View
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <Text
                          className="flex-1 text-[12px] font-medium text-subtle"
                          numberOfLines={1}
                        >
                          {meta.label.split(" ")[0]}
                        </Text>
                        <Text className="text-[12px] font-semibold text-surface-text">
                          {formatCurrency(cat.total)}
                        </Text>
                        <Text className="w-8 text-right text-[10px] text-muted">
                          {Math.round(cat.percentage * 100)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Progress bars for categories */}
              <View className="gap-2.5">
                {insights.categoryBreakdown.slice(0, 5).map((cat) => {
                  const meta = getCategoryMeta(cat.category);
                  return (
                    <View key={cat.category}>
                      <View className="mb-1 flex-row items-center justify-between">
                        <Text className="text-[11px] text-muted">
                          {meta.label.split(" ")[0]}
                        </Text>
                        <Text className="text-[11px] text-muted">
                          {Math.round(cat.percentage * 100)}%
                        </Text>
                      </View>
                      <View className="progress-bar">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(cat.percentage * 100, 2)}%`,
                            backgroundColor: meta.color,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* AI Insight Card */}
        {showInsight && topInsight && (
          <View className="insight-card mb-4">
            <View className="flex-1">
              <View className="mb-1.5 flex-row items-center gap-1.5">
                <View className="rounded-full bg-brand/20 p-1">
                  <Ionicons name="sparkles" size={12} color="#4be277" />
                </View>
                <Text className="text-[12px] font-semibold text-brand">
                  AI Insight
                </Text>
              </View>
              <Text className="text-[13px] leading-5 text-subtle">
                {topInsight}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowInsight(false)}
              className="ml-2 p-1"
            >
              <Ionicons name="close" size={16} color="#869585" />
            </Pressable>
          </View>
        )}

        {/* Recent Receipts */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-headline-sm">Recent Receipts</Text>
          <Link
            href="/(tabs)/receipts"
            className="text-sm font-semibold text-brand"
          >
            See All
          </Link>
        </View>

        {recent.length === 0 ? (
          <View className="card-dark p-5">
            <View className="items-center py-6">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-surface-high">
                <Ionicons name="receipt-outline" size={28} color="#3d4a3d" />
              </View>
              <Text className="mb-1 text-base font-semibold text-surface-text">
                No receipts yet
              </Text>
              <Text className="text-center text-sm text-muted">
                Scan your first receipt to start tracking expenses.
              </Text>
            </View>
          </View>
        ) : (
          recent.map((receipt) => (
            <DashboardReceiptCard
              key={receipt.id}
              receipt={receipt}
              onPress={() =>
                router.push(`/receipt/${receipt.id}` as Href)
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardReceiptCard({
  receipt,
  onPress,
}: {
  receipt: Receipt;
  onPress: () => void;
}) {
  const category = getCategoryMeta(receipt.category);
  return (
    <Pressable
      onPress={onPress}
      className="mb-2.5 flex-row items-center gap-3 rounded-2xl border border-surface-border bg-surface-container p-3 active:opacity-70"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Ionicons name={category.icon} size={20} color={category.color} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[15px] font-semibold text-surface-text"
          numberOfLines={1}
        >
          {receipt.merchant}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">
          {formatReceiptTime(receipt.date)}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-[15px] font-semibold text-surface-text">
          {formatCurrency(receipt.total, receipt.currency)}
        </Text>
        <View
          className="category-badge"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Text style={{ color: category.color }}>
            {category.label.split(" ")[0].toUpperCase()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
