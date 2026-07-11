import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DonutChart } from "@/components/charts/DonutChart";
import { useAuth } from "@/features/auth/hooks";
import { useMonthlyInsights, useWeeklyInsights } from "@/features/insights/hooks";
import { useReceipts } from "@/features/receipts/hooks";
import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";

function formatReceiptTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const receipts = useReceipts();
  const weekly = useWeeklyInsights();
  const monthly = useMonthlyInsights();

  const [timePeriod, setTimePeriod] = useState<"week" | "month">("week");
  const [showInsight, setShowInsight] = useState(true);

  const insights = timePeriod === "week" ? weekly : monthly;
  const recent = receipts.slice(0, 5);
  const totalSpending = timePeriod === "week" ? weekly.weekTotal : monthly.monthTotal;
  const trendPercentage = timePeriod === "week" ? weekly.changeVsLastWeek : monthly.changeVsLastMonth;
  const trendLabel = timePeriod === "week" ? "vs last week" : "vs last month";

  const topInsight = useMemo(() => weekly.alerts[0] ?? null, [weekly.alerts]);
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const trendUp = trendPercentage > 0;
  const trendColor = trendUp ? "#f59e0b" : "#4be277";

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-2 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="header-avatar">
              <Text className="text-sm font-semibold text-brand">{userInitial}</Text>
            </View>
            <Text className="text-lg font-bold tracking-tight text-brand">
              AuraReceipt
            </Text>
          </View>
          <View className="icon-40">
            <Ionicons name="notifications-outline" size={20} color="#dce5d9" />
          </View>
        </View>

        {/* Title + Toggle */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-headline-lg">Dashboard</Text>
          <View className="flex-row rounded-full border border-surface-border bg-surface-container p-0.5">
            <Pressable
              onPress={() => setTimePeriod("week")}
              className={`rounded-full px-3.5 py-1.5 ${
                timePeriod === "week" ? "bg-brand" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  timePeriod === "week" ? "text-on-primary" : "text-muted"
                }`}
              >
                This Week
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTimePeriod("month")}
              className={`rounded-full px-3.5 py-1.5 ${
                timePeriod === "month" ? "bg-brand" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  timePeriod === "month" ? "text-on-primary" : "text-muted"
                }`}
              >
                This Month
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Total Spending */}
        <View className="mb-5">
          <Text className="text-label-caps mb-1">Total Spending</Text>
          <Text className="text-[34px] font-bold text-surface-text leading-[40px] tracking-tight">
            {formatCurrency(totalSpending)}
          </Text>
          {trendPercentage !== 0 && (
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name={trendUp ? "trending-up" : "trending-down"} size={14} color={trendColor} />
              <Text className="text-sm font-medium" style={{ color: trendColor }}>
                {trendUp ? "+" : ""}{Math.abs(Math.round(trendPercentage * 100))}% {trendLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Category Breakdown Card */}
        <View className="card-dark p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-body font-semibold">Category Breakdown</Text>
            <Ionicons name="ellipsis-horizontal" size={20} color="#869585" />
          </View>
          <View className="flex-row items-center gap-5">
            <DonutChart
              data={insights.categoryBreakdown.map((cat) => ({
                value: cat.total,
                color: getCategoryMeta(cat.category).color,
                label: getCategoryMeta(cat.category).label,
              }))}
              size={120}
              strokeWidth={12}
            />
            <View className="flex-1 gap-2.5">
              {insights.categoryBreakdown.slice(0, 5).map((cat) => {
                const meta = getCategoryMeta(cat.category);
                return (
                  <View key={cat.category} className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    <Text className="flex-1 text-[13px] font-medium text-subtle" numberOfLines={1}>
                      {meta.label.split(" ")[0]}
                    </Text>
                    <Text className="text-[13px] font-semibold text-surface-text">
                      {formatCurrency(cat.total)}
                    </Text>
                    <Text className="w-9 text-right text-[11px] text-muted">
                      {Math.round(cat.percentage * 100)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* AI Insight Card */}
        {showInsight && topInsight && (
          <View className="insight-card mb-5">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="sparkles" size={16} color="#4be277" />
                <Text className="text-[13px] font-semibold text-brand">AI Insight</Text>
              </View>
              <Text className="text-[13px] leading-5 text-subtle">{topInsight}</Text>
            </View>
            <Pressable onPress={() => setShowInsight(false)} className="p-1 ml-2">
              <Ionicons name="close" size={18} color="#869585" />
            </Pressable>
          </View>
        )}

        {/* Recent Receipts */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-headline-sm">Recent Receipts</Text>
          <Link href="/(tabs)/receipts" className="text-sm font-semibold text-brand">See All</Link>
        </View>

        {recent.length === 0 ? (
          <View className="card-dark p-5">
            <View className="items-center py-5">
              <View className="w-12 h-12 rounded-full bg-surface-high items-center justify-center mb-3">
                <Ionicons name="receipt-outline" size={24} color="#3d4a3d" />
              </View>
              <Text className="text-center text-sm text-muted">
                No receipts yet. Scan your first one to get started.
              </Text>
            </View>
          </View>
        ) : (
          recent.map((receipt) => (
            <DashboardReceiptCard
              key={receipt.id}
              receipt={receipt}
              onPress={() => router.push(`/receipt/${receipt.id}` as Href)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardReceiptCard({ receipt, onPress }: { receipt: Receipt; onPress: () => void }) {
  const category = getCategoryMeta(receipt.category);
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-surface-border bg-surface-container p-3 mb-2.5 active:opacity-70"
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Ionicons name={category.icon} size={20} color={category.color} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-surface-text" numberOfLines={1}>
          {receipt.merchant}
        </Text>
        <Text className="text-xs text-muted mt-0.5">{formatReceiptTime(receipt.date)}</Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-[15px] font-semibold text-surface-text">
          {formatCurrency(receipt.total, receipt.currency)}
        </Text>
        <View className="category-badge" style={{ backgroundColor: `${category.color}20` }}>
          <Text style={{ color: category.color }}>
            {category.label.split(" ")[0].toUpperCase()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
