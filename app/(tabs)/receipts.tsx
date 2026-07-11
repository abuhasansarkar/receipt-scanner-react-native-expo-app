import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { useAuth } from "@/features/auth/hooks";
import { useReceipts } from "@/features/receipts/hooks";
import type { Receipt } from "@/types/receipt";

function formatDateSectionLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDate(receipts: Receipt[]): { title: string; data: Receipt[] }[] {
  const groups = new Map<string, Receipt[]>();
  for (const r of receipts) {
    const label = formatDateSectionLabel(r.date);
    const list = groups.get(label) ?? [];
    list.push(r);
    groups.set(label, list);
  }
  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Food", value: "food" },
  { label: "Travel", value: "travel" },
  { label: "Office", value: "office" },
];

export default function ReceiptsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const receipts = useReceipts();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

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

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  const data = useMemo(() => {
    const items: { type: "section" | "receipt"; value: string | Receipt; sectionTitle: string }[] = [];
    for (const section of sections) {
      items.push({ type: "section", value: section.title, sectionTitle: section.title });
      for (const r of section.data) {
        items.push({ type: "receipt", value: r, sectionTitle: section.title });
      }
    }
    return items;
  }, [sections]);

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={["top"]}>
      <FlatList
        data={data}
        keyExtractor={(item) =>
          item.type === "section" ? `section-${item.value}` : (item.value as Receipt).id
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View className="flex-row items-center justify-between mt-2 mb-4">
              <View className="flex-row items-center gap-3">
                <View className="header-avatar">
                  <Text className="text-sm font-semibold text-brand">{userInitial}</Text>
                </View>
                <Text className="text-lg font-bold tracking-tight text-brand">
                  AuraReceipt
                </Text>
              </View>
              <View className="icon-40">
                <Ionicons name="notifications-outline" size={20} color="#dce5d9" />
              </View>
            </View>

            {/* Search Bar */}
            <View className="search-bar mb-3">
              <Ionicons name="search-outline" size={18} color="#869585" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search receipts..."
                placeholderTextColor="#869585"
                className="flex-1 px-2 py-3 text-sm text-surface-text"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} className="mr-2">
                  <Ionicons name="close-circle" size={18} color="#869585" />
                </Pressable>
              )}
              <View className="w-px h-5 bg-surface-border mx-1" />
              <Pressable onPress={() => {}}>
                <Ionicons name="options-outline" size={20} color="#869585" />
              </Pressable>
            </View>

            {/* Filter Pills */}
            <View className="flex-row gap-2 mb-4">
              {FILTERS.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setActiveFilter(item.value)}
                  className={activeFilter === item.value ? "pill-sm-active" : "pill-sm"}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      activeFilter === item.value ? "text-on-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="items-center pt-16">
            <View className="w-16 h-16 items-center justify-center rounded-full bg-surface-container mb-4">
              <Ionicons name="receipt-outline" size={28} color="#3d4a3d" />
            </View>
            <Text className="mb-1.5 text-base font-semibold text-surface-text">No receipts found</Text>
            <Text className="text-center text-sm text-muted">
              {query ? "Try a different search term" : "Scan your first receipt to get started"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === "section") {
            return (
              <Text className="section-label mt-2 mb-2">
                {item.value as string}
              </Text>
            );
          }
          const receipt = item.value as Receipt;
          return (
            <ReceiptCard
              receipt={receipt}
              onPress={() => router.push(`/receipt/${receipt.id}` as Href)}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}
