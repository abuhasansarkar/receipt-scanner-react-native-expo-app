import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScanOverlay } from "@/components/scanner/ScanOverlay";
import { ReceiptService } from "@/features/receipts/service";
import { useScanner, type ScanOutcome } from "@/features/scanner/hooks";
import type { Href } from "expo-router";
import type { ReceiptCategory } from "@/types/receipt";

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { isProcessing, error, processImage, pickFromLibrary, pickPDF } =
    useScanner();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleScanOutcome = (outcome: ScanOutcome | null) => {
    if (!outcome) return;
    const { imageUri, result, source } = outcome;
    const lowConfidence =
      result.confidence.merchant < 0.6 || result.confidence.total < 0.6;
    const receipt = ReceiptService.create({
      merchant: result.merchant,
      total: result.total,
      currency: result.currency,
      date: result.date,
      category: result.category as ReceiptCategory,
      items: result.items.map((item, index) => ({
        id: `${index}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      confidence: result.confidence,
      receiptNumber: result.receiptNumber,
      imageUri,
      status: lowConfidence ? "needs_review" : "verified",
      source,
    });
    router.push(`/receipt/${receipt.id}` as Href);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        handleScanOutcome(await processImage(photo.uri));
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleImport = async () => {
    handleScanOutcome(await pickFromLibrary());
  };

  const handleImportPDF = async () => {
    handleScanOutcome(await pickPDF());
  };

  if (!permission) {
    return <View className="flex-1 bg-surface" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface px-8">
        <Ionicons name="camera-outline" size={40} color="#71717a" />
        <Text className="mb-2 mt-4 text-center text-lg font-semibold text-white">
          Camera access needed
        </Text>
        <Text className="mb-6 text-center text-sm text-zinc-500">
          ReceiptBrain needs your camera to scan receipts.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="rounded-2xl bg-brand-500 px-6 py-3"
        >
          <Text className="font-semibold text-black">Grant permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const busy = isProcessing || isCapturing;

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <ScanOverlay />
      </CameraView>

      {error && (
        <View className="absolute left-5 right-5 top-16 rounded-xl bg-red-600/90 px-4 py-3">
          <Text className="text-center text-sm text-white">{error}</Text>
        </View>
      )}

      <SafeAreaView edges={["bottom"]} className="absolute bottom-0 w-full">
        <View className="flex-row items-center justify-between px-10 pb-6">
          <Pressable
            onPress={handleImport}
            disabled={busy}
            className="h-14 w-14 items-center justify-center rounded-full bg-white/10"
          >
            <Ionicons name="images-outline" size={24} color="white" />
          </Pressable>

          <Pressable
            onPress={handleCapture}
            disabled={busy}
            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/40 bg-white"
          >
            {busy ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <View className="h-16 w-16 rounded-full bg-white" />
            )}
          </Pressable>

          <Pressable
            onPress={handleImportPDF}
            disabled={busy}
            className="h-14 w-14 items-center justify-center rounded-full bg-white/10"
          >
            <Ionicons name="document-text-outline" size={24} color="white" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
