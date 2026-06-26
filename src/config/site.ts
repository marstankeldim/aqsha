export const SITE = {
  name: "Aqsha",
  tagline: "Your money, beautifully understood.",
  description:
    "Aqsha is a premium personal finance platform — track net worth, budgets, goals, and investments across every account and currency.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

/** A warning is surfaced once spending crosses this fraction of a budget. */
export const BUDGET_WARNING_THRESHOLD = 0.85;

/** Transactions at or above this magnitude (in primary currency) are "large". */
export const LARGE_TRANSACTION_THRESHOLD = 1000;
