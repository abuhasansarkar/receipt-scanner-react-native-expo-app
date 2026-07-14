import { useCallback, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import type { ScanResult } from "@/types/api";

import {
  extractReceiptData,
  extractReceiptDataFromPDF,
  prepareReceiptImage,
  readFileAsBase64,
} from "./service";

interface ScanState {
  isProcessing: boolean;
  error: string | null;
}

export interface ScanOutcome {
  imageUri: string;
  result: ScanResult;
  source: "camera" | "gallery" | "pdf";
}

export function useScanner() {
  const [state, setState] = useState<ScanState>({
    isProcessing: false,
    error: null,
  });

  const processImage = useCallback(
    async (uri: string, source: "camera" | "gallery" = "camera"): Promise<ScanOutcome | null> => {
      setState({ isProcessing: true, error: null });
      try {
        const prepared = await prepareReceiptImage(uri);
        const result = await extractReceiptData(prepared);
        setState({ isProcessing: false, error: null });
        return { imageUri: prepared.uri, result, source };
      } catch (err) {
        setState({
          isProcessing: false,
          error:
            err instanceof Error ? err.message : "Failed to scan receipt.",
        });
        return null;
      }
    },
    []
  );

  const processPDF = useCallback(
    async (uri: string): Promise<ScanOutcome | null> => {
      setState({ isProcessing: true, error: null });
      try {
        const base64 = await readFileAsBase64(uri);
        const result = await extractReceiptDataFromPDF(base64);
        setState({ isProcessing: false, error: null });
        return { imageUri: uri, result, source: "pdf" };
      } catch (err) {
        setState({
          isProcessing: false,
          error:
            err instanceof Error ? err.message : "Failed to scan PDF receipt.",
        });
        return null;
      }
    },
    []
  );

  const pickFromLibrary = useCallback(async (): Promise<ScanOutcome | null> => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setState((s) => ({
        ...s,
        error: "Photo library permission is required.",
      }));
      return null;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (picked.canceled || !picked.assets[0]) return null;
    return processImage(picked.assets[0].uri, "gallery");
  }, [processImage]);

  const pickPDF = useCallback(async (): Promise<ScanOutcome | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) return null;
      return processPDF(result.assets[0].uri);
    } catch (err) {
      setState({
        isProcessing: false,
        error:
          err instanceof Error ? err.message : "Failed to pick PDF file.",
      });
      return null;
    }
  }, [processPDF]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return { ...state, processImage, processPDF, pickFromLibrary, pickPDF, clearError };
}
