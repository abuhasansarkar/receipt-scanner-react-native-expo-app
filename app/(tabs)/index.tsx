import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { Button } from "@/components/ui/Button";
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
    { label: "Mon", value: monthly.dailyAverage, color: "#22c55e" },
    { label: "Tue", value: monthly.dailyAverage * 0.8, color: "#22c55e" },
    { label: "Wed", value: monthly.dailyAverage * 1.2, color: "#22c55e" },
    { label: "Thu", value: monthly.dailyAverage * 0.9, color: "#22c55e" },
    { label: "Fri", value: monthly.dailyAverage * 1.1, color: "#22c55e" },
    { label: "Sat", value: monthly.dailyAverage * 0.5, color: "#22c55e" },
    { label: "Sun", value: monthly.dailyAverage * 0.3, color: "#22c55e" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-6 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-zinc-500">Welcome back</Text>
            <Text className="text-2xl font-bold text-white">ReceiptBrain</Text>
          </View>
          <View className="flex-row items-center gap-3">
            {statusCounts.needs_review > 0 && (
              <View className="relative">
                <Ionicons name="eye-outline" size={22} color="#f59e0b" />
                <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                  <Text className="text-[9px] font-bold text-black">{statusCounts.needs_review}</Text>
                </View>
              </View>
            )}
            <Ionicons name="sparkles-outline" size={26} color="#22c55e" />
          </View>
        </View>

        <View className="mb-4 flex-row gap-3">
          <Card className="flex-1">
            <Text className="text-xs uppercase tracking-wide text-zinc-500">This week</Text>
            <Text className="mt-1 text-2xl font-bold text-white">{formatCurrencyShort(weekly.weekTotal)}</Text>
            {weekly.changeVsLastWeek !== 0 && (
              <Text className={`mt-0.5 text-xs ${weekly.changeVsLastWeek > 0 ? "text-amber-400" : "text-brand-500"}`}>
                {weekly.changeVsLastWeek >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(Math.round(weekly.changeVsLastWeek * 100))}%
              </Text>
            )}
          </Card>
          <Card className="flex-1">
            <Text className="text-xs uppercase tracking-wide text-zinc-500">This month</Text>
            <Text className="mt-1 text-2xl font-bold text-white">{formatCurrencyShort(monthly.monthTotal)}</Text>
            {monthly.projectedTotal > monthly.monthTotal && (
              <Text className="mt-0.5 text-xs text-zinc-500">Projected: {formatCurrencyShort(monthly.projectedTotal)}</Text>
            )}
          </Card>
        </View>

        {weekly.alerts.length > 0 && (
          <Card className="mb-4 border-amber-500/30 bg-amber-500/10">
            {weekly.alerts.slice(0, 2).map((alert, i) => (
              <View key={i} className="flex-row items-center gap-2">
                <Ionicons name="alert-circle-outline" size={14} color="#f59e0b" />
                <Text className="flex-1 text-xs text-amber-200">{alert}</Text>
              </View>
            ))}
          </Card>
        )}

        <Card className="mb-4">
          <Text className="mb-3 text-xs uppercase tracking-wide text-zinc-500">Weekly trend</Text>
          <ExpenseChart data={trendData} height={100} />
        </Card>

        <Button
          label="Scan a receipt"
          icon={<Ionicons name="camera" size={18} color="#000000" />}
          onPress={() => router.push("/(tabs)/scan")}
        />

        <View className="mb-3 mt-8 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-white">Recent receipts</Text>
          <Link href="/(tabs)/receipts" className="text-sm text-brand-500">See all</Link>
        </View>

        {recent.length === 0 ? (
          <Card>
            <Text className="text-center text-sm text-zinc-500">No receipts yet. Scan your first one to get started.</Text>
          </Card>
        ) : (
          recent.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} onPress={() => router.push(`/receipt/${receipt.id}` as Href)} />
          ))
        )}

        {taxTotal > 0 && (
          <Card className="mt-4 border-brand-500/20 bg-brand-500/5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="receipt-outline" size={16} color="#22c55e" />
                <Text className="text-sm font-medium text-white">Tax deductible total</Text>
              </View>
              <Text className="text-base font-bold text-brand-500">{formatCurrency(taxTotal)}</Text>
            </View>
            <ProgressBar value={taxTotal} max={monthly.monthTotal || 1} color="#22c55e" className="mt-2" />
            <Text className="mt-1 text-[10px] text-zinc-500">Track deductible expenses for tax season</Text>
          </Card>
        )}

        <View className="mt-4 flex-row gap-3">
          <Card className="flex-1">
            <Text className="text-xs text-zinc-500">Total scans</Text>
            <Text className="text-lg font-bold text-white">{totalScans}</Text>
            <ProgressBar value={totalScans} max={FREE_PLAN_MONTHLY_SCAN_LIMIT} color="#22c55e" className="mt-2" height={4} />
            <Text className="mt-1 text-[10px] text-zinc-500">{FREE_PLAN_MONTHLY_SCAN_LIMIT - totalScans} free scans left</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-xs text-zinc-500">Need review</Text>
            <Text className="text-lg font-bold text-amber-400">{statusCounts.needs_review}</Text>
            <Text className="mt-1 text-[10px] text-zinc-500">{statusCounts.verified} verified</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
