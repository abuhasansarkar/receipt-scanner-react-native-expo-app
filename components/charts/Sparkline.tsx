import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from "react-native-svg";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  color = "#4be277",
  height = 100,
  strokeWidth = 2,
}: SparklineProps) {
  if (data.length < 2) return null;

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;

  const points = useMemo(
    () =>
      data.map((val, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((val - minVal) / range) * 80 - 10,
      })),
    [data, minVal, range]
  );

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const gradientId = `grad-${color.replace("#", "")}`;

  return (
    <View style={{ height, width: "100%" }}>
      <Svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill={`url(#${gradientId})`}
        />
        <Path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill={color}
            stroke="#0e150e"
            strokeWidth={1}
          />
        ))}
      </Svg>
    </View>
  );
}
