import type { BudgetPeriod, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const budgetInclude = {
  category: {
    select: { id: true, name: true, icon: true, color: true, type: true },
  },
} satisfies Prisma.BudgetInclude;

export type BudgetWithCategory = Prisma.BudgetGetPayload<{
  include: typeof budgetInclude;
}>;

export const budgetRepo = {
  list(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      include: budgetInclude,
    });
  },

  findById(userId: string, id: string) {
    return prisma.budget.findFirst({
      where: { id, userId },
      include: budgetInclude,
    });
  },

  findByCategory(
    userId: string,
    categoryId: string | null,
    period: BudgetPeriod,
  ) {
    return prisma.budget.findFirst({
      where: { userId, categoryId, period },
    });
  },

  create(data: Prisma.BudgetUncheckedCreateInput) {
    return prisma.budget.create({ data, include: budgetInclude });
  },

  update(id: string, data: Prisma.BudgetUncheckedUpdateInput) {
    return prisma.budget.update({ where: { id }, data, include: budgetInclude });
  },

  delete(id: string) {
    return prisma.budget.delete({ where: { id } });
  },
};
