import { View } from "react-native";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  trackColor?: string;
  height?: number;
  className?: string;
}

export function ProgressBar({
  value,
  max = 1,
  color = "#22c55e",
  trackColor = "#24242c",
  height = 8,
  className,
}: ProgressBarProps) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  return (
    <View
      className={`overflow-hidden rounded-full ${className ?? ""}`}
      style={{ height, backgroundColor: trackColor }}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          backgroundColor: color,
          height: "100%",
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
