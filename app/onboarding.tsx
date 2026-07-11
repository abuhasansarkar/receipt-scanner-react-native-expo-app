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
    <SafeAreaView className="flex-1 bg-surface-base">
      <View className="flex-row justify-end px-5 pt-2">
        <Pressable onPress={handleSkip} className="px-3 py-2">
          <Text className="text-[15px] text-muted font-medium">Skip</Text>
        </Pressable>
      </View>

      <View className="flex-1 justify-center items-center px-8">
        <View className="w-40 h-40 rounded-full overflow-hidden mb-10">
          <LinearGradient
            colors={["#4be277", "#0566d9", "#b89cff"]}
            className="flex-1 items-center justify-center"
          >
            <Ionicons name={slide.icon as any} size={64} color="#003915" />
            <Image
              source={require("@/assets/images/receipt.png")}
              className="w-8 h-8 absolute bottom-5 right-5"
            />
          </LinearGradient>
        </View>
        <Text className="text-[28px] font-bold text-surface-text text-center leading-[34px] mb-3">
          {slide.title}
        </Text>
        <Text className="text-[15px] text-muted text-center leading-[22px] px-2">
          {slide.description}
        </Text>
      </View>

      <View className="px-5 pb-8 gap-6">
        <View className="flex-row justify-center gap-2">
          {slides.map((_, i) => (
            <View
              key={i}
              className="h-2 rounded-full"
              style={{
                width: i === current ? 24 : 8,
                backgroundColor: i === current ? "#4be277" : "#3d4a3d",
              }}
            />
          ))}
        </View>

        <Pressable onPress={handleNext} className="overflow-hidden rounded-2xl">
          <LinearGradient
            colors={["#4be277", "#0566d9", "#b89cff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="items-center justify-center py-4"
          >
            <Text className="text-[17px] font-semibold text-on-primary">
              {isLast ? "Get Started" : "Next"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
