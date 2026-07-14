import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useReceipts, useTaxDeductibleTotal } from "@/features/receipts/hooks";
import { useThemeColors } from "@/features/settings/hooks";
import { useTaxReport } from "@/features/reports/hooks";
import { generateCsv } from "@/features/reports/service";
import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency, startOfMonth, endOfMonth, isWithinRange, addDays } from "@/lib/utils";

export default function ReportsScreen() {
  const colors = useThemeColors();
  const receipts = useReceipts();
  const taxReport = useTaxReport();
  const taxTotal = useTaxDeductibleTotal();

  const latestReceiptDate = useMemo(() => {
    if (receipts.length === 0) return null;
    const dates = receipts.map((r) => new Date(r.date).getTime());
    return new Date(Math.max(...dates));
  }, [receipts]);

  const [selectedMonthState, setSelectedMonthState] = useState<Date | null>(null);
  const [selectedYearState, setSelectedYearState] = useState<number | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const selectedMonth = selectedMonthState ?? latestReceiptDate ?? new Date();
  const selectedYear = selectedYearState ?? selectedMonth.getFullYear();

  const availableMonths = useMemo(() => {
    const monthsMap = new Map<string, Date>();
    for (const r of receipts) {
      const d = new Date(r.date);
      const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!monthsMap.has(key)) {
        monthsMap.set(key, startOfMonth(d));
      }
    }
    return Array.from(monthsMap.values()).sort((a, b) => b.getTime() - a.getTime());
  }, [receipts]);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    for (const r of receipts) {
      yearsSet.add(new Date(r.date).getFullYear());
    }
    if (yearsSet.size === 0) {
      yearsSet.add(new Date().getFullYear());
    }
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [receipts]);

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

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async () => {
    if (monthReceipts.length === 0) {
      Alert.alert("No Data", "There are no receipts in this period to export.");
      return;
    }
    setIsExporting(true);
    try {
      const csvContent = generateCsv(monthReceipts, {
        dateRange: { start: monthStart.toISOString(), end: monthEnd.toISOString() },
        includeTaxInfo: false,
        includeImages: false,
        format: "csv",
        groupBy: "category",
      });
      const filename = `ReceiptBrain-Report-${monthLabel.replace(/\s+/g, "-")}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Report CSV",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert("Sharing unavailable", "Your device does not support native file sharing.");
      }
    } catch (err) {
      Alert.alert("Export Failed", err instanceof Error ? err.message : "Failed to export CSV report.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (monthReceipts.length === 0) {
      Alert.alert("No Data", "There are no receipts in this period to export.");
      return;
    }
    setIsExporting(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>ReceiptBrain Expense Report - ${monthLabel}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #ffffff; }
              h1 { font-size: 26px; color: #0f172a; margin: 0 0 5px 0; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
              .meta { text-align: right; }
              .meta p { margin: 3px 0; font-size: 13px; color: #64748b; }
              .summary-cards { display: flex; gap: 20px; margin-bottom: 30px; }
              .card { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #f8fafc; }
              .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 0 0 6px 0; letter-spacing: 0.5px; }
              .card-value { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { text-align: left; padding: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1; letter-spacing: 0.5px; }
              td { padding: 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
              .total-row { font-weight: bold; background: #f1f5f9; }
              .badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; }
              .badge-verified { background: #dcfce7; color: #166534; }
              .badge-review { background: #fef3c7; color: #9a3412; }
              .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>ReceiptBrain Expense Report</h1>
                <p style="margin: 0; color: #64748b; font-size: 14px;">Period: ${monthLabel}</p>
              </div>
              <div class="meta">
                <p>Generated: ${new Date().toLocaleDateString()}</p>
                <p>Receipts: ${monthReceipts.length}</p>
              </div>
            </div>

            <div class="summary-cards">
              <div class="card">
                <p class="card-title">Total Spent</p>
                <p class="card-value">${formatCurrency(totalSpent)}</p>
              </div>
              <div class="card">
                <p class="card-title">Tax Deductions</p>
                <p class="card-value">${formatCurrency(potentialDeductions)}</p>
              </div>
              <div class="card">
                <p class="card-title">Est. Tax Savings</p>
                <p class="card-value" style="color: #10b981;">${formatCurrency(estimatedSavings)}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Tax Deductible</th>
                  <th>Status</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${monthReceipts.map(r => `
                  <tr>
                    <td>${new Date(r.date).toLocaleDateString()}</td>
                    <td><strong>${r.merchant}</strong></td>
                    <td>${r.category.toUpperCase()}</td>
                    <td>${r.isTaxDeductible ? "Yes" : "No"}</td>
                    <td>
                      <span class="badge ${r.status === 'verified' ? 'badge-verified' : 'badge-review'}">
                        ${r.status === 'needs_review' ? 'Needs Review' : 'Verified'}
                      </span>
                    </td>
                    <td style="text-align: right; font-weight: 600;">${formatCurrency(r.total, r.currency)}</td>
                  </tr>
                `).join("")}
                <tr class="total-row">
                  <td colspan="5">Total</td>
                  <td style="text-align: right;">${formatCurrency(totalSpent)}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>Report generated via ReceiptBrain. Please consult your tax professional for compliance verification.</p>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Export Report PDF`,
        });
      } else {
        Alert.alert("Sharing unavailable", "Your device does not support native file sharing.");
      }
    } catch (err) {
      Alert.alert("Export Failed", err instanceof Error ? err.message : "Failed to export PDF report.");
    } finally {
      setIsExporting(false);
    }
  };

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
              ReceiptBrain
            </Text>
          </View>
          <View className="icon-40">
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </View>
        </View>

        {/* Title + Edit */}
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-headline-lg">Reports</Text>
          <Pressable className="flex-row items-center gap-1.5">
            <Ionicons name="create-outline" size={16} color={colors.chevron} />
            <Text className="text-sm text-muted">Edit</Text>
          </Pressable>
        </View>

        {/* Monthly Report Card */}
        <View className="card-dark p-5 mb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-body font-semibold">Monthly Report</Text>
            <View className="relative">
              <Pressable
                onPress={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowYearPicker(false);
                }}
                className="flex-row items-center gap-1.5 rounded-full border border-surface-border bg-surface-container px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-on-surface-variant">{monthLabel}</Text>
                <Ionicons name="chevron-down" size={12} color={colors.chevron} />
              </Pressable>
              {showMonthPicker && availableMonths.length > 0 && (
                <View className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-surface-border bg-surface-container p-1 shadow-lg">
                  {availableMonths.map((m) => {
                    const label = m.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                    const isSelected = m.getMonth() === selectedMonth.getMonth() && m.getFullYear() === selectedMonth.getFullYear();
                    return (
                      <Pressable
                        key={label}
                        onPress={() => {
                          setSelectedMonthState(m);
                          setSelectedYearState(m.getFullYear());
                          setShowMonthPicker(false);
                        }}
                        className={`rounded-lg px-3 py-2 ${isSelected ? "bg-brand/15" : ""}`}
                      >
                        <Text className={`text-xs ${isSelected ? "font-semibold text-brand" : "text-surface-text"}`}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
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
            <View className="relative">
              <Pressable
                onPress={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMonthPicker(false);
                }}
                className="flex-row items-center gap-1.5 rounded-full border border-surface-border bg-surface-container px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-on-surface-variant">{selectedYear}</Text>
                <Ionicons name="chevron-down" size={12} color={colors.chevron} />
              </Pressable>
              {showYearPicker && availableYears.length > 0 && (
                <View className="absolute right-0 top-10 z-50 w-28 rounded-xl border border-surface-border bg-surface-container p-1 shadow-lg">
                  {availableYears.map((y) => {
                    const isSelected = y === selectedYear;
                    return (
                      <Pressable
                        key={y}
                        onPress={() => {
                          setSelectedYearState(y);
                          setShowYearPicker(false);
                        }}
                        className={`rounded-lg px-3 py-2 ${isSelected ? "bg-brand/15" : ""}`}
                      >
                        <Text className={`text-xs ${isSelected ? "font-semibold text-brand" : "text-surface-text"}`}>
                          {y}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
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
            <Pressable
              onPress={handleExportPdf}
              disabled={isExporting}
              className="flex-row items-center gap-3 border-b border-surface-border px-4 py-4 active:opacity-70"
            >
              <View className="w-10 h-10 items-center justify-center rounded-xl bg-red-500/10">
                <Ionicons name="document-text-outline" size={20} color="#ef4444" />
              </View>
              <Text className="flex-1 text-sm font-medium text-surface-text">Export as PDF</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.chevron} />
            </Pressable>
            <Pressable
              onPress={handleExportCsv}
              disabled={isExporting}
              className="flex-row items-center gap-3 px-4 py-4 active:opacity-70"
            >
              <View className="w-10 h-10 items-center justify-center rounded-xl bg-green-500/10">
                <Ionicons name="document-outline" size={20} color={colors.brand} />
              </View>
              <Text className="flex-1 text-sm font-medium text-surface-text">Export as CSV</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.chevron} />
            </Pressable>
          </View>
        </View>

        {/* Tax Ready Banner */}
        <View className="flex-row items-start gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4">
          <View className="mt-0.5 w-6 h-6 items-center justify-center rounded-full bg-brand/20">
            <Ionicons name="checkmark-circle" size={16} color={colors.brand} />
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
