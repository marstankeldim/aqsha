import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const recurringInclude = {
  account: { select: { id: true, name: true, color: true, type: true } },
  category: { select: { id: true, name: true, icon: true, color: true } },
} satisfies Prisma.RecurringTransactionInclude;

export type RecurringWithRelations = Prisma.RecurringTransactionGetPayload<{
  include: typeof recurringInclude;
}>;

export const recurringRepo = {
  list(userId: string) {
    return prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { nextRunDate: "asc" }],
      include: recurringInclude,
    });
  },

  findById(userId: string, id: string) {
    return prisma.recurringTransaction.findFirst({
      where: { id, userId },
      include: recurringInclude,
    });
  },

  /** Active, auto-posting templates that are due (for the given user). */
  findDue(userId: string, now: Date) {
    return prisma.recurringTransaction.findMany({
      where: { userId, isActive: true, autoPost: true, nextRunDate: { lte: now } },
      include: recurringInclude,
    });
  },

  /** Same, across all users (for the cron job). */
  findDueAll(now: Date) {
    return prisma.recurringTransaction.findMany({
      where: { isActive: true, autoPost: true, nextRunDate: { lte: now } },
      include: recurringInclude,
    });
  },

  create(data: Prisma.RecurringTransactionUncheckedCreateInput) {
    return prisma.recurringTransaction.create({ data, include: recurringInclude });
  },

  update(id: string, data: Prisma.RecurringTransactionUncheckedUpdateInput) {
    return prisma.recurringTransaction.update({
      where: { id },
      data,
      include: recurringInclude,
    });
  },

  delete(id: string) {
    return prisma.recurringTransaction.delete({ where: { id } });
  },
};
