import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Rect, G, Line, Text as SvgText } from "react-native-svg";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: BarData[];
  height?: number;
  barColor?: string;
  showValues?: boolean;
  currency?: string;
}

export function BarChart({
  data,
  height = 140,
  barColor = "#4be277",
  showValues = true,
}: Props) {
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const barWidth = Math.max(20, Math.min(40, (300 - data.length * 4) / data.length));

  const chartWidth = data.length * (barWidth + 8) + 20;
  const effectiveHeight = height - 20;

  if (data.length === 0) {
    return <Text className="text-sm text-muted">No data</Text>;
  }

  return (
    <View style={{ height, width: "100%" }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * effectiveHeight;
          const x = i * (barWidth + 8) + 10;
          const y = height - barH - 16;

          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                ry={4}
                fill={d.color ?? barColor}
                opacity={0.85}
              />
              {showValues && d.value > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  fill="#869585"
                  fontSize={9}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {d.value >= 1000
                    ? `${(d.value / 1000).toFixed(1)}k`
                    : String(Math.round(d.value))}
                </SvgText>
              )}
              <SvgText
                x={x + barWidth / 2}
                y={height - 2}
                fill="#5a6d5a"
                fontSize={9}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
