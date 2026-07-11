import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function Button({
  label,
  variant = "primary",
  loading = false,
  icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === "primary") {
    return (
      <Pressable
        disabled={isDisabled}
        className={`overflow-hidden rounded-2xl ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
        {...props}
      >
        <LinearGradient
          colors={["#4be277", "#0566d9", "#b89cff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center justify-center gap-2 px-5 py-3.5"
        >
          {loading ? (
            <ActivityIndicator color="#003915" />
          ) : icon}
          <Text className="text-base font-semibold text-on-primary">{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable
        disabled={isDisabled}
        className={`flex-row items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 ${isDisabled ? "opacity-50" : "active:opacity-70"} ${className ?? ""}`}
        {...props}
      >
        {loading ? <ActivityIndicator color="#ffffff" /> : icon}
        <Text className="text-base font-semibold text-white">{label}</Text>
      </Pressable>
    );
  }

  if (variant === "danger") {
    return (
      <Pressable
        disabled={isDisabled}
        className={`flex-row items-center justify-center gap-2 rounded-2xl bg-red-600/90 px-5 py-3.5 ${isDisabled ? "opacity-50" : "active:bg-red-600"} ${className ?? ""}`}
        {...props}
      >
        {loading ? <ActivityIndicator color="#ffffff" /> : icon}
        <Text className="text-base font-semibold text-white">{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5 ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      {...props}
    >
      {loading ? <ActivityIndicator color="#4be277" /> : icon}
      <Text className="text-base font-semibold text-brand">{label}</Text>
    </Pressable>
  );
}
