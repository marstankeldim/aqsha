import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const categoryRepo = {
  listByUser(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
  },

  count(userId: string) {
    return prisma.category.count({ where: { userId } });
  },

  findById(userId: string, id: string) {
    return prisma.category.findFirst({ where: { id, userId } });
  },

  childrenCount(parentId: string) {
    return prisma.category.count({ where: { parentId } });
  },

  create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({ data });
  },

  update(id: string, data: Prisma.CategoryUncheckedUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },

  async nextSortOrder(userId: string): Promise<number> {
    const agg = await prisma.category.aggregate({
      where: { userId },
      _max: { sortOrder: true },
    });
    return (agg._max.sortOrder ?? -1) + 1;
  },
};
