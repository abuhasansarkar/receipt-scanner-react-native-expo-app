import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
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

  const cornerSize = 24;
  const cornerThickness = 3;
  const cornerColor = "#4be277";

  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
      {/* Dark overlay top */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: "30%", backgroundColor: "#00000060" }} />
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, top: "70%", backgroundColor: "#00000060" }} />
      <View style={{ position: "absolute", top: "30%", bottom: "30%", left: 0, width: "7.5%", backgroundColor: "#00000060" }} />
      <View style={{ position: "absolute", top: "30%", bottom: "30%", right: 0, width: "7.5%", backgroundColor: "#00000060" }} />

      {/* Frame */}
      <View style={{ width: "85%", height: "40%", position: "relative" }}>
        {/* Corner TL */}
        <View style={{ position: "absolute", top: 0, left: 0, width: cornerSize, height: cornerSize }}>
          <View style={{ position: "absolute", top: 0, left: 0, width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderTopLeftRadius: 2 }} />
          <View style={{ position: "absolute", top: 0, left: 0, width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderTopLeftRadius: 2 }} />
        </View>
        {/* Corner TR */}
        <View style={{ position: "absolute", top: 0, right: 0, width: cornerSize, height: cornerSize }}>
          <View style={{ position: "absolute", top: 0, right: 0, width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderTopRightRadius: 2 }} />
          <View style={{ position: "absolute", top: 0, right: 0, width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderTopRightRadius: 2 }} />
        </View>
        {/* Corner BL */}
        <View style={{ position: "absolute", bottom: 0, left: 0, width: cornerSize, height: cornerSize }}>
          <View style={{ position: "absolute", bottom: 0, left: 0, width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderBottomLeftRadius: 2 }} />
          <View style={{ position: "absolute", bottom: 0, left: 0, width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderBottomLeftRadius: 2 }} />
        </View>
        {/* Corner BR */}
        <View style={{ position: "absolute", bottom: 0, right: 0, width: cornerSize, height: cornerSize }}>
          <View style={{ position: "absolute", bottom: 0, right: 0, width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderBottomRightRadius: 2 }} />
          <View style={{ position: "absolute", bottom: 0, right: 0, width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderBottomRightRadius: 2 }} />
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
                translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }),
              }],
            }}
          >
            <LinearGradient
              colors={["transparent", "#4be277", "#4be277", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 2, width: "100%" }}
            />
            <View style={{ height: 20, marginTop: -2, opacity: 0.15 }}>
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
