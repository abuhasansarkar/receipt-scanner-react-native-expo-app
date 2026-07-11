import { Text, TextInput, View, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  confidence?: number;
  error?: string;
  className?: string;
}

export function Input({ label, confidence, error, className, ...props }: InputProps) {
  const isLowConfidence = confidence !== undefined && confidence < 0.6;

  return (
    <View className="mb-4">
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="text-xs font-medium text-muted">{label}</Text>
        {confidence !== undefined && <ConfidenceHint confidence={confidence} />}
      </View>
      <TextInput
        placeholderTextColor="#5a6d5a"
        className={`rounded-xl border px-4 py-3 text-base text-surface-text ${
          isLowConfidence
            ? "border-amber-500/60 bg-amber-500/10"
            : "border-surface-border bg-surface-container"
        } ${className ?? ""}`}
        {...props}
      />
      {error && <Text className="mt-1 text-xs text-red-400">{error}</Text>}
    </View>
  );
}

function ConfidenceHint({ confidence }: { confidence: number }) {
  const color = confidence >= 0.8 ? "#22c55e" : confidence >= 0.6 ? "#eab308" : "#f97316";
  const label =
    confidence >= 0.8 ? "High confidence" : confidence >= 0.6 ? "Medium confidence" : "Tap to verify";

  return (
    <View className="flex-row items-center gap-1.5">
      <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-[10px] text-muted">{label}</Text>
    </View>
  );
}
