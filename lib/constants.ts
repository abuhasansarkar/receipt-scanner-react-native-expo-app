import type { ReceiptCategory, SupportedCurrency } from "@/types/receipt";

export interface CategoryMeta {
  id: ReceiptCategory;
  label: string;
  icon: keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "food", label: "Food & Drink", icon: "fast-food-outline", color: "#f97316" },
  { id: "travel", label: "Travel", icon: "airplane-outline", color: "#3b82f6" },
  { id: "software", label: "Software", icon: "laptop-outline", color: "#8b5cf6" },
  { id: "office", label: "Office", icon: "briefcase-outline", color: "#eab308" },
  { id: "utilities", label: "Utilities", icon: "flash-outline", color: "#06b6d4" },
  { id: "entertainment", label: "Entertainment", icon: "film-outline", color: "#ec4899" },
  { id: "health", label: "Health", icon: "medkit-outline", color: "#22c55e" },
  { id: "other", label: "Other", icon: "pricetag-outline", color: "#64748b" },
];

export function getCategoryMeta(id: ReceiptCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const SUPPORTED_CURRENCIES: { code: SupportedCurrency; label: string; symbol: string }[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "\u20AC" },
  { code: "GBP", label: "British Pound", symbol: "\u00A3" },
  { code: "JPY", label: "Japanese Yen", symbol: "\u00A5" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "INR", label: "Indian Rupee", symbol: "\u20B9" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$" },
  { code: "MXN", label: "Mexican Peso", symbol: "MX$" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", label: "Chinese Yuan", symbol: "\u00A5" },
  { code: "KRW", label: "South Korean Won", symbol: "\u20A9" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
];

export const DEFAULT_CURRENCY = "USD" as const;

export const FREE_PLAN_MONTHLY_SCAN_LIMIT = 20;

export const TAX_DEDUCTION_CATEGORIES = [
  "Office Supplies",
  "Travel & Transportation",
  "Software & Subscriptions",
  "Professional Services",
  "Equipment & Hardware",
  "Meals & Entertainment (50%)",
  "Education & Training",
  "Utilities & Rent",
  "Other Business Expense",
];

export const TAG_PRESETS = [
  "work", "personal", "business-trip", "client", "remote-work",
  "team-lunch", "conference", "office-supplies", "subscription",
];
