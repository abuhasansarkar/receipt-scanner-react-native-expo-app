import { useMemo } from "react";
import { View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
  G,
  Line,
  Text as SvgText,
} from "react-native-svg";

interface LinePoint {
  label: string;
  value: number;
}

interface Props {
  data: LinePoint[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  showDots?: boolean;
}

export function LineChart({
  data,
  color = "#4be277",
  height = 160,
  showGrid = true,
  showLabels = true,
  showDots = true,
}: Props) {
  if (data.length < 2) return null;

  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const minVal = useMemo(() => Math.min(...data.map((d) => d.value), 0), [data]);
  const range = maxVal - minVal || 1;
  const padding = { top: 20, bottom: 20, left: 0, right: 0 };
  const chartW = 100;
  const chartH = 100;

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        x: (i / (data.length - 1)) * chartW,
        y: chartH - padding.bottom - ((d.value - minVal) / range) * (chartH - padding.top - padding.bottom),
        value: d.value,
        label: d.label,
      })),
    [data, minVal, range, chartW, chartH]
  );

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const gradientId = `line-grad-${color.replace("#", "")}`;

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = range / 3;
    for (let i = 0; i <= 3; i++) {
      ticks.push(minVal + step * i);
    }
    return ticks;
  }, [minVal, range]);

  return (
    <View style={{ height, width: "100%" }}>
      <Svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {showGrid &&
          yTicks.map((tick, i) => {
            const y = chartH - padding.bottom - ((tick - minVal) / range) * (chartH - padding.top - padding.bottom);
            return (
              <G key={i}>
                <Line x1={0} y1={y} x2={chartW} y2={y} stroke="#2f372e" strokeWidth={0.5} />
              </G>
            );
          })}

        <Path d={`${pathD} L ${chartW} ${chartH} L 0 ${chartH} Z`} fill={`url(#${gradientId})`} />
        <Path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {showDots &&
          points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke="#0e150e" strokeWidth={1.5} />
          ))}
      </Svg>
    </View>
  );
}
