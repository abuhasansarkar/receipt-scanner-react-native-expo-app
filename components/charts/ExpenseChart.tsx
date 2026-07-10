import { Text, View } from "react-native";

import { formatCurrencyShort } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ExpenseChartProps {
  data: DataPoint[];
  height?: number;
  currency?: string;
  className?: string;
}

export function ExpenseChart({ data, height = 120, currency = "USD", className }: ExpenseChartProps) {
  if (data.length === 0) {
    return <Text className="text-sm text-zinc-500">No data yet.</Text>;
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className={`gap-1 ${className ?? ""}`}>
      <View style={{ height }} className="flex-row items-end gap-1.5">
        {data.map((point, index) => {
          const pct = (point.value / maxVal) * 100;
          return (
            <View key={index} className="flex-1 items-center" style={{ height: "100%" }}>
              <Text className="mb-1 text-[9px] text-zinc-500">
                {formatCurrencyShort(point.value, currency)}
              </Text>
              <View
                style={{
                  height: `${Math.max(pct, 4)}%`,
                  backgroundColor: point.color ?? "#22c55e",
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  width: "100%",
                }}
              />
            </View>
          );
        })}
      </View>
      <View className="flex-row justify-between px-0.5">
        {data.map((point, index) => (
          <Text key={index} className="flex-1 text-center text-[10px] text-zinc-500">
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
