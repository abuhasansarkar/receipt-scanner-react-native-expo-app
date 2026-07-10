import { Text, View } from "react-native";

export function ScanOverlay() {
  return (
    <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
      <View className="h-[62%] w-[85%] rounded-3xl border-2 border-white/70" />
      <Text className="mt-4 text-sm font-medium text-white/80">
        Align the receipt within the frame
      </Text>
    </View>
  );
}
