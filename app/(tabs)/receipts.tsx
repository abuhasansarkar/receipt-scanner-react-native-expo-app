import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { useReceipts } from "@/features/receipts/hooks";
import type { ReceiptCategory } from "@/types/receipt";

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Food", value: "food" },
  { label: "Travel", value: "travel" },
  { label: "Software", value: "software" },
  { label: "Office", value: "office" },
  { label: "Health", value: "health" },
  { label: "Other", value: "other" },
];

export default function ReceiptsScreen() {
  const router = useRouter();
  const receipts = useReceipts();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = receipts;
    if (activeFilter !== "all") {
      result = result.filter((r) => r.category === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (r) => r.merchant.toLowerCase().includes(q) || r.category.includes(q)
      );
    }
    return result;
  }, [receipts, query, activeFilter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e150e" }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#dce5d9", lineHeight: 34, letterSpacing: -0.28 }}>
            Receipts
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 12, color: "#869585" }}>{receipts.length} total</Text>
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#1a221a", borderRadius: 12, borderWidth: 1, borderColor: "#3d4a3d", paddingHorizontal: 12, marginBottom: 12 }}>
          <Ionicons name="search-outline" size={18} color="#869585" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search receipts..."
            placeholderTextColor="#869585"
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14, color: "#dce5d9" }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#869585" />
            </Pressable>
          )}
        </View>

        {/* Category Filter Pills */}
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setActiveFilter(item.value)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 9999,
                backgroundColor: activeFilter === item.value ? "#4be277" : "#1a221a",
                borderWidth: 1,
                borderColor: activeFilter === item.value ? "#4be277" : "#3d4a3d",
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: "600",
                color: activeFilter === item.value ? "#003915" : "#bccbb9",
                letterSpacing: 0.3,
              }}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ReceiptCard
            receipt={item}
            onPress={() => router.push(`/receipt/${item.id}` as Href)}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#1a221a", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="receipt-outline" size={28} color="#3d4a3d" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#dce5d9", marginBottom: 6 }}>No receipts found</Text>
            <Text style={{ fontSize: 14, color: "#869585", textAlign: "center" }}>
              {query ? "Try a different search term" : "Scan your first receipt to get started"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
