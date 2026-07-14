import { Ionicons } from "@expo/vector-icons";
import { Component, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-surface-base px-8">
          <View className="mb-5 w-20 h-20 items-center justify-center rounded-full bg-surface-container">
            <Ionicons name="warning-outline" size={36} color="#ef4444" />
          </View>
          <Text className="mb-2 text-center text-xl font-semibold text-surface-text">
            Something went wrong
          </Text>
          <Text className="mb-8 text-center text-sm leading-5 text-muted">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </Text>
          <Pressable
            onPress={this.handleReset}
            className="overflow-hidden rounded-2xl bg-brand px-8 py-3.5"
          >
            <Text className="text-base font-semibold text-on-primary">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
