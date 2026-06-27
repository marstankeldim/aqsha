import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Relations loaded with every transaction for display. */
export const transactionInclude = {
  account: {
    select: { id: true, name: true, type: true, color: true, currencyCode: true },
  },
  transferAccount: {
    select: { id: true, name: true, type: true, color: true, currencyCode: true },
  },
  category: {
    select: { id: true, name: true, icon: true, color: true, type: true },
  },
  tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
} satisfies Prisma.TransactionInclude;

export type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;

export const transactionRepo = {
  list(args: {
    where: Prisma.TransactionWhereInput;
    orderBy: Prisma.TransactionOrderByWithRelationInput[];
    skip: number;
    take: number;
  }) {
    return prisma.transaction.findMany({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      include: transactionInclude,
    });
  },

  count(where: Prisma.TransactionWhereInput) {
    return prisma.transaction.count({ where });
  },

  findById(userId: string, id: string) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: transactionInclude,
    });
  },

  recent(userId: string, take: number) {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take,
      include: transactionInclude,
    });
  },
};
