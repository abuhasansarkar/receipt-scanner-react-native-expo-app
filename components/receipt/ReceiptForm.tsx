import { useCallback, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LineItemEditor } from "@/components/ui/LineItemEditor";
import { SUPPORTED_CURRENCIES, TAX_DEDUCTION_CATEGORIES, TAG_PRESETS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";
import { CategoryPicker } from "./CategoryPicker";

interface ReceiptFormProps {
  receipt: Receipt;
  onSave: (data: Partial<Receipt>) => void;
  onDelete?: () => void;
}

export function ReceiptForm({ receipt, onSave, onDelete }: ReceiptFormProps) {
  const [merchant, setMerchant] = useState(receipt.merchant);
  const [total, setTotal] = useState(String(receipt.total));
  const [notes, setNotes] = useState(receipt.notes ?? "");
  const [category, setCategory] = useState(receipt.category);
  const [currency, setCurrency] = useState(receipt.currency);
  const [items, setItems] = useState(receipt.items ?? []);
  const [isTaxDeductible, setIsTaxDeductible] = useState(receipt.isTaxDeductible ?? false);
  const [tags, setTags] = useState<string[]>(receipt.tags ?? []);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);

  const hasChanges =
    merchant !== receipt.merchant ||
    total !== String(receipt.total) ||
    notes !== (receipt.notes ?? "") ||
    category !== receipt.category ||
    currency !== receipt.currency ||
    isTaxDeductible !== (receipt.isTaxDeductible ?? false) ||
    JSON.stringify(items) !== JSON.stringify(receipt.items ?? []) ||
    JSON.stringify(tags) !== JSON.stringify(receipt.tags ?? []);

  const handleSave = useCallback(() => {
    const parsedTotal = Number.parseFloat(total);
    onSave({
      merchant: merchant.trim() || receipt.merchant,
      total: Number.isFinite(parsedTotal) ? parsedTotal : receipt.total,
      notes: notes.trim() || undefined,
      category,
      currency,
      items: items.length > 0 ? items : undefined,
      isTaxDeductible,
      tags,
      status: "verified",
      confidence: undefined,
    });
  }, [merchant, total, notes, category, currency, items, isTaxDeductible, tags, receipt, onSave]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <Input label="Merchant" value={merchant} onChangeText={setMerchant} confidence={receipt.confidence?.merchant} placeholder="e.g. Blue Bottle Coffee" />

      <View className="mb-4">
        <Text className="mb-1.5 text-xs font-medium text-muted">Currency</Text>
        <Pressable
          onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
          className="rounded-xl border border-surface-border bg-surface-container px-4 py-3"
        >
          <Text className="text-base text-surface-text">
            {SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.label ?? currency} ({currency})
          </Text>
        </Pressable>
        {showCurrencyPicker && (
          <View className="mt-2 rounded-xl border border-surface-border bg-surface-container p-2">
            {SUPPORTED_CURRENCIES.map((c) => (
              <Pressable
                key={c.code}
                onPress={() => { setCurrency(c.code); setShowCurrencyPicker(false); }}
                className={`rounded-lg px-3 py-2.5 ${c.code === currency ? "bg-brand/15" : ""}`}
              >
                <Text className={`text-sm ${c.code === currency ? "text-brand font-semibold" : "text-surface-text"}`}>
                  {c.symbol} {c.label} ({c.code})
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Input label="Total" value={total} onChangeText={setTotal} keyboardType="decimal-pad" confidence={receipt.confidence?.total} placeholder="0.00" />

      <Text className="mb-1.5 text-xs font-medium text-muted">Category</Text>
      <CategoryPicker value={category} onChange={setCategory} />

      <LineItemEditor items={items} currency={currency} onChange={setItems} />

      <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline />

      <View className="mb-4 rounded-xl border border-surface-border bg-surface-container p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-medium text-surface-text">Tax deductible</Text>
            <Text className="text-xs text-muted">Mark this expense for tax reporting</Text>
          </View>
          <Switch
            value={isTaxDeductible}
            onValueChange={setIsTaxDeductible}
            trackColor={{ false: "#242c24", true: "#22c55e50" }}
            thumbColor={isTaxDeductible ? "#22c55e" : "#5a6d5a"}
          />
        </View>
      </View>

      <View className="mb-4">
        <Pressable onPress={() => setShowTagPicker(!showTagPicker)} className="flex-row items-center justify-between rounded-xl border border-surface-border bg-surface-container px-4 py-3">
          <Text className="text-sm text-muted">Tags</Text>
          <Text className="text-sm text-surface-text">{tags.length > 0 ? tags.join(", ") : "Tap to add"}</Text>
        </Pressable>
        {showTagPicker && (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {TAG_PRESETS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1.5 ${tags.includes(tag) ? "border-brand bg-brand/15" : "border-surface-border bg-surface-container"}`}
              >
                <Text className={`text-xs ${tags.includes(tag) ? "text-brand font-semibold" : "text-muted"}`}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Text className="mb-4 text-xs text-muted">Added on {formatDate(receipt.createdAt)}</Text>
      <Button label="Save changes" onPress={handleSave} disabled={!hasChanges} />
      {onDelete && (
        <View className="mt-3">
          <Button label="Delete receipt" variant="danger" onPress={onDelete} />
        </View>
      )}
    </ScrollView>
  );
}
