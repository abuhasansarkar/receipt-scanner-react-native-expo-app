import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { generateId } from "@/lib/utils";
import type { ReceiptItem } from "@/types/receipt";

interface LineItemEditorProps {
  items: ReceiptItem[];
  currency?: string;
  onChange: (items: ReceiptItem[]) => void;
}

export function LineItemEditor({ items, currency = "USD", onChange }: LineItemEditorProps) {
  const updateItem = useCallback(
    (id: string, field: keyof ReceiptItem, value: string | number) => {
      onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    },
    [items, onChange]
  );

  const removeItem = useCallback(
    (id: string) => onChange(items.filter((item) => item.id !== id)),
    [items, onChange]
  );

  const addItem = useCallback(() => {
    onChange([...items, { id: generateId(), name: "", price: 0, quantity: 1 }]);
  }, [items, onChange]);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Line items</Text>
      {items.map((item, index) => (
        <View key={item.id} className="mb-2 rounded-xl border border-surface-border bg-surface-raised p-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-zinc-500">Item {index + 1}</Text>
            <Pressable onPress={() => removeItem(item.id)}>
              <Ionicons name="close-outline" size={16} color="#ef4444" />
            </Pressable>
          </View>
          <View className="mt-2 flex-row gap-2">
            <TextInput
              value={item.name}
              onChangeText={(v) => updateItem(item.id, "name", v)}
              placeholder="Item name"
              placeholderTextColor="#71717a"
              className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            />
            <TextInput
              value={item.price > 0 ? String(item.price) : ""}
              onChangeText={(v) => updateItem(item.id, "price", Number.parseFloat(v) || 0)}
              placeholder="0.00"
              placeholderTextColor="#71717a"
              keyboardType="decimal-pad"
              className="w-20 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white text-right"
            />
          </View>
          {item.quantity !== undefined && (
            <View className="mt-2 flex-row items-center gap-2">
              <Text className="text-xs text-zinc-500">Qty:</Text>
              <TextInput
                value={String(item.quantity)}
                onChangeText={(v) => updateItem(item.id, "quantity", parseInt(v) || 1)}
                keyboardType="number-pad"
                className="w-14 rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-sm text-white text-center"
              />
            </View>
          )}
        </View>
      ))}
      <Pressable onPress={addItem} className="flex-row items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-border py-3">
        <Ionicons name="add-outline" size={16} color="#22c55e" />
        <Text className="text-sm font-medium text-brand-500">Add item</Text>
      </Pressable>
    </View>
  );
}
