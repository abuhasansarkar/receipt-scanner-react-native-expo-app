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
    return <Text className="text-sm text-muted">No spending recorded this week yet.</Text>;
  }

  return (
    <View className="gap-3">
      {data.map((entry) => {
        const meta = getCategoryMeta(entry.category);
        return (
          <View key={entry.category}>
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-surface-text">{meta.label.split(" ")[0]}</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-on-surface-variant">
                  {formatCurrency(entry.total, currency)}
                </Text>
                <Text className="text-xs text-muted w-8 text-right">
                  {Math.round(entry.percentage * 100)}%
                </Text>
              </View>
            </View>
            <View className="progress-bar">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(entry.percentage * 100, 4)}%`,
                  backgroundColor: meta.color,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
