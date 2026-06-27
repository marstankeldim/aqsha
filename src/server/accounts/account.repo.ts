import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Data-access for accounts. Pure Prisma calls — ownership checks and business
 * rules live in the service layer.
 */
export const accountRepo = {
  list(userId: string, includeArchived = false) {
    return prisma.account.findMany({
      where: { userId, ...(includeArchived ? {} : { isArchived: false }) },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  },

  findById(userId: string, id: string) {
    return prisma.account.findFirst({ where: { id, userId } });
  },

  create(data: Prisma.AccountUncheckedCreateInput) {
    return prisma.account.create({ data });
  },

  update(id: string, data: Prisma.AccountUncheckedUpdateInput) {
    return prisma.account.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.account.delete({ where: { id } });
  },

  async nextSortOrder(userId: string): Promise<number> {
    const agg = await prisma.account.aggregate({
      where: { userId },
      _max: { sortOrder: true },
    });
    return (agg._max.sortOrder ?? -1) + 1;
  },
};
