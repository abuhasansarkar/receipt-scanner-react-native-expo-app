import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScanOverlay } from "@/components/scanner/ScanOverlay";
import { ReceiptService } from "@/features/receipts/service";
import { useScanner, type ScanOutcome } from "@/features/scanner/hooks";
import type { ReceiptCategory } from "@/types/receipt";
import type { Href } from "expo-router";

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const {
    isProcessing,
    error,
    processImage,
    pickFromLibrary,
    pickPDF,
    clearError,
  } = useScanner();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [autoCrop, setAutoCrop] = useState(true);

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
      paymentMethod: result.paymentMethod,
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
    return <View className="flex-1 bg-surface-base" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-base px-8">
        <View className="w-20 h-20 items-center justify-center rounded-full bg-surface-container mb-5">
          <Ionicons name="camera-outline" size={36} color="#4be277" />
        </View>
        <Text className="text-center text-xl font-semibold text-surface-text mb-2">
          Camera access needed
        </Text>
        <Text className="text-center text-sm leading-5 text-muted mb-8">
          ReceiptBrain needs your camera to scan receipts instantly with AI.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="w-full overflow-hidden rounded-2xl"
        >
          <LinearGradient
            colors={["#4be277", "#0566d9", "#b89cff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="items-center py-4"
          >
            <Text className="text-base font-semibold text-on-primary">
              Grant permission
            </Text>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    );
  }

  const busy = isProcessing || isCapturing;

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        mode="picture"
        ratio="4:3"
        enableTorch={torchEnabled}
        onCameraReady={() => setIsCameraReady(true)}
        onMountError={(e) => setCameraError(e.message)}
      />

      {!isCameraReady && !cameraError && (
        <View className="absolute inset-0 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#4be277" />
          <Text className="mt-3 text-sm font-medium text-white/70">
            Starting camera...
          </Text>
        </View>
      )}

      {cameraError && (
        <View className="absolute inset-0 items-center justify-center bg-black px-8">
          <View className="w-20 h-20 items-center justify-center rounded-full bg-surface-container mb-5">
            <Ionicons name="camera-outline" size={36} color="#ef4444" />
          </View>
          <Text className="text-center text-xl font-semibold text-white mb-2">
            Camera error
          </Text>
          <Text className="text-center text-sm leading-5 text-white/60 mb-8">
            {cameraError}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="overflow-hidden rounded-2xl border border-white/20 px-8 py-3"
          >
            <Text className="text-base font-semibold text-white">Go back</Text>
          </Pressable>
        </View>
      )}

      <View pointerEvents="none" className="absolute inset-0">
        <ScanOverlay isProcessing={busy} />
      </View>

      {/* Error */}
      {error && (
        <View className="absolute left-5 right-5 top-16 rounded-xl border border-red-500/30 bg-red-900/90 p-3.5 flex-row items-center justify-between z-50">
          <Text className="flex-1 text-sm text-red-100 mr-2">{error}</Text>
          <Pressable onPress={clearError} className="p-1">
            <Ionicons name="close-circle" size={20} color="#fca5a5" />
          </Pressable>
        </View>
      )}

      {/* Processing overlay */}
      {busy && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <View className="items-center rounded-2xl border border-surface-border bg-surface-container p-6">
            <ActivityIndicator size="large" color="#4be277" />
            <Text className="mt-3 text-sm font-medium text-surface-text">
              Analyzing receipt...
            </Text>
            <Text className="mt-1 text-xs text-muted">
              AI is extracting data
            </Text>
          </View>
        </View>
      )}

      {/* Top Controls */}
      <SafeAreaView edges={["top"]} className="absolute top-0 left-0 right-0">
        <View className="flex-row items-center justify-between px-5 pt-2">
          {/* Close Button */}
          <Pressable onPress={() => router.back()} className="icon-btn-circle">
            <Ionicons name="close" size={22} color="#ffffff" />
          </Pressable>

          {/* Torch Toggle */}
          <Pressable
            onPress={() => setTorchEnabled(!torchEnabled)}
            className="items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: torchEnabled ? "#4be277" : "rgba(0,0,0,0.45)",
            }}
          >
            <Ionicons
              name={torchEnabled ? "flash" : "flash-outline"}
              size={20}
              color={torchEnabled ? "#003915" : "#ffffff"}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Bottom Controls */}
      <SafeAreaView
        edges={["bottom"]}
        className="absolute bottom-0 left-0 right-0"
      >
        {/* Hint Text */}
        <View className="items-center mb-4">
          <View className="rounded-full bg-black/60 px-4 py-1.5">
            <Text className="text-xs font-medium text-white/70">
              Align receipt within the frame
            </Text>
          </View>
        </View>

        {/* Control Row */}
        <View className="flex-row items-center justify-between px-10 pb-6">
          {/* Gallery */}
          <Pressable
            onPress={handleImport}
            disabled={busy}
            className="scan-btn-circle"
          >
            <Ionicons name="images-outline" size={22} color="#ffffff" />
          </Pressable>

          {/* Capture Button */}
          <Pressable
            onPress={handleCapture}
            disabled={busy || !isCameraReady}
            className="items-center justify-center"
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              padding: 4,
              borderWidth: 3,
              borderColor: isCameraReady
                ? "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.12)",
            }}
          >
            <View
              className="items-center justify-center"
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: busy
                  ? "rgba(255,255,255,0.3)"
                  : isCameraReady
                    ? "#ffffff"
                    : "rgba(255,255,255,0.15)",
              }}
            >
              {busy ? <ActivityIndicator color="#003915" /> : null}
            </View>
          </Pressable>

          {/* PDF Import */}
          <Pressable
            onPress={handleImportPDF}
            disabled={busy}
            className="scan-btn-circle"
          >
            <Ionicons name="document-outline" size={22} color="#ffffff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
