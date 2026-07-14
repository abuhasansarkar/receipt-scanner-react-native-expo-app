import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { G, Path, Circle } from "react-native-svg";

import { useThemeColors } from "@/features/settings/hooks";

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface Props {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    "M",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArc,
    0,
    end.x,
    end.y,
  ].join(" ");
}

export function DonutChart({ data, size = 120, strokeWidth = 12 }: Props) {
  const colors = useThemeColors();
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const segments = useMemo(() => {
    if (total === 0) return [];
    let cumulative = 0;
    return data
      .filter((d) => d.value > 0)
      .map((d) => {
        const angle = (d.value / total) * 360;
        const startAngle = cumulative;
        cumulative += angle;
        return { ...d, path: describeArc(cx, cy, radius, startAngle, startAngle + angle) };
      });
  }, [data, total, cx, cy, radius]);

  const centerLabel = useMemo(() => {
    if (data.length === 0) return { pct: "0%", label: "" };
    const top = data[0];
    return {
      pct: Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 }).format(top.value / total),
      label: top.label.split(" ")[0],
    };
  }, [data, total]);

  if (total === 0) {
    return (
      <View className="items-center justify-center" style={{ width: size, height: size }}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.surfaceBorder,
          }}
        />
        <Text
          className="absolute text-xs font-semibold text-outline"
          style={{ fontSize: radius * 0.4 }}
        >
          No data
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={cx} originY={cy}>
          <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={colors.surfaceBorder} strokeWidth={strokeWidth} />
          {segments.map((seg, i) => (
            <Path
              key={i}
              d={seg.path}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
            />
          ))}
        </G>
      </Svg>
      <View
        className="absolute items-center justify-center rounded-full bg-surface-container"
        style={{ width: size - strokeWidth * 2, height: size - strokeWidth * 2 }}
      >
        <Text
          className="font-bold text-surface-text"
          style={{ fontSize: radius * 0.48, lineHeight: radius * 0.56 }}
        >
          {centerLabel.pct}
        </Text>
        <Text
          className="text-outline"
          style={{ fontSize: radius * 0.24, lineHeight: radius * 0.28 }}
          numberOfLines={1}
        >
          {centerLabel.label}
        </Text>
      </View>
    </View>
  );
}
