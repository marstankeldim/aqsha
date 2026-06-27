import { Prisma } from "@prisma/client";
import { addMonths, startOfMonth } from "date-fns";

import { prisma } from "@/lib/prisma";
import { AppError, ConflictError, NotFoundError } from "@/lib/errors";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { BUDGET_WARNING_THRESHOLD } from "@/config/site";
import { buildConverter } from "@/server/shared/fx";
import type { BudgetProgressDTO, BudgetsResponse } from "@/types/budget";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/validations/budget";
import { budgetRepo } from "./budget.repo";

function statusFor(ratio: number): BudgetProgressDTO["status"] {
  if (ratio > 1) return "over";
  if (ratio >= BUDGET_WARNING_THRESHOLD) return "warning";
  return "ok";
}

export const budgetService = {
  async create(userId: string, input: CreateBudgetInput) {
    const categoryId = input.categoryId ?? null;

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId },
      });
      if (!category) throw new NotFoundError("Category not found.");
      if (category.type !== "EXPENSE") {
        throw new AppError("Budgets can only be set on expense categories.");
      }
      if (category.parentId) {
        throw new AppError(
          "Set the budget on the parent category — it already covers this subcategory.",
        );
      }
    }

    const existing = await budgetRepo.findByCategory(userId, categoryId, "MONTHLY");
    if (existing) {
      throw new ConflictError(
        categoryId
          ? "A budget already exists for this category."
          : "An overall budget already exists.",
      );
    }

    return budgetRepo.create({
      userId,
      categoryId,
      amount: new Prisma.Decimal(input.amount.toString()),
      period: "MONTHLY",
      startDate: startOfMonth(new Date()),
      name: input.name?.trim() || null,
    });
  },

  async update(userId: string, id: string, input: UpdateBudgetInput) {
    const existing = await budgetRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Budget not found.");
    return budgetRepo.update(id, {
      amount: new Prisma.Decimal(input.amount.toString()),
      name: input.name?.trim() || null,
    });
  },

  async remove(userId: string, id: string) {
    const existing = await budgetRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Budget not found.");
    await budgetRepo.delete(id);
  },

  /**
   * Budgets with this-month spending. Spending on a parent category's budget
   * includes its subcategories. All amounts are converted to the user's
   * primary currency.
   */
  async listWithProgress(userId: string, month: Date): Promise<BudgetsResponse> {
    const start = startOfMonth(month);
    const end = startOfMonth(addMonths(month, 1));

    const [user, budgets, categories, expenses, convert] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      budgetRepo.list(userId),
      prisma.category.findMany({
        where: { userId, type: "EXPENSE" },
        select: { id: true, parentId: true },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          isExcludedFromReports: false,
          date: { gte: start, lt: end },
        },
        select: { categoryId: true, amount: true, currencyCode: true },
      }),
      buildConverter(),
    ]);

    const primary = user?.primaryCurrency ?? DEFAULT_CURRENCY;
    const ZERO = new Prisma.Decimal(0);

    // Spending per category (converted to primary currency).
    const spentByCat = new Map<string, Prisma.Decimal>();
    let totalExpense = ZERO;
    let uncategorized = ZERO;
    for (const t of expenses) {
      const value = convert(t.amount, t.currencyCode, primary);
      totalExpense = totalExpense.plus(value);
      if (t.categoryId) {
        spentByCat.set(
          t.categoryId,
          (spentByCat.get(t.categoryId) ?? ZERO).plus(value),
        );
      } else {
        uncategorized = uncategorized.plus(value);
      }
    }

    // parent -> child category ids
    const childrenOf = new Map<string, string[]>();
    for (const c of categories) {
      if (c.parentId) {
        const arr = childrenOf.get(c.parentId) ?? [];
        arr.push(c.id);
        childrenOf.set(c.parentId, arr);
      }
    }

    // Overall budget first, then alphabetical by category.
    const ordered = [...budgets].sort((a, b) => {
      if (!a.categoryId && b.categoryId) return -1;
      if (a.categoryId && !b.categoryId) return 1;
      return (a.category?.name ?? "").localeCompare(b.category?.name ?? "");
    });

    const covered = new Set<string>();
    let totalBudgeted = ZERO;
    let totalSpentBudgeted = ZERO;

    const items: BudgetProgressDTO[] = ordered.map((b) => {
      let spent = ZERO;
      if (!b.categoryId) {
        spent = totalExpense;
      } else {
        const ids = [b.categoryId, ...(childrenOf.get(b.categoryId) ?? [])];
        for (const id of ids) {
          spent = spent.plus(spentByCat.get(id) ?? ZERO);
          covered.add(id);
        }
        totalBudgeted = totalBudgeted.plus(b.amount);
        totalSpentBudgeted = totalSpentBudgeted.plus(spent);
      }

      const remaining = b.amount.minus(spent);
      const ratio = b.amount.gt(0) ? spent.div(b.amount).toNumber() : 0;
      return {
        id: b.id,
        categoryId: b.categoryId,
        name: b.name,
        category: b.category
          ? {
              id: b.category.id,
              name: b.category.name,
              icon: b.category.icon,
              color: b.category.color,
            }
          : null,
        amount: b.amount.toString(),
        spent: spent.toString(),
        remaining: remaining.toString(),
        ratio,
        status: statusFor(ratio),
      };
    });

    // Spending not tracked by any category budget.
    let unbudgeted = uncategorized;
    for (const [catId, amount] of spentByCat) {
      if (!covered.has(catId)) unbudgeted = unbudgeted.plus(amount);
    }

    return {
      month: start.toISOString(),
      currency: primary,
      budgets: items,
      summary: {
        totalBudgeted: totalBudgeted.toString(),
        totalSpent: totalSpentBudgeted.toString(),
        totalRemaining: totalBudgeted.minus(totalSpentBudgeted).toString(),
        unbudgeted: unbudgeted.toString(),
      },
    };
  },
};
