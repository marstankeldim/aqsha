import type { GoalStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const goalInclude = {
  account: { select: { id: true, name: true, color: true } },
  contributions: { orderBy: { date: "desc" }, take: 50 },
} satisfies Prisma.GoalInclude;

export type GoalWithRelations = Prisma.GoalGetPayload<{
  include: typeof goalInclude;
}>;

export const goalRepo = {
  list(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: goalInclude,
    });
  },

  findById(userId: string, id: string) {
    return prisma.goal.findFirst({
      where: { id, userId },
      include: goalInclude,
    });
  },

  create(data: Prisma.GoalUncheckedCreateInput) {
    return prisma.goal.create({ data, include: goalInclude });
  },

  update(id: string, data: Prisma.GoalUncheckedUpdateInput) {
    return prisma.goal.update({ where: { id }, data, include: goalInclude });
  },

  delete(id: string) {
    return prisma.goal.delete({ where: { id } });
  },

  countByStatus(userId: string, status: GoalStatus) {
    return prisma.goal.count({ where: { userId, status } });
  },
};
