import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReceiptForm } from "@/components/receipt/ReceiptForm";
import { Card } from "@/components/ui/Card";
import { useReceipt, useReceiptActions } from "@/features/receipts/hooks";
import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency, formatDate, formatDateShort, formatRelativeDate } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const receipt = useReceipt(id);
  const { updateReceipt, removeReceipt } = useReceiptActions();
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);

  if (!receipt) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <Ionicons name="receipt-outline" size={48} color="#52525b" />
        <Text className="mt-4 text-lg font-semibold text-white">Receipt not found</Text>
        <Text className="mt-1 text-sm text-zinc-500">It may have been deleted.</Text>
      </SafeAreaView>
    );
  }

  const category = getCategoryMeta(receipt.category);
  const needsReview = receipt.status === "needs_review";
  const lowConfidenceFields = getLowConfidenceFields(receipt);

  const handleSave = (data: Partial<Receipt>) => {
    updateReceipt(receipt.id, { ...data, status: "verified" });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Delete receipt", `Remove ${receipt.merchant} receipt? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { removeReceipt(receipt.id); router.back(); } },
    ]);
  };

  const handleApplySuggestion = (field: string, value: string) => {
    updateReceipt(receipt.id, { [field]: value });
  };

  const dismissSuggestions = () => setShowAiSuggestions(false);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {receipt.imageUri && (
          <View className="h-56 w-full bg-black">
            <View className="h-full w-full items-center justify-center bg-surface-raised">
              <Ionicons name="image-outline" size={32} color="#52525b" />
              <Text className="mt-1 text-xs text-zinc-500">Receipt image</Text>
            </View>
          </View>
        )}

        {needsReview && (
          <Card className="mx-5 mb-3 mt-4 border-amber-500/30 bg-amber-500/10">
            <View className="flex-row items-center gap-2">
              <Ionicons name="eye-outline" size={16} color="#f59e0b" />
              <Text className="flex-1 text-sm text-amber-200">Review required — some fields need your attention</Text>
            </View>
          </Card>
        )}

        {lowConfidenceFields.length > 0 && showAiSuggestions && (
          <Card className="mx-5 mb-3 border-brand-500/20 bg-brand-500/5">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="sparkles-outline" size={16} color="#22c55e" />
                <Text className="text-sm font-semibold text-white">AI Suggestions</Text>
              </View>
              <Pressable onPress={dismissSuggestions}>
                <Ionicons name="close-outline" size={18} color="#71717a" />
              </Pressable>
            </View>
            {lowConfidenceFields.map((s) => (
              <Pressable
                key={s.field}
                onPress={() => handleApplySuggestion(s.field, s.suggestion)}
                className="mb-2 rounded-xl border border-surface-border bg-surface-raised p-3 active:opacity-70"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-medium uppercase tracking-wide text-zinc-400">{s.field}</Text>
                  <View className="rounded-full bg-brand-500/15 px-2 py-0.5">
                    <Text className="text-[10px] text-brand-500">Tap to apply</Text>
                  </View>
                </View>
                <Text className="mt-1 text-sm text-zinc-400 line-through">{s.originalValue}</Text>
                <Text className="text-sm font-semibold text-white">{s.suggestion}</Text>
                <Text className="mt-0.5 text-[10px] text-zinc-500">{s.reason}</Text>
              </Pressable>
            ))}
          </Card>
        )}

        <View className="flex-row items-center gap-3 px-5 pb-3 pt-4">
          <View style={{ backgroundColor: `${category.color}20` }} className="h-12 w-12 items-center justify-center rounded-xl">
            <Ionicons name={category.icon} size={22} color={category.color} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">{receipt.merchant}</Text>
            <Text className="text-sm text-zinc-500">
              {category.label} \u00B7 {formatRelativeDate(receipt.date)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-white">{formatCurrency(receipt.total, receipt.currency)}</Text>
            {receipt.isTaxDeductible && (
              <View className="mt-1 rounded-full bg-brand-500/15 px-2 py-0.5">
                <Text className="text-[10px] font-semibold text-brand-500">Tax deductible</Text>
              </View>
            )}
          </View>
        </View>

        <ReceiptForm
          receipt={receipt}
          onSave={handleSave}
          onDelete={handleDelete}
        />

        {receipt.items && receipt.items.length > 0 && (
          <View className="px-5 pt-4">
            <Text className="mb-2 text-sm font-semibold text-white">Line items</Text>
            <Card className="gap-0 p-0">
              {receipt.items.map((item, index) => (
                <View
                  key={item.id}
                  className={`flex-row items-center justify-between px-4 py-3 ${index !== receipt.items!.length - 1 ? "border-b border-surface-border" : ""}`}
                >
                  <View className="flex-1">
                    <Text className="text-sm text-white">{item.name}</Text>
                    {item.quantity && item.quantity > 1 && (
                      <Text className="text-xs text-zinc-500">Qty: {item.quantity}</Text>
                    )}
                  </View>
                  <Text className="text-sm font-medium text-white">
                    {formatCurrency(item.price * (item.quantity ?? 1), receipt.currency)}
                  </Text>
                </View>
              ))}
              <View className="flex-row items-center justify-between border-t border-surface-border px-4 py-3">
                <Text className="text-sm font-semibold text-white">Total</Text>
                <Text className="text-base font-bold text-white">
                  {formatCurrency(receipt.total, receipt.currency)}
                </Text>
              </View>
            </Card>
          </View>
        )}

        <View className="gap-2 px-5 pt-4">
          <Card>
            <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Details</Text>
            <DetailRow label="Date" value={formatDate(receipt.date)} />
            <DetailRow label="Status" value={receipt.status.replace("_", " ")} />
            <DetailRow label="Source" value={receipt.source} />
            <DetailRow label="Created" value={formatDate(receipt.createdAt)} />
            {receipt.receiptNumber && <DetailRow label="Receipt #" value={receipt.receiptNumber} />}
            {receipt.tags && receipt.tags.length > 0 && (
              <DetailRow label="Tags" value={receipt.tags.join(", ")} />
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-sm text-zinc-500">{label}</Text>
      <Text className="text-sm text-white capitalize">{value}</Text>
    </View>
  );
}

function getLowConfidenceFields(receipt: Receipt): { field: string; originalValue: string; suggestion: string; reason: string }[] {
  if (!receipt.confidence) return [];
  const suggestions: { field: string; originalValue: string; suggestion: string; reason: string }[] = [];
  const confidence = receipt.confidence;

  if (confidence.merchant !== undefined && confidence.merchant < 0.6) {
    suggestions.push({
      field: "merchant",
      originalValue: receipt.merchant,
      suggestion: receipt.merchant.replace(/\s+/g, " ").trim(),
      reason: "Low OCR confidence — verify the merchant name",
    });
  }
  if (confidence.total !== undefined && confidence.total < 0.6) {
    suggestions.push({
      field: "total",
      originalValue: String(receipt.total),
      suggestion: String(Math.round(receipt.total * 100) / 100),
      reason: "Total may be inaccurate — check the amount",
    });
  }
  if (confidence.category !== undefined && confidence.category < 0.5) {
    suggestions.push({
      field: "category",
      originalValue: receipt.category,
      suggestion: "other",
      reason: "Category unclear — select the best match",
    });
  }

  return suggestions;
}
