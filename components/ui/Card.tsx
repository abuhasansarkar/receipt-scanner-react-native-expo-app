import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-surface-border bg-surface-raised p-4 ${className ?? ""}`}
      {...props}
    />
  );
}
