import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text } from "react-native";

import { CATEGORIES } from "@/lib/constants";
import type { ReceiptCategory } from "@/types/receipt";

interface CategoryPickerProps {
  value: ReceiptCategory;
  onChange: (category: ReceiptCategory) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1 mb-4">
      {CATEGORIES.map((category) => {
        const selected = category.id === value;
        return (
          <Pressable
            key={category.id}
            onPress={() => onChange(category.id)}
            className={`mx-1 flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
              selected ? "border-brand-500 bg-brand-500/15" : "border-surface-border bg-surface-raised"
            }`}
          >
            <Ionicons name={category.icon} size={14} color={selected ? "#22c55e" : "#a1a1aa"} />
            <Text className={`text-xs font-medium ${selected ? "text-brand-500" : "text-zinc-400"}`}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
