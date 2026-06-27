import { Prisma } from "@prisma/client";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";

import { prisma } from "@/lib/prisma";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { buildConverter } from "@/server/shared/fx";
import type {
  CategorySpend,
  DashboardAnalytics,
  MonthlyPoint,
} from "@/types/analytics";

const TOP_CATEGORIES = 6;
const OTHER_COLOR = "#94a3b8";
const TREND_MONTHS = 6;

function round2(d: Prisma.Decimal): number {
  return Math.round(d.toNumber() * 100) / 100;
}

type CatMeta = { id: string; name: string; color: string; icon: string | null };

export const analyticsService = {
  /** Spending-by-category (this month) + income/expense trend (last 6 months). */
  async dashboard(
    userId: string,
    now: Date = new Date(),
  ): Promise<DashboardAnalytics> {
    const monthStart = startOfMonth(now);
    const monthEnd = startOfMonth(addMonths(now, 1));
    const trendStart = startOfMonth(subMonths(now, TREND_MONTHS - 1));

    const [user, categories, monthExpenses, trendTxns, convert] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.category.findMany({
          where: { userId },
          select: { id: true, parentId: true, name: true, color: true, icon: true },
        }),
        prisma.transaction.findMany({
          where: {
            userId,
            type: "EXPENSE",
            isExcludedFromReports: false,
            date: { gte: monthStart, lt: monthEnd },
          },
          select: { categoryId: true, amount: true, currencyCode: true },
        }),
        prisma.transaction.findMany({
          where: {
            userId,
            type: { in: ["INCOME", "EXPENSE"] },
            isExcludedFromReports: false,
            date: { gte: trendStart, lt: monthEnd },
          },
          select: { type: true, amount: true, currencyCode: true, date: true },
        }),
        buildConverter(),
      ]);

    const primary = user?.primaryCurrency ?? DEFAULT_CURRENCY;
    const ZERO = new Prisma.Decimal(0);

    const catById = new Map(categories.map((c) => [c.id, c]));
    const topLevel = (categoryId: string | null): CatMeta | null => {
      if (!categoryId) return null;
      const c = catById.get(categoryId);
      if (!c) return null;
      return c.parentId ? (catById.get(c.parentId) ?? c) : c;
    };

    // ── Spending by top-level category (this month) ─────────────────────────
    const spendMap = new Map<string, { meta: CatMeta; value: Prisma.Decimal }>();
    let total = ZERO;
    let other = ZERO; // overflow + uncategorized
    for (const t of monthExpenses) {
      const v = convert(t.amount, t.currencyCode, primary);
      total = total.plus(v);
      const top = topLevel(t.categoryId);
      if (!top) {
        other = other.plus(v);
        continue;
      }
      const entry = spendMap.get(top.id) ?? { meta: top, value: ZERO };
      entry.value = entry.value.plus(v);
      spendMap.set(top.id, entry);
    }

    const sorted = [...spendMap.values()].sort((a, b) => b.value.cmp(a.value));
    const spendingByCategory: CategorySpend[] = sorted
      .slice(0, TOP_CATEGORIES)
      .map((e) => ({
        id: e.meta.id,
        name: e.meta.name,
        color: e.meta.color,
        icon: e.meta.icon,
        value: round2(e.value),
      }));
    const overflow = sorted
      .slice(TOP_CATEGORIES)
      .reduce((sum, e) => sum.plus(e.value), other);
    if (overflow.gt(0)) {
      spendingByCategory.push({
        id: "other",
        name: "Other",
        color: OTHER_COLOR,
        icon: null,
        value: round2(overflow),
      });
    }

    // ── Income vs expenses (last 6 months) ──────────────────────────────────
    const buckets = new Map<string, { income: Prisma.Decimal; expense: Prisma.Decimal }>();
    for (let i = TREND_MONTHS - 1; i >= 0; i--) {
      buckets.set(format(subMonths(now, i), "yyyy-MM"), {
        income: ZERO,
        expense: ZERO,
      });
    }
    for (const t of trendTxns) {
      const key = format(t.date, "yyyy-MM");
      const bucket = buckets.get(key);
      if (!bucket) continue;
      const v = convert(t.amount, t.currencyCode, primary);
      if (t.type === "INCOME") bucket.income = bucket.income.plus(v);
      else bucket.expense = bucket.expense.plus(v);
    }
    const monthlyTrend: MonthlyPoint[] = [...buckets.entries()].map(
      ([key, b]) => ({
        key,
        label: format(new Date(`${key}-01T00:00:00`), "MMM"),
        income: round2(b.income),
        expense: round2(b.expense),
        net: round2(b.income.minus(b.expense)),
      }),
    );

    return {
      currency: primary,
      totalSpending: round2(total),
      spendingByCategory,
      monthlyTrend,
    };
  },
};
