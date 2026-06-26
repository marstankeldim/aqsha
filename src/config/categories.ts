import type { CategoryType } from "@prisma/client";

export interface DefaultCategory {
  name: string;
  type: CategoryType;
  icon: string; // emoji
  color: string;
  children?: { name: string; icon: string }[];
}

/**
 * Default categories provisioned for every new user. Kept here so the
 * onboarding service and any future "reset categories" action share one source.
 */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // ── Income ──────────────────────────────────────────────────────────────
  { name: "Salary", type: "INCOME", icon: "💼", color: "#22c55e" },
  { name: "Business", type: "INCOME", icon: "🏢", color: "#16a34a" },
  { name: "Investments", type: "INCOME", icon: "📈", color: "#15803d" },
  { name: "Gifts", type: "INCOME", icon: "🎁", color: "#4ade80" },
  { name: "Other Income", type: "INCOME", icon: "➕", color: "#86efac" },

  // ── Expenses ────────────────────────────────────────────────────────────
  {
    name: "Housing",
    type: "EXPENSE",
    icon: "🏠",
    color: "#6366f1",
    children: [
      { name: "Rent", icon: "🔑" },
      { name: "Mortgage", icon: "🏦" },
      { name: "Maintenance", icon: "🔧" },
    ],
  },
  {
    name: "Food",
    type: "EXPENSE",
    icon: "🍽️",
    color: "#f97316",
    children: [
      { name: "Groceries", icon: "🛒" },
      { name: "Restaurants", icon: "🍴" },
      { name: "Coffee", icon: "☕" },
    ],
  },
  {
    name: "Transportation",
    type: "EXPENSE",
    icon: "🚗",
    color: "#0ea5e9",
    children: [
      { name: "Fuel", icon: "⛽" },
      { name: "Public Transit", icon: "🚌" },
      { name: "Rideshare", icon: "🚕" },
    ],
  },
  { name: "Shopping", type: "EXPENSE", icon: "🛍️", color: "#ec4899" },
  { name: "Entertainment", type: "EXPENSE", icon: "🎬", color: "#a855f7" },
  { name: "Education", type: "EXPENSE", icon: "🎓", color: "#3b82f6" },
  { name: "Utilities", type: "EXPENSE", icon: "💡", color: "#eab308" },
  { name: "Healthcare", type: "EXPENSE", icon: "🏥", color: "#ef4444" },
  { name: "Insurance", type: "EXPENSE", icon: "🛡️", color: "#14b8a6" },
  { name: "Subscriptions", type: "EXPENSE", icon: "🔁", color: "#8b5cf6" },
  { name: "Travel", type: "EXPENSE", icon: "✈️", color: "#06b6d4" },
  { name: "Personal Care", type: "EXPENSE", icon: "💇", color: "#f43f5e" },
  { name: "Other Expense", type: "EXPENSE", icon: "📦", color: "#94a3b8" },

  // ── Transfers ─────────────────────────────────────────────────────────────
  { name: "Transfer", type: "TRANSFER", icon: "🔄", color: "#64748b" },
];
