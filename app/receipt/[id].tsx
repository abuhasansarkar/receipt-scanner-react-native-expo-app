import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CategoryPicker } from "@/components/receipt/CategoryPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LineItemEditor } from "@/components/ui/LineItemEditor";
import { useReceipt, useReceiptActions } from "@/features/receipts/hooks";
import { useThemeColors } from "@/features/settings/hooks";
import { SUPPORTED_CURRENCIES, TAG_PRESETS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type {
  ReceiptCategory,
  ReceiptItem,
  SupportedCurrency,
} from "@/types/receipt";

export default function ReceiptDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const receipt = useReceipt(id);
  const { updateReceipt, removeReceipt } = useReceiptActions();

  const [merchant, setMerchant] = useState(receipt?.merchant ?? "");
  const [total, setTotal] = useState(receipt ? String(receipt.total) : "");
  const [date, setDate] = useState(receipt?.date ?? "");
  const [notes, setNotes] = useState(receipt?.notes ?? "");
  const [category, setCategory] = useState<ReceiptCategory>(
    receipt?.category ?? "other",
  );
  const [currency, setCurrency] = useState<SupportedCurrency>(
    (receipt?.currency as SupportedCurrency) ?? "USD",
  );
  const [items, setItems] = useState<ReceiptItem[]>(receipt?.items ?? []);
  const [tags, setTags] = useState<string[]>(receipt?.tags ?? []);
  const [paymentMethod, setPaymentMethod] = useState(
    receipt?.paymentMethod ?? "",
  );
  const [receiptNumber, setReceiptNumber] = useState(
    receipt?.receiptNumber ?? "",
  );
  const [isTaxDeductible, setIsTaxDeductible] = useState(
    receipt?.isTaxDeductible ?? false,
  );
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  if (!receipt) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-base">
        <Ionicons name="receipt-outline" size={48} color="#52525b" />
        <Text className="mt-4 text-lg font-semibold text-surface-text">
          Receipt not found
        </Text>
        <Text className="mt-1 text-sm text-muted">
          It may have been deleted.
        </Text>
      </SafeAreaView>
    );
  }

  const hasLowConfidence =
    receipt.confidence != null &&
    Object.values(receipt.confidence).some((c) => c !== undefined && c < 0.6);
  const hasAiSuggestions = (receipt.aiSuggestions?.length ?? 0) > 0;

  const avgConfidence = receipt.confidence
    ? (() => {
        const vals = Object.values(receipt.confidence).filter(
          (c) => c !== undefined,
        ) as number[];
        return vals.length > 0
          ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100)
          : null;
      })()
    : null;

  const handleSave = () => {
    const parsedTotal = Number.parseFloat(total);
    if (Number.isNaN(parsedTotal) || parsedTotal < 0) {
      Alert.alert(
        "Invalid amount",
        "Please enter a valid positive number for the total.",
      );
      return;
    }
    const parsedDate = date ? new Date(date) : null;
    updateReceipt(receipt.id, {
      merchant: merchant.trim() || receipt.merchant,
      total: Number.isFinite(parsedTotal) ? parsedTotal : receipt.total,
      date:
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString()
          : receipt.date,
      notes: notes.trim() || undefined,
      category,
      currency,
      items: items.length > 0 ? items : undefined,
      tags: tags.length > 0 ? tags : undefined,
      paymentMethod: paymentMethod.trim() || undefined,
      receiptNumber: receiptNumber.trim() || undefined,
      isTaxDeductible,
      status: "verified",
      confidence: undefined,
    });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete receipt",
      `Remove ${receipt.merchant} receipt? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeReceipt(receipt.id);
            router.back();
          },
        },
      ],
    );
  };

  const insets = useSafeAreaInsets();

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const statusMeta: Record<
    string,
    { label: string; color: string; bg: string; icon: string }
  > = {
    needs_review: {
      label: "Needs Review",
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.15)",
      icon: "alert-circle",
    },
    verified: {
      label: "Verified",
      color: "#4be277",
      bg: "rgba(75, 226, 119, 0.15)",
      icon: "checkmark-circle",
    },
    flagged: {
      label: "Flagged",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.15)",
      icon: "flag",
    },
  };
  const status = statusMeta[receipt.status] ?? statusMeta.verified;

  return (
    <View className="flex-1 bg-surface-base" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-surface-border">
          <Pressable onPress={() => router.back()} className="p-1 w-10">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text className="text-lg font-bold text-surface-text text-center flex-1">
            Receipt Detail
          </Text>
          <View className="w-10 flex-row justify-end items-center pr-1">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: status.color }}
            />
          </View>
        </View>

      {/* Needs Review Banner */}
      {receipt.status === "needs_review" && (
        <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <Ionicons name="information-circle" size={18} color="#f97316" />
          <Text className="flex-1 text-xs text-amber-400">
            This receipt was scanned with low confidence. Please verify the
            details below.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 56 : 0}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Image Preview ── */}
          <View className="mb-6 overflow-hidden rounded-2xl border border-surface-border bg-surface-container relative">
            <Pressable
              onPress={() => receipt.imageUri && setShowImageModal(true)}
              className="h-64 items-center justify-center bg-surface-high relative"
            >
              {receipt.imageUri ? (
                <>
                  <Image
                    source={{ uri: receipt.imageUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                  {/* Floating AI Confidence Badge */}
                  <View className="absolute bottom-3 right-3 rounded-xl border border-brand bg-[#111611]/95 px-3.5 py-2 items-center justify-center min-w-[100px] shadow-lg">
                    <Text className="text-[10px] font-semibold text-brand tracking-wider uppercase">
                      AI Confidence
                    </Text>
                    <Text className="text-xl font-extrabold text-brand mt-0.5">
                      {avgConfidence !== null ? `${avgConfidence}%` : "94%"}
                    </Text>
                  </View>
                </>
              ) : (
                <View className="items-center">
                  <Ionicons name="receipt-outline" size={40} color={colors.isDark ? "#3d4a3d" : "#cbd5e1"} />
                  <Text className="mt-2 text-xs text-muted">No image</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* ── AI Suggestions ── */}
          {hasAiSuggestions && (
            <View className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons name="bulb-outline" size={16} color={colors.isDark ? "#adc6ff" : "#0566d9"} />
                <Text className="text-sm font-semibold text-secondary">
                  AI Suggestions
                </Text>
              </View>
              {receipt.aiSuggestions!.map((s, i) => (
                <View key={i} className="mb-1.5 flex-row items-start gap-2">
                  <Text className="mt-0.5 text-xs text-muted">{s.field}:</Text>
                  <View className="flex-1">
                    <Text className="text-xs text-surface-text">
                      <Text className="line-through text-muted">
                        {s.originalValue}
                      </Text>
                      {" \u2192 "}
                      <Text className="font-medium text-brand">
                        {s.suggestion}
                      </Text>
                    </Text>
                    <Text className="text-[10px] text-muted">{s.reason}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Details Section ── */}
          <Text className="section-label mb-3">Details</Text>

          <Input
            label="Merchant"
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Merchant name"
            confidence={receipt.confidence?.merchant}
            leftIcon={<Ionicons name="search-outline" size={18} color={colors.muted} />}
          />

          {/* Currency + Amount row */}
          <View className="mb-4 flex-row gap-3">
            <View className="w-28">
              <Text className="mb-1.5 text-xs font-medium text-muted">
                Currency
              </Text>
              <Pressable
                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                className="rounded-xl border border-surface-border bg-surface-container px-4 py-3"
              >
                <Text className="text-base text-surface-text">{currency}</Text>
              </Pressable>
              {showCurrencyPicker && (
                <View className="mt-1 rounded-xl border border-surface-border bg-surface-container p-2">
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <Pressable
                      key={c.code}
                      onPress={() => {
                        setCurrency(c.code);
                        setShowCurrencyPicker(false);
                      }}
                      className={`rounded-lg px-3 py-2.5 ${c.code === currency ? "bg-brand/15" : ""}`}
                    >
                      <Text
                        className={`text-sm ${c.code === currency ? "font-semibold text-brand" : "text-surface-text"}`}
                      >
                        {c.symbol} {c.code}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            <View className="flex-1">
              <Input
                label="Amount"
                value={total}
                onChangeText={setTotal}
                placeholder="0.00"
                keyboardType="decimal-pad"
                confidence={receipt.confidence?.total}
                leftIcon={<Ionicons name="cash-outline" size={18} color={colors.muted} />}
              />
            </View>
          </View>

          {/* Date */}
          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-medium text-muted">Date</Text>
            <View className="flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface-container px-4 py-3">
              <Ionicons name="calendar-outline" size={18} color={colors.muted} />
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder={formatDate(receipt.date)}
                placeholderTextColor={colors.chevron}
                className="flex-1 text-base text-surface-text"
              />
            </View>
          </View>

          {/* Category */}
          <Text className="mb-1.5 text-xs font-medium text-muted">
            Category
          </Text>
          <CategoryPicker value={category} onChange={setCategory} />

          {/* ── Payment & Meta Section ── */}
          <Text className="section-label mb-3 mt-5">Payment & Meta</Text>

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1.5 text-xs font-medium text-muted">
                Payment Method
              </Text>
              <View className="flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface-container px-4 py-3">
                <Ionicons name="card-outline" size={18} color={colors.muted} />
                <TextInput
                  value={paymentMethod}
                  onChangeText={setPaymentMethod}
                  placeholder="e.g. Visa *4242"
                  placeholderTextColor={colors.chevron}
                  className="flex-1 text-base text-surface-text"
                />
              </View>
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-medium text-muted">
              Receipt Number
            </Text>
            <View className="flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface-container px-4 py-3">
              <Ionicons name="pricetag-outline" size={18} color={colors.muted} />
              <TextInput
                value={receiptNumber}
                onChangeText={setReceiptNumber}
                placeholder="#12345"
                placeholderTextColor={colors.chevron}
                className="flex-1 text-base text-surface-text"
              />
            </View>
          </View>

          {/* Tax deductible toggle */}
          <View className="mb-4 rounded-xl border border-surface-border bg-surface-container p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-medium text-surface-text">
                  Tax deductible
                </Text>
                <Text className="text-xs text-muted">
                  Mark this expense for tax reporting
                </Text>
              </View>
              <Switch
                value={isTaxDeductible}
                onValueChange={setIsTaxDeductible}
                trackColor={{ false: "#242c24", true: "#22c55e50" }}
                thumbColor={isTaxDeductible ? "#22c55e" : "#5a6d5a"}
              />
            </View>
          </View>

          {/* ── Line Items ── */}
          <Text className="section-label mb-3 mt-5">Items</Text>
          <LineItemEditor
            items={items}
            currency={currency}
            onChange={setItems}
          />

          {/* ── Tags ── */}
          <Text className="section-label mb-3 mt-5">Tags</Text>
          <Pressable
            onPress={() => setShowTagPicker(!showTagPicker)}
            className="mb-2 flex-row items-center justify-between rounded-xl border border-surface-border bg-surface-container px-4 py-3"
          >
            <Text className="text-sm text-muted">Tags</Text>
            <Text className="text-sm text-surface-text">
              {tags.length > 0 ? tags.join(", ") : "Tap to add"}
            </Text>
          </Pressable>
          {showTagPicker && (
            <View className="mb-4 flex-row flex-wrap gap-1.5">
              {TAG_PRESETS.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1.5 ${tags.includes(tag) ? "border-brand bg-brand/15" : "border-surface-border bg-surface-container"}`}
                >
                  <Text
                    className={`text-xs ${tags.includes(tag) ? "font-semibold text-brand" : "text-muted"}`}
                  >
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── Notes ── */}
          <Text className="section-label mb-3 mt-5">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor="#5a6d5a"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="mb-6 rounded-xl border border-surface-border bg-surface-container px-4 py-3 text-base text-surface-text"
            style={{ minHeight: 80 }}
          />

          {/* ── Footer ── */}
          <Text className="mb-4 text-xs text-muted">
            Added {formatDate(receipt.createdAt)}
            {receipt.createdAt !== receipt.updatedAt &&
              ` \u00B7 Updated ${formatDate(receipt.updatedAt)}`}
          </Text>

          <Button label="Save Changes" onPress={handleSave} className="mb-3" />
          <Button
            label="Delete Receipt"
            variant="danger"
            onPress={handleDelete}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Full Screen Image Modal ── */}
      <Modal visible={showImageModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowImageModal(false)}
          className="flex-1 items-center justify-center bg-black/90"
        >
          <Pressable onPress={() => {}} className="w-full px-4">
            {receipt.imageUri && (
              <Image
                source={{ uri: receipt.imageUri }}
                className="h-[80%] w-full rounded-2xl"
                resizeMode="contain"
              />
            )}
          </Pressable>
          <Pressable
            onPress={() => setShowImageModal(false)}
            style={{ top: insets.top + 12 }}
            className="absolute right-6"
          >
            <Ionicons name="close-circle" size={32} color="#ffffff" />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
