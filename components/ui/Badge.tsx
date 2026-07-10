import { Text, View } from "react-native";

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = "#22c55e" }: BadgeProps) {
  return (
    <View style={{ backgroundColor: `${color}22` }} className="self-start rounded-full px-2.5 py-1">
      <Text style={{ color }} className="text-xs font-semibold">
        {label}
      </Text>
    </View>
  );
}
