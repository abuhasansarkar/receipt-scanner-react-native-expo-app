import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useReceipt, useReceiptActions } from "@/features/receipts/hooks";
import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Receipt, ReceiptCategory } from "@/types/receipt";

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const receipt = useReceipt(id);
  const { updateReceipt, removeReceipt } = useReceiptActions();

  const [merchant, setMerchant] = useState(receipt?.merchant ?? "");
  const [total, setTotal] = useState(receipt ? String(receipt.total) : "");
  const [notes, setNotes] = useState(receipt?.notes ?? "");
  const [category, setCategory] = useState<ReceiptCategory>(receipt?.category ?? "other");

  if (!receipt) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-base">
        <Ionicons name="receipt-outline" size={48} color="#52525b" />
        <Text className="mt-4 text-lg font-semibold text-surface-text">Receipt not found</Text>
        <Text className="mt-1 text-sm text-muted">It may have been deleted.</Text>
      </SafeAreaView>
    );
  }

  const categoryMeta = getCategoryMeta(category);
  const confidence = receipt.confidence?.merchant != null && receipt.confidence?.total != null
    ? Math.round(((receipt.confidence.merchant + receipt.confidence.total) / 2) * 100)
    : 94;

  const handleSave = () => {
    const parsedTotal = Number.parseFloat(total);
    updateReceipt(receipt.id, {
      merchant: merchant.trim() || receipt.merchant,
      total: Number.isFinite(parsedTotal) ? parsedTotal : receipt.total,
      notes: notes.trim() || undefined,
      category,
      status: "verified",
      confidence: undefined,
    });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Delete receipt", `Remove ${receipt.merchant} receipt? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { removeReceipt(receipt.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#dce5d9" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-semibold text-surface-text">
          Receipt Detail
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Image Preview */}
        <View className="mb-5 overflow-hidden rounded-2xl border border-surface-border bg-surface-container relative">
          <View className="h-52 items-center justify-center bg-surface-high">
            {receipt.imageUri ? (
              <Image
                source={{ uri: receipt.imageUri }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="receipt-outline" size={40} color="#3d4a3d" />
                <Text className="mt-2 text-xs text-muted">No image</Text>
              </View>
            )}
          </View>
          {/* View Original Button */}
          {receipt.imageUri && (
            <View className="absolute bottom-3 left-3">
              <Pressable className="flex-row items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5">
                <Ionicons name="search-outline" size={14} color="#ffffff" />
                <Text className="text-xs font-medium text-white">View Original</Text>
              </Pressable>
            </View>
          )}
          {/* AI Confidence Badge */}
          <View className="absolute bottom-3 right-3">
            <View className="flex-row items-center gap-1.5 rounded-full bg-brand/90 px-2.5 py-1">
              <Ionicons name="checkmark-circle" size={12} color="#003915" />
              <Text className="text-xs font-bold text-on-primary">
                AI CONFIDENCE {confidence}%
              </Text>
            </View>
          </View>
        </View>

        {/* Merchant */}
        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-medium text-muted">Merchant</Text>
          <View className="flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface-container px-4 py-3">
            <Ionicons name="search-outline" size={18} color="#869585" />
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Merchant name"
              placeholderTextColor="#5a6d5a"
              className="flex-1 text-base text-surface-text"
            />
          </View>
        </View>

        {/* Amount */}
        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-medium text-muted">Amount</Text>
          <View className="flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface-container px-4 py-3">
            <Ionicons name="receipt-outline" size={18} color="#869585" />
            <TextInput
              value={total}
              onChangeText={setTotal}
              placeholder="0.00"
              placeholderTextColor="#5a6d5a"
              keyboardType="decimal-pad"
              className="flex-1 text-base text-surface-text"
            />
          </View>
        </View>

        {/* Date & Category Row */}
        <View className="mb-4 flex-row gap-4">
          <View className="flex-1">
            <Text className="mb-1.5 text-xs font-medium text-muted">Date</Text>
            <View className="flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface-container px-4 py-3">
              <Ionicons name="calendar-outline" size={18} color="#869585" />
              <Text className="flex-1 text-sm text-surface-text">
                {formatDate(receipt.date)}
              </Text>
            </View>
          </View>
          <View className="flex-1">
            <Text className="mb-1.5 text-xs font-medium text-muted">Category</Text>
            <Pressable className="flex-row items-center gap-2 rounded-xl border border-surface-border bg-surface-container px-4 py-3">
              <View
                className="w-6 h-6 items-center justify-center rounded-md"
                style={{ backgroundColor: `${categoryMeta.color}20` }}
              >
                <Ionicons name={categoryMeta.icon as any} size={14} color={categoryMeta.color} />
              </View>
              <Text className="flex-1 text-sm text-surface-text">{categoryMeta.label.split(" ")[0]}</Text>
              <Ionicons name="chevron-down" size={16} color="#869585" />
            </Pressable>
          </View>
        </View>

        {/* Notes */}
        <View className="mb-8">
          <Text className="mb-1.5 text-xs font-medium text-muted">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor="#5a6d5a"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="rounded-xl border border-surface-border bg-surface-container px-4 py-3 text-base text-surface-text"
            style={{ minHeight: 80 }}
          />
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          className="overflow-hidden rounded-2xl mb-3"
        >
          <LinearGradient
            colors={["#4be277", "#22c55e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="items-center py-4"
          >
            <Text className="text-base font-semibold text-on-primary">
              Save Receipt
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Delete Link */}
        <Pressable onPress={handleDelete} className="items-center py-3">
          <Text className="text-sm font-medium text-red-500">Delete Receipt</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
