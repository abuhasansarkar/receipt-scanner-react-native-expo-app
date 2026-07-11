import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, style, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-surface-border bg-surface-container p-4 ${className ?? ""}`}
      style={style}
      {...props}
    />
  );
}
