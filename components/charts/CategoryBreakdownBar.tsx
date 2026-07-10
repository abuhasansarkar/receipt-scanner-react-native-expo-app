import { Text, View } from "react-native";

import type { CategoryBreakdown } from "@/features/insights/service";
import { getCategoryMeta } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface CategoryBreakdownBarProps {
  data: CategoryBreakdown[];
  currency?: string;
}

export function CategoryBreakdownBar({ data, currency = "USD" }: CategoryBreakdownBarProps) {
  if (data.length === 0) {
    return <Text className="text-sm text-zinc-500">No spending recorded this week yet.</Text>;
  }

  return (
    <View className="gap-3">
      {data.map((entry) => {
        const meta = getCategoryMeta(entry.category);
        return (
          <View key={entry.category}>
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-white">{meta.label}</Text>
              <Text className="text-sm text-zinc-400">{formatCurrency(entry.total, currency)}</Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-surface-border">
              <View
                style={{ width: `${Math.max(entry.percentage * 100, 4)}%`, backgroundColor: meta.color }}
                className="h-full rounded-full"
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
