import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View, Image } from "react-native";

import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";

interface ReceiptCardProps {
  receipt: Receipt;
  onPress?: () => void;
}

function formatReceiptTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const category = getCategoryMeta(receipt.category);
  const hasImage = Boolean(receipt.imageUri);

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center gap-3 rounded-2xl border border-surface-border bg-surface-container p-4 active:opacity-70"
    >
      {/* Category Icon */}
      {hasImage ? (
        <View className="w-12 h-12 items-center justify-center overflow-hidden rounded-xl bg-surface-high">
          <Image
            source={{ uri: receipt.imageUri! }}
            style={{ width: 48, height: 48 }}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View
          className="w-12 h-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Ionicons name={category.icon} size={22} color={category.color} />
        </View>
      )}

      {/* Info */}
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-surface-text" numberOfLines={1}>
          {receipt.merchant}
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <Text className="text-xs text-muted">{formatReceiptTime(receipt.date)}</Text>
          {receipt.paymentMethod && (
            <>
              <Text className="text-xs text-muted">{"\u00B7"}</Text>
              <Text className="text-xs text-muted">{receipt.paymentMethod}</Text>
            </>
          )}
        </View>
      </View>

      {/* Amount + Badge */}
      <View className="items-end gap-1.5">
        <Text className="text-[15px] font-semibold text-surface-text">
          {formatCurrency(receipt.total, receipt.currency)}
        </Text>
        <View
          className="category-badge"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Text style={{ color: category.color }}>
            {category.label.split(" ")[0]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
