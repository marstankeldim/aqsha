import type { RecurringFrequency, TransactionType } from "@prisma/client";

import type { RecurringWithRelations } from "@/server/recurring/recurring.repo";

export interface RecurringDTO {
  id: string;
  type: TransactionType;
  accountId: string;
  account: { id: string; name: string; color: string; type: string };
  categoryId: string | null;
  category: { id: string; name: string; icon: string | null; color: string } | null;
  amount: string;
  currencyCode: string;
  description: string;
  notes: string | null;
  frequency: RecurringFrequency;
  interval: number;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  lastRunDate: string | null;
  isActive: boolean;
  autoPost: boolean;
  createdAt: string;
}

export function serializeRecurring(r: RecurringWithRelations): RecurringDTO {
  return {
    id: r.id,
    type: r.type,
    accountId: r.accountId,
    account: {
      id: r.account.id,
      name: r.account.name,
      color: r.account.color,
      type: r.account.type,
    },
    categoryId: r.categoryId,
    category: r.category
      ? {
          id: r.category.id,
          name: r.category.name,
          icon: r.category.icon,
          color: r.category.color,
        }
      : null,
    amount: r.amount.toString(),
    currencyCode: r.currencyCode,
    description: r.description,
    notes: r.notes,
    frequency: r.frequency,
    interval: r.interval,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate?.toISOString() ?? null,
    nextRunDate: r.nextRunDate.toISOString(),
    lastRunDate: r.lastRunDate?.toISOString() ?? null,
    isActive: r.isActive,
    autoPost: r.autoPost,
    createdAt: r.createdAt.toISOString(),
  };
}
