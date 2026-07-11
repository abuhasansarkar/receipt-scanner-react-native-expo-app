import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ScanOverlayProps {
  isProcessing?: boolean;
}

export function ScanOverlay({ isProcessing = false }: ScanOverlayProps) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  const cornerSize = 28;
  const cornerThickness = 3;
  const cornerColor = "#4be277";

  return (
    <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
      {/* Dark overlay - top */}
      <View className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: "28%" }} />
      {/* Dark overlay - bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-black/50" style={{ height: "32%" }} />
      {/* Dark overlay - left */}
      <View className="absolute bg-black/50" style={{ top: "28%", bottom: "32%", left: 0, width: "7%" }} />
      {/* Dark overlay - right */}
      <View className="absolute bg-black/50" style={{ top: "28%", bottom: "32%", right: 0, width: "7%" }} />

      {/* Frame */}
      <View style={{ width: "86%", height: "40%", position: "relative" }}>
        {/* Corner TL */}
        <View style={{ position: "absolute", top: 0, left: 0, width: cornerSize, height: cornerSize }}>
          <View style={{ position: "absolute", top: 0, left: 0, width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderTopLeftRadius: 3 }} />
          <View style={{ position: "absolute", top: 0, left: 0, width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderTopLeftRadius: 3 }} />
        </View>
        {/* Corner TR */}
        <View style={{ position: "absolute", top: 0, right: 0, width: cornerSize, height: cornerSize }}>
          <View style={{ position: "absolute", top: 0, right: 0, width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderTopRightRadius: 3 }} />
          <View style={{ position: "absolute", top: 0, right: 0, width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderTopRightRadius: 3 }} />
        </View>
        {/* Corner BL */}
        <View style={{ position: "absolute", bottom: 0, left: 0, width: cornerSize, height: cornerSize }}>
          <View style={{ position: "absolute", bottom: 0, left: 0, width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderBottomLeftRadius: 3 }} />
          <View style={{ position: "absolute", bottom: 0, left: 0, width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderBottomLeftRadius: 3 }} />
        </View>
        {/* Corner BR */}
        <View style={{ position: "absolute", bottom: 0, right: 0, width: cornerSize, height: cornerSize }}>
          <View style={{ position: "absolute", bottom: 0, right: 0, width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderBottomRightRadius: 3 }} />
          <View style={{ position: "absolute", bottom: 0, right: 0, width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderBottomRightRadius: 3 }} />
        </View>

        {/* Animated scan line */}
        {!isProcessing && (
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              transform: [{
                translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 180] }),
              }],
            }}
          >
            <LinearGradient
              colors={["transparent", "#4be277", "#4be277", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 2, width: "100%" }}
            />
            <View style={{ height: 24, marginTop: -2, opacity: 0.12 }}>
              <LinearGradient
                colors={["transparent", "#4be277", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
