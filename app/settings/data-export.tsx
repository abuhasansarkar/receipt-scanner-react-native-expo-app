import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useReceipts } from "@/features/receipts/hooks";
import { useReceiptStore } from "@/features/receipts/store";
import { useThemeColors } from "@/features/settings/hooks";
import { formatCurrency } from "@/lib/utils";
import { generateCsv } from "@/features/reports/service";
import { NotificationService } from "@/features/notifications/service";
import type { Receipt } from "@/types/receipt";

export default function DataExportScreen() {
  const colors = useThemeColors();
  const receipts = useReceipts();
  const store = useReceiptStore();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const stats = useMemo(() => {
    const totalCount = receipts.length;
    const totalsByCurrency = new Map<string, number>();
    for (const r of receipts) {
      totalsByCurrency.set(r.currency, (totalsByCurrency.get(r.currency) ?? 0) + r.total);
    }
    const currencySummary = Array.from(totalsByCurrency.entries())
      .map(([curr, sum]) => `${curr} ${sum.toFixed(2)}`)
      .join(", ");

    return {
      totalCount,
      currencySummary: currencySummary || "None",
    };
  }, [receipts]);

  // Export JSON Backup
  const handleExportJson = async () => {
    if (receipts.length === 0) {
      Alert.alert("No Receipts", "You don't have any receipts to export.");
      return;
    }
    setLoadingMessage("Generating backup JSON...");
    setLoading(true);
    try {
      const data = JSON.stringify(receipts, null, 2);
      const filename = `ReceiptBrain-Backup-${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, data, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export JSON Backup",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Export Failed", error instanceof Error ? error.message : "Could not export backup.");
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    if (receipts.length === 0) {
      Alert.alert("No Receipts", "You don't have any receipts to export.");
      return;
    }
    setLoadingMessage("Generating CSV sheet...");
    setLoading(true);
    try {
      const csvContent = generateCsv(receipts, {
        dateRange: { start: new Date(0).toISOString(), end: new Date().toISOString() },
        includeTaxInfo: false,
        includeImages: false,
        format: "csv",
        groupBy: "category",
      });
      const filename = `ReceiptBrain-Export-${new Date().toISOString().split("T")[0]}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export CSV Report",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Export Failed", error instanceof Error ? error.message : "Could not export CSV.");
    } finally {
      setLoading(false);
    }
  };

  // Export PDF ledger report
  const handleExportPdf = async () => {
    if (receipts.length === 0) {
      Alert.alert("No Receipts", "You don't have any receipts to export.");
      return;
    }
    setLoadingMessage("Generating PDF report...");
    setLoading(true);
    try {
      const totalSpentFormatted = receipts
        .reduce((sum, r) => sum + r.total, 0)
        .toFixed(2);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>ReceiptBrain All Receipts Audit Ledger</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; margin: 0; background: #ffffff; }
              h1 { font-size: 24px; color: #0f172a; margin: 0 0 10px 0; }
              .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
              .summary { font-size: 13px; color: #64748b; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th { text-align: left; padding: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1; }
              td { padding: 10px; font-size: 11px; border-bottom: 1px solid #e2e8f0; }
              .total-row { font-weight: bold; background: #f8fafc; }
              .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>ReceiptBrain Expense Ledger</h1>
                <div class="summary">Total scanned receipts: ${receipts.length}</div>
              </div>
              <div style="text-align: right; font-size: 12px; color: #64748b;">
                Generated: ${new Date().toLocaleDateString()}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Tax Ded.</th>
                  <th>Status</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${receipts.map(r => `
                  <tr>
                    <td>${new Date(r.date).toLocaleDateString()}</td>
                    <td><strong>${r.merchant}</strong></td>
                    <td>${r.category.toUpperCase()}</td>
                    <td>${r.source.toUpperCase()}</td>
                    <td>${r.isTaxDeductible ? "Yes" : "No"}</td>
                    <td>${r.status === 'verified' ? 'Verified' : 'Review'}</td>
                    <td style="text-align: right; font-weight: 600;">${r.currency} ${r.total.toFixed(2)}</td>
                  </tr>
                `).join("")}
                <tr class="total-row">
                  <td colspan="6">Rough Cumulative Total (All Currencies Mixed)</td>
                  <td style="text-align: right; font-weight: bold;">${totalSpentFormatted}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>Generated via ReceiptBrain Offline Export Utility.</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Export Ledger PDF",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Export Failed", error instanceof Error ? error.message : "Could not export PDF.");
    } finally {
      setLoading(false);
    }
  };

  // Import JSON Backup
  const handleImportJson = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) return;

      setLoadingMessage("Importing data backup...");
      setLoading(true);

      const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsed = JSON.parse(content);

      if (!Array.isArray(parsed)) {
        throw new Error("Backup file content is invalid. Must be a JSON array of receipts.");
      }

      // Quick validation check
      const isValid = parsed.every(
        (r: any) =>
          typeof r.merchant === "string" &&
          typeof r.total === "number" &&
          typeof r.category === "string" &&
          typeof r.currency === "string" &&
          typeof r.date === "string"
      );

      if (!isValid) {
        throw new Error("Some items in the backup file did not match the required receipt schema.");
      }

      // Merge records in
      let mergedCount = 0;
      for (const item of parsed) {
        store.addOrReplaceReceipt(item as Receipt);
        mergedCount++;
      }

      setLoading(false);
      Alert.alert(
        "Import Success",
        `Successfully merged ${mergedCount} receipts from backup file into your local store!`
      );
      
      await NotificationService.sendLocalNotification(
        "Import Successful 🧾",
        `${mergedCount} receipts were restored and merged into your local repository.`
      );
    } catch (error) {
      setLoading(false);
      Alert.alert("Import Failed", error instanceof Error ? error.message : "Could not parse backup file.");
    }
  };

  // Clear all receipts
  const handleClearAllData = () => {
    Alert.alert(
      "Clear Database",
      "Are you absolutely sure you want to delete all local receipts? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This will permanently purge your offline records. Press CONFIRM to delete.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "CONFIRM",
                  style: "destructive",
                  onPress: () => {
                    setLoadingMessage("Wiping database...");
                    setLoading(true);
                    try {
                      // Remove images dynamically if uri present
                      const localReceipts = store.receipts;
                      for (const r of localReceipts) {
                        if (r.imageUri && r.imageUri.startsWith("file://")) {
                          FileSystem.deleteAsync(r.imageUri, { idempotent: true }).catch(() => {});
                        }
                      }
                      
                      // Wipe store array
                      useReceiptStore.setState({ receipts: [] });
                      
                      Alert.alert("Database Reset", "All local receipts and cached scan attachments have been permanently deleted.");
                    } catch (err) {
                      Alert.alert("Reset Failed", err instanceof Error ? err.message : "Could not wipe database.");
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["bottom"]}>
      {loading ? (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/60">
          <View className="items-center rounded-2xl border border-surface-border bg-surface-container p-6">
            <ActivityIndicator size="large" color={colors.brand} />
            <Text className="mt-3 text-sm font-semibold text-surface-text">
              {loadingMessage || "Please wait..."}
            </Text>
          </View>
        </View>
      ) : null}

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Intro Stats */}
        <View className="px-5 py-6">
          <View 
            className="w-16 h-16 rounded-3xl items-center justify-center mb-4 mx-auto"
            style={{ backgroundColor: colors.isDark ? "#242c24" : "#f1f5f9" }}
          >
            <Ionicons name="download-outline" size={32} color={colors.brand} />
          </View>
          <Text className="text-xl font-bold text-surface-text mb-2 text-center">
            Data & Export
          </Text>
          <Text className="text-sm text-muted text-center max-w-xs mx-auto mb-6">
            Backup and restore your local receipt repository or share standard spreadsheet and document audits.
          </Text>

          {/* Stats Box */}
          <View className="card-surface items-center p-5">
            <Text className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
              Total Receipts Tracked
            </Text>
            <Text className="text-3xl font-extrabold text-brand mb-2">
              {stats.totalCount}
            </Text>
            <Text className="text-xs text-center text-subtle leading-4">
              Value Breakdown: {stats.currencySummary}
            </Text>
          </View>
        </View>

        {/* Backups Section */}
        <Text className="section-label px-5">System Backups</Text>
        <View className="settings-group">
          {/* Export JSON */}
          <Pressable onPress={handleExportJson} className="settings-row active:opacity-75">
            <Ionicons name="cloud-upload-outline" size={22} color={colors.text} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-surface-text">Export JSON Backup</Text>
              <Text className="text-xs text-muted mt-0.5">Creates a complete JSON data clone for backup</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.chevron} />
          </Pressable>

          {/* Import JSON */}
          <Pressable onPress={handleImportJson} className="settings-row-border active:opacity-75">
            <Ionicons name="cloud-download-outline" size={22} color={colors.text} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-surface-text">Import JSON Backup</Text>
              <Text className="text-xs text-muted mt-0.5">Select a JSON backup file to restore receipts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.chevron} />
          </Pressable>
        </View>

        {/* Report Exports Section */}
        <Text className="section-label px-5 mt-4">Document Exports</Text>
        <View className="settings-group">
          {/* Export CSV */}
          <Pressable onPress={handleExportCsv} className="settings-row active:opacity-75">
            <Ionicons name="grid-outline" size={20} color={colors.text} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-surface-text">Export All to CSV</Text>
              <Text className="text-xs text-muted mt-0.5">Spreadsheet table of all record entries</Text>
            </View>
            <Ionicons name="share-outline" size={18} color={colors.chevron} />
          </Pressable>

          {/* Export PDF */}
          <Pressable onPress={handleExportPdf} className="settings-row-border active:opacity-75">
            <Ionicons name="document-text-outline" size={20} color={colors.text} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-surface-text">Export Audit Ledger PDF</Text>
              <Text className="text-xs text-muted mt-0.5">A complete, printable PDF expense document</Text>
            </View>
            <Ionicons name="share-outline" size={18} color={colors.chevron} />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <Text className="section-label px-5 mt-4 text-red-500">Danger Zone</Text>
        <View className="settings-group border-red-500/20 bg-red-500/5">
          <Pressable onPress={handleClearAllData} className="settings-row active:opacity-75">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-red-500">Reset Local Database</Text>
              <Text className="text-xs text-red-400/80 mt-0.5">Wipes all local records and cached receipts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ef4444" />
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
