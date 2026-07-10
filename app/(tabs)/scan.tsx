import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View, Animated } from "react-native";
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
  const { isProcessing, error, processImage, pickFromLibrary, pickPDF } = useScanner();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleScanOutcome = (outcome: ScanOutcome | null) => {
    if (!outcome) return;
    const { imageUri, result, source } = outcome;
    const lowConfidence = result.confidence.merchant < 0.6 || result.confidence.total < 0.6;
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
    return <View style={{ flex: 1, backgroundColor: "#0e150e" }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0e150e", alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#1a221a", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Ionicons name="camera-outline" size={36} color="#4be277" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "600", color: "#dce5d9", textAlign: "center", marginBottom: 8 }}>
          Camera access needed
        </Text>
        <Text style={{ fontSize: 14, color: "#869585", textAlign: "center", marginBottom: 32, lineHeight: 20 }}>
          ReceiptBrain needs your camera to scan receipts instantly with AI.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{ borderRadius: 16, overflow: "hidden", width: "100%" }}
        >
          <LinearGradient
            colors={["#4be277", "#0566d9", "#b89cff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, alignItems: "center" }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#003915" }}>Grant permission</Text>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    );
  }

  const busy = isProcessing || isCapturing;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <ScanOverlay isProcessing={busy} />
      </CameraView>

      {/* Error */}
      {error && (
        <View style={{ position: "absolute", left: 20, right: 20, top: 60, backgroundColor: "#93000a", borderRadius: 12, padding: 14 }}>
          <Text style={{ textAlign: "center", fontSize: 14, color: "#ffdad6" }}>{error}</Text>
        </View>
      )}

      {/* Processing overlay */}
      {busy && (
        <View style={{ position: "absolute", inset: 0, backgroundColor: "#00000080", alignItems: "center", justifyContent: "center" }}>
          <View style={{ backgroundColor: "#1a221a", borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#3d4a3d" }}>
            <ActivityIndicator size="large" color="#4be277" />
            <Text style={{ color: "#dce5d9", fontSize: 14, fontWeight: "500", marginTop: 12 }}>
              Analyzing receipt...
            </Text>
            <Text style={{ color: "#869585", fontSize: 12, marginTop: 4 }}>AI is extracting data</Text>
          </View>
        </View>
      )}

      {/* Bottom Controls */}
      <SafeAreaView edges={["bottom"]} style={{ position: "absolute", bottom: 0, width: "100%" }}>
        {/* Hint */}
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <View style={{ backgroundColor: "#00000080", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 }}>
            <Text style={{ fontSize: 12, color: "#ffffff99", fontWeight: "500" }}>
              Align receipt within the frame
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 40, paddingBottom: 24 }}>
          {/* Gallery */}
          <Pressable
            onPress={handleImport}
            disabled={busy}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#ffffff18", borderWidth: 1, borderColor: "#ffffff30", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="images-outline" size={24} color="white" />
          </Pressable>

          {/* Capture Button */}
          <Pressable
            onPress={handleCapture}
            disabled={busy}
            style={{ width: 80, height: 80, borderRadius: 40, padding: 4, borderWidth: 3, borderColor: "#ffffff40", alignItems: "center", justifyContent: "center" }}
          >
            <LinearGradient
              colors={["#4be277", "#0566d9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 66, height: 66, borderRadius: 33, alignItems: "center", justifyContent: "center" }}
            >
              {busy ? (
                <ActivityIndicator color="#003915" />
              ) : (
                <Ionicons name="camera" size={28} color="#003915" />
              )}
            </LinearGradient>
          </Pressable>

          {/* PDF */}
          <Pressable
            onPress={handleImportPDF}
            disabled={busy}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#ffffff18", borderWidth: 1, borderColor: "#ffffff30", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="document-text-outline" size={24} color="white" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
