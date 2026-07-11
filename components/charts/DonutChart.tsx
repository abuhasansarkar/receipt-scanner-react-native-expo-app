import { useMemo } from "react";
import { Text, View } from "react-native";

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

export function DonutChart({ data, size = 120, strokeWidth = 12 }: Props) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    if (total === 0) return [];
    let cumulative = 0;
    return data
      .filter((d) => d.value > 0)
      .map((d) => {
        const startAngle = (cumulative / total) * 360;
        const arc = (d.value / total) * 360;
        cumulative += d.value;
        return { ...d, startAngle, arc };
      });
  }, [data, total]);

  if (total === 0) {
    return (
      <View
        className="items-center justify-center"
        style={{ width: size, height: size }}
      >
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: "#1a221a",
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
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          backgroundColor: "#1a221a",
        }}
      >
        {segments.map((seg, i) => {
          const rotation = seg.startAngle - 90;
          const halfCircle = seg.arc > 180;
          const arcLength = (seg.arc / 360) * circumference;

          return (
            <View
              key={i}
              className="absolute inset-0"
              style={{
                transform: [{ rotate: `${rotation}deg` }],
              }}
            >
              {halfCircle ? (
                <>
                  <View
                    className="absolute"
                    style={{
                      width: size / 2,
                      height: size,
                      borderRadius: 0,
                      borderTopLeftRadius: size / 2,
                      borderBottomLeftRadius: size / 2,
                      backgroundColor: seg.color,
                      left: 0,
                    }}
                  />
                  <View
                    className="absolute"
                    style={{
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      borderColor: "transparent",
                      borderWidth: strokeWidth,
                      borderRightColor: seg.color,
                      borderTopColor: seg.color,
                      transform: [{ rotate: `${180 - seg.arc}deg` }],
                    }}
                  />
                </>
              ) : (
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: "transparent",
                    borderWidth: strokeWidth,
                    borderRightColor: seg.color,
                    borderTopColor: seg.color,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
      <View
        className="absolute items-center justify-center rounded-full bg-surface"
        style={{
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
        }}
      >
        <Text
          className="font-bold text-white"
          style={{ fontSize: radius * 0.48, lineHeight: radius * 0.56 }}
        >
          {Intl.NumberFormat("en-US", {
            style: "percent",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(data.length > 0 ? data[0].value / total : 0)}
        </Text>
        <Text
          className="text-outline"
          style={{ fontSize: radius * 0.24, lineHeight: radius * 0.28 }}
          numberOfLines={1}
        >
          {data.length > 0 ? data[0].label : ""}
        </Text>
      </View>
    </View>
  );
}
