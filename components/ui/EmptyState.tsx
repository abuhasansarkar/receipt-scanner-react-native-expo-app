import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-16">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="mb-1 text-center text-base font-semibold text-surface-text">{title}</Text>
      {subtitle && <Text className="mb-6 text-center text-sm text-muted">{subtitle}</Text>}
      {action}
    </View>
  );
}
