import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { useReceipts } from "@/features/receipts/hooks";

export default function ReceiptsScreen() {
  const router = useRouter();
  const receipts = useReceipts();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return receipts;
    const q = query.toLowerCase();
    return receipts.filter(
      (r) => r.merchant.toLowerCase().includes(q) || r.category.includes(q)
    );
  }, [receipts, query]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="px-5 pt-2">
        <Text className="mb-4 text-2xl font-bold text-white">Receipts</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by merchant or category"
          placeholderTextColor="#71717a"
          className="mb-4 rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-white"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <ReceiptCard receipt={item} onPress={() => router.push(`/receipt/${item.id}` as Href)} />
        )}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-sm text-zinc-500">
            No receipts match your search.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
