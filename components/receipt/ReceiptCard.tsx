import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";

interface ReceiptCardProps {
  receipt: Receipt;
  onPress?: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const category = getCategoryMeta(receipt.category);
  const needsReview = receipt.status === "needs_review";

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-70 ${needsReview ? "border-amber-500/30 bg-amber-500/5" : "border-surface-border bg-surface-raised"}`}
    >
      <View style={{ backgroundColor: `${category.color}20` }} className="h-11 w-11 items-center justify-center rounded-xl">
        <Ionicons name={category.icon} size={20} color={category.color} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>{receipt.merchant}</Text>
          {needsReview && (
            <View className="rounded-full bg-amber-500/15 px-1.5 py-0.5">
              <Text className="text-[9px] font-medium text-amber-400">Review</Text>
            </View>
          )}
          {receipt.isTaxDeductible && (
            <Ionicons name="receipt-outline" size={12} color="#22c55e" />
          )}
        </View>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          <Text className="text-xs text-zinc-500">{category.label}</Text>
          <Text className="text-xs text-zinc-500">\u00B7</Text>
          <Text className="text-xs text-zinc-500">{formatDateShort(receipt.date)}</Text>
          {receipt.currency !== "USD" && (
            <>
              <Text className="text-xs text-zinc-500">\u00B7</Text>
              <Text className="text-xs font-medium text-brand-500">{receipt.currency}</Text>
            </>
          )}
        </View>
      </View>
      <Text className="text-base font-bold text-white">{formatCurrency(receipt.total, receipt.currency)}</Text>
    </Pressable>
  );
}
