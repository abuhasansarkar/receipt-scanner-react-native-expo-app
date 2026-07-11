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
              selected ? "border-brand bg-brand/15" : "border-surface-border bg-surface-container"
            }`}
          >
            <Ionicons name={category.icon} size={14} color={selected ? "#4be277" : "#869585"} />
            <Text className={`text-xs font-medium ${selected ? "text-brand" : "text-muted"}`}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
