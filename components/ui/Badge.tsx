import { Text, View } from "react-native";

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = "#4be277" }: BadgeProps) {
  return (
    <View
      className="rounded-full px-2.5 py-1 self-start"
      style={{ backgroundColor: `${color}26` }}
    >
      <Text
        className="font-semibold"
        style={{ color, fontSize: 11, letterSpacing: 0.5 }}
      >
        {label}
      </Text>
    </View>
  );
}
