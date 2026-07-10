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

const CONTAINER_STYLES: Record<Variant, string> = {
  primary: "bg-brand-500 active:bg-brand-600",
  secondary: "bg-surface-raised border border-surface-border active:bg-surface-border",
  ghost: "bg-transparent",
  danger: "bg-red-600/90 active:bg-red-600",
};

const TEXT_STYLES: Record<Variant, string> = {
  primary: "text-black",
  secondary: "text-white",
  ghost: "text-brand-500",
  danger: "text-white",
};

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
  return (
    <Pressable
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5 ${CONTAINER_STYLES[variant]} ${
        isDisabled ? "opacity-50" : ""
      } ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#000000" : "#ffffff"} />
      ) : (
        icon
      )}
      <Text className={`text-base font-semibold ${TEXT_STYLES[variant]}`}>{label}</Text>
    </Pressable>
  );
}
