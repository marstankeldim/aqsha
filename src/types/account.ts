import type { Account, AccountType } from "@prisma/client";

/**
 * Wire format for an account. Prisma `Decimal` values are serialized to strings
 * to preserve precision across the network boundary (the client formats them
 * with `formatMoney`).
 */
export interface AccountDTO {
  id: string;
  name: string;
  type: AccountType;
  currencyCode: string;
  initialBalance: string;
  balance: string;
  creditLimit: string | null;
  institution: string | null;
  mask: string | null;
  color: string;
  icon: string | null;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function serializeAccount(a: Account): AccountDTO {
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    currencyCode: a.currencyCode,
    initialBalance: a.initialBalance.toString(),
    balance: a.balance.toString(),
    creditLimit: a.creditLimit?.toString() ?? null,
    institution: a.institution,
    mask: a.mask,
    color: a.color,
    icon: a.icon,
    isArchived: a.isArchived,
    sortOrder: a.sortOrder,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

/** Aggregate balances across all accounts, converted to the primary currency. */
export interface AccountSummaryDTO {
  currency: string;
  netWorth: string;
  assets: string;
  liabilities: string;
  cash: string;
  accountCount: number;
}
