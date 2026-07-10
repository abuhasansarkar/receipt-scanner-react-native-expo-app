import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboardingStore } from "@/lib/onboarding";

const slides = [
  {
    icon: "scan-outline",
    title: "Scan Any Receipt",
    description:
      "Snap a photo of any receipt and let AI extract all the details — no manual entry needed.",
  },
  {
    icon: "bulb-outline",
    title: "Smart Insights",
    description:
      "Get a clear picture of your spending with AI-powered analytics and beautiful visualizations.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Stay Organized",
    description:
      "Categorize, search, and export your receipts. Everything synced and backed up securely.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const complete = useOnboardingStore((s) => s.complete);
  const [current, setCurrent] = useState(0);
  const isLast = current === slides.length - 1;
  const slide = slides[current];

  const handleNext = () => {
    if (isLast) {
      complete();
      router.replace("/(auth)/sign-in");
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const handleSkip = () => {
    complete();
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e150e" }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: 8 }}>
        <Pressable onPress={handleSkip} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ fontSize: 15, color: "#869585", fontWeight: "500" }}>Skip</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
        <View style={{ width: 160, height: 160, borderRadius: 80, overflow: "hidden", marginBottom: 40 }}>
          <LinearGradient
            colors={["#4be277", "#0566d9", "#b89cff"]}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name={slide.icon as any} size={64} color="#003915" />
            <Image source={require("@/assets/images/receipt.png")} style={{ width: 32, height: 32, position: "absolute", bottom: 20, right: 20 }} />
          </LinearGradient>
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#dce5d9",
            textAlign: "center",
            lineHeight: 34,
            marginBottom: 12,
          }}
        >
          {slide.title}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#869585",
            textAlign: "center",
            lineHeight: 22,
            paddingHorizontal: 8,
          }}
        >
          {slide.description}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 32, gap: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === current ? "#4be277" : "#3d4a3d",
              }}
            />
          ))}
        </View>

        <Pressable onPress={handleNext} style={{ borderRadius: 16, overflow: "hidden" }}>
          <LinearGradient
            colors={["#4be277", "#0566d9", "#b89cff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ alignItems: "center", justifyContent: "center", paddingVertical: 16 }}
          >
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#003915" }}>
              {isLast ? "Get Started" : "Next"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
