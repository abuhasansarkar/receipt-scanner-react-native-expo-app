import { Text, View } from "react-native";

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = "#4be277" }: BadgeProps) {
  return (
    <View
      style={{ backgroundColor: `${color}26`, borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: "600", letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}
