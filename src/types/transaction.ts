import type { TransactionType } from "@prisma/client";

import type { TransactionWithRelations } from "@/server/transactions/transaction.repo";

export interface TransactionDTO {
  id: string;
  type: TransactionType;
  amount: string;
  currencyCode: string;
  date: string;
  description: string;
  notes: string | null;
  accountId: string;
  account: { id: string; name: string; type: string; color: string; currencyCode: string };
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string;
    type: string;
  } | null;
  transferAccountId: string | null;
  transferAccount: { id: string; name: string; color: string } | null;
  transferAmount: string | null;
  tags: { id: string; name: string; color: string }[];
  createdAt: string;
}

export function serializeTransaction(t: TransactionWithRelations): TransactionDTO {
  return {
    id: t.id,
    type: t.type,
    amount: t.amount.toString(),
    currencyCode: t.currencyCode,
    date: t.date.toISOString(),
    description: t.description,
    notes: t.notes,
    accountId: t.accountId,
    account: {
      id: t.account.id,
      name: t.account.name,
      type: t.account.type,
      color: t.account.color,
      currencyCode: t.account.currencyCode,
    },
    categoryId: t.categoryId,
    category: t.category
      ? {
          id: t.category.id,
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          type: t.category.type,
        }
      : null,
    transferAccountId: t.transferAccountId,
    transferAccount: t.transferAccount
      ? {
          id: t.transferAccount.id,
          name: t.transferAccount.name,
          color: t.transferAccount.color,
        }
      : null,
    transferAmount: t.transferAmount?.toString() ?? null,
    tags: t.tags.map((tt) => ({
      id: tt.tag.id,
      name: tt.tag.name,
      color: tt.tag.color,
    })),
    createdAt: t.createdAt.toISOString(),
  };
}

export interface TransactionListResponse {
  transactions: TransactionDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
