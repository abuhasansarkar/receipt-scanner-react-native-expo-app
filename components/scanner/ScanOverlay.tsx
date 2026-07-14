import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ScanOverlayProps {
  isProcessing?: boolean;
}

export function ScanOverlay({ isProcessing = false }: ScanOverlayProps) {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const [frameHeight, setFrameHeight] = useState(240); // default fallback

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  const cornerSize = 32;
  const cornerThickness = 4.5;
  const cornerColor = "#ffffff";
  const cornerRadius = 16;

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
      <View
        onLayout={(e) => setFrameHeight(e.nativeEvent.layout.height)}
        style={{ width: "86%", height: "40%", position: "relative" }}
      >
        {/* Corner TL */}
        <View
          style={{
            position: "absolute",
            top: -2,
            left: -2,
            width: cornerSize,
            height: cornerSize,
            borderTopWidth: cornerThickness,
            borderLeftWidth: cornerThickness,
            borderColor: cornerColor,
            borderTopLeftRadius: cornerRadius,
          }}
        />
        {/* Corner TR */}
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: cornerSize,
            height: cornerSize,
            borderTopWidth: cornerThickness,
            borderRightWidth: cornerThickness,
            borderColor: cornerColor,
            borderTopRightRadius: cornerRadius,
          }}
        />
        {/* Corner BL */}
        <View
          style={{
            position: "absolute",
            bottom: -2,
            left: -2,
            width: cornerSize,
            height: cornerSize,
            borderBottomWidth: cornerThickness,
            borderLeftWidth: cornerThickness,
            borderColor: cornerColor,
            borderBottomLeftRadius: cornerRadius,
          }}
        />
        {/* Corner BR */}
        <View
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: cornerSize,
            height: cornerSize,
            borderBottomWidth: cornerThickness,
            borderRightWidth: cornerThickness,
            borderColor: cornerColor,
            borderBottomRightRadius: cornerRadius,
          }}
        />

        {/* Animated scan line */}
        {!isProcessing && (
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              transform: [{
                translateY: scanAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, frameHeight - 4],
                }),
              }],
            }}
          >
            {/* Horizontal line gradient */}
            <LinearGradient
              colors={["transparent", "#22c55e", "#22c55e", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 2, width: "100%" }}
            />
            {/* Center neon glowing flare capsule */}
            <View
              style={{
                position: "absolute",
                left: "20%",
                right: "20%",
                top: -2,
                height: 5,
                backgroundColor: "#4be277",
                borderRadius: 2.5,
                shadowColor: "#4be277",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                elevation: 4,
              }}
            />
            {/* Soft vertical trailing glow */}
            <View style={{ height: 32, marginTop: -16, opacity: 0.15 }}>
              <LinearGradient
                colors={["transparent", "#22c55e", "transparent"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
