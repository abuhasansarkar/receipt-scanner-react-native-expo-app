import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useReceipts, useTaxDeductibleTotal } from "@/features/receipts/hooks";
import { useTaxReport } from "@/features/reports/hooks";
import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency, startOfMonth, endOfMonth, isWithinRange, addDays } from "@/lib/utils";

export default function ReportsScreen() {
  const receipts = useReceipts();
  const taxReport = useTaxReport();
  const taxTotal = useTaxDeductibleTotal();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthReceipts = useMemo(
    () => receipts.filter((r) => isWithinRange(r.date, monthStart, monthEnd)),
    [receipts, monthStart, monthEnd]
  );

  const totalSpent = useMemo(
    () => monthReceipts.reduce((sum, r) => sum + r.total, 0),
    [monthReceipts]
  );

  const prevMonthStart = startOfMonth(addDays(monthStart, -1));
  const prevMonthEnd = endOfMonth(prevMonthStart);
  const prevMonthTotal = useMemo(
    () =>
      receipts
        .filter((r) => isWithinRange(r.date, prevMonthStart, prevMonthEnd))
        .reduce((sum, r) => sum + r.total, 0),
    [receipts, prevMonthStart, prevMonthEnd]
  );

  const changePercent = prevMonthTotal > 0
    ? Math.round(((totalSpent - prevMonthTotal) / prevMonthTotal) * 100)
    : 0;

  const weeklyData = useMemo(() => {
    const weeks: { label: string; total: number }[] = [];
    const weekLabels = ["1", "7", "14", "21", "28"];
    for (let i = 0; i < weekLabels.length; i++) {
      const start = addDays(monthStart, parseInt(weekLabels[i]) - 1);
      const end = i < weekLabels.length - 1
        ? addDays(monthStart, parseInt(weekLabels[i + 1]) - 1)
        : monthEnd;
      const weekTotal = monthReceipts
        .filter((r) => isWithinRange(r.date, start, end))
        .reduce((sum, r) => sum + r.total, 0);
      weeks.push({ label: weekLabels[i], total: weekTotal });
    }
    return weeks;
  }, [monthReceipts, monthStart, monthEnd]);

  const maxWeek = Math.max(...weeklyData.map((w) => w.total), 1);

  const deductibleCategories = useMemo(() => {
    const categories = new Map<string, number>();
    for (const r of receipts.filter((r) => r.isTaxDeductible && new Date(r.date).getFullYear() === selectedYear)) {
      const meta = getCategoryMeta(r.category);
      categories.set(meta.label, (categories.get(meta.label) ?? 0) + r.total);
    }
    return Array.from(categories.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [receipts, selectedYear]);

  const potentialDeductions = deductibleCategories.reduce((sum, c) => sum + c.total, 0);
  const estimatedSavings = Math.round(potentialDeductions * 0.24 * 100) / 100;

  const monthLabel = selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const prevMonthLabel = addDays(monthStart, -1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const yLabels = useMemo(() => {
    const step = Math.ceil(maxWeek / 4);
    return [0, step, step * 2, step * 3, maxWeek].map((v) => {
      if (v >= 1000) return `${Math.round(v / 1000)}k`;
      return String(Math.round(v));
    });
  }, [maxWeek]);

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-2 mb-5">
          <View className="flex-row items-center gap-3">
            <View className="header-avatar">
              <Text className="text-sm font-semibold text-brand">U</Text>
            </View>
            <Text className="text-lg font-bold tracking-tight text-brand">
              AuraReceipt
            </Text>
          </View>
          <View className="icon-40">
            <Ionicons name="notifications-outline" size={20} color="#dce5d9" />
          </View>
        </View>

        {/* Title + Edit */}
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-headline-lg">Reports</Text>
          <Pressable className="flex-row items-center gap-1.5">
            <Ionicons name="create-outline" size={16} color="#869585" />
            <Text className="text-sm text-muted">Edit</Text>
          </Pressable>
        </View>

        {/* Monthly Report Card */}
        <View className="card-dark p-5 mb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-body font-semibold">Monthly Report</Text>
            <Pressable className="flex-row items-center gap-1.5 rounded-full border border-surface-border bg-surface-container px-3 py-1.5">
              <Text className="text-xs font-semibold text-on-surface-variant">{monthLabel}</Text>
              <Ionicons name="chevron-down" size={12} color="#869585" />
            </Pressable>
          </View>

          <Text className="mb-1 text-[28px] font-bold text-surface-text leading-8">
            {formatCurrency(totalSpent)}
          </Text>
          <View className="mb-5 flex-row items-center gap-1.5">
            <Text className="text-sm text-muted">Total Spent</Text>
            {changePercent !== 0 && (
              <View className="flex-row items-center gap-0.5">
                <Ionicons
                  name={changePercent > 0 ? "arrow-up" : "arrow-down"}
                  size={12}
                  color={changePercent > 0 ? "#f59e0b" : "#4be277"}
                />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: changePercent > 0 ? "#f59e0b" : "#4be277" }}
                >
                  {Math.abs(changePercent)}% vs {prevMonthLabel}
                </Text>
              </View>
            )}
          </View>

          {/* Bar Chart with Y-axis */}
          <View className="flex-row" style={{ height: 140 }}>
            {/* Y-axis labels */}
            <View className="justify-between pr-2" style={{ width: 28 }}>
              {yLabels.reverse().map((label, i) => (
                <Text key={i} className="text-[9px] text-muted text-right">
                  {label}
                </Text>
              ))}
            </View>
            {/* Bars */}
            <View className="flex-1 justify-end">
              <View className="flex-row items-end gap-2">
                {weeklyData.map((week, i) => (
                  <View key={i} className="flex-1 items-center">
                    <View
                      className="bar-chart-bar w-full"
                      style={{
                        height: `${Math.max((week.total / maxWeek) * 100, 4)}%`,
                        backgroundColor: week.total > 0 ? "#4be277" : "#2f372e",
                      }}
                    />
                  </View>
                ))}
              </View>
              {/* X-axis labels */}
              <View className="flex-row mt-2">
                {weeklyData.map((week, i) => (
                  <Text key={i} className="flex-1 text-center text-[10px] text-muted">
                    {week.label}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Tax Summary Card */}
        <View className="card-dark p-5 mb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-body font-semibold">Tax Summary</Text>
            <Pressable className="flex-row items-center gap-1.5 rounded-full border border-surface-border bg-surface-container px-3 py-1.5">
              <Text className="text-xs font-semibold text-on-surface-variant">{selectedYear}</Text>
              <Ionicons name="chevron-down" size={12} color="#869585" />
            </Pressable>
          </View>

          <View className="mb-5 flex-row gap-6">
            <View className="flex-1">
              <Text className="mb-1 text-xs text-muted">Potential Deductions</Text>
              <Text className="text-xl font-bold text-surface-text">
                {formatCurrency(potentialDeductions)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-xs text-muted">Estimated Tax Savings</Text>
              <Text className="text-xl font-bold text-brand">
                {formatCurrency(estimatedSavings)}
              </Text>
            </View>
          </View>

          {deductibleCategories.length > 0 && (
            <>
              <Text className="mb-3 text-label-caps">
                Deductible Categories
              </Text>
              <View className="gap-3">
                {deductibleCategories.map((cat) => {
                  const meta = getCategoryMeta(
                    cat.category.toLowerCase().includes("office")
                      ? "office"
                      : cat.category.toLowerCase().includes("travel")
                      ? "travel"
                      : cat.category.toLowerCase().includes("software")
                      ? "software"
                      : "other"
                  );
                  return (
                    <View key={cat.category} className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2.5">
                        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                        <Text className="text-sm text-surface-text">{cat.category}</Text>
                      </View>
                      <Text className="text-sm text-on-surface-variant">
                        {formatCurrency(cat.total)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Export Report */}
        <View className="mb-4">
          <Text className="mb-3 px-1 text-body font-semibold">Export Report</Text>
          <View className="card-dark overflow-hidden">
            <Pressable className="flex-row items-center gap-3 border-b border-surface-border px-4 py-4 active:opacity-70">
              <View className="w-10 h-10 items-center justify-center rounded-xl bg-red-500/10">
                <Ionicons name="document-text-outline" size={20} color="#ef4444" />
              </View>
              <Text className="flex-1 text-sm font-medium text-surface-text">Export as PDF</Text>
              <Ionicons name="chevron-forward" size={18} color="#5a6d5a" />
            </Pressable>
            <Pressable className="flex-row items-center gap-3 px-4 py-4 active:opacity-70">
              <View className="w-10 h-10 items-center justify-center rounded-xl bg-green-500/10">
                <Ionicons name="document-outline" size={20} color="#22c55e" />
              </View>
              <Text className="flex-1 text-sm font-medium text-surface-text">Export as CSV</Text>
              <Ionicons name="chevron-forward" size={18} color="#5a6d5a" />
            </Pressable>
          </View>
        </View>

        {/* Tax Ready Banner */}
        <View className="flex-row items-start gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4">
          <View className="mt-0.5 w-6 h-6 items-center justify-center rounded-full bg-brand/20">
            <Ionicons name="checkmark-circle" size={16} color="#4be277" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-surface-text">This report is tax-ready.</Text>
            <Text className="mt-0.5 text-xs text-muted">Consult your accountant for final advice.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
