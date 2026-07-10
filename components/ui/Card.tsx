import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, style, ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: "#1a221a",
          borderRadius: 24,
          borderWidth: 1,
          borderColor: "#3d4a3d",
          padding: 16,
        },
        style,
      ]}
      className={className}
      {...props}
    />
  );
}
