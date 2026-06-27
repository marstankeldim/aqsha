import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { CASH_TYPES, LIABILITY_TYPES } from "@/config/accounts";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { buildConverter } from "@/server/shared/fx";
import type { AccountSummaryDTO } from "@/types/account";
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "@/validations/account";
import { accountRepo } from "./account.repo";

function toDecimal(value: number | string): Prisma.Decimal {
  return new Prisma.Decimal(typeof value === "number" ? value.toString() : value);
}

export const accountService = {
  list(userId: string, includeArchived = false) {
    return accountRepo.list(userId, includeArchived);
  },

  async get(userId: string, id: string) {
    const account = await accountRepo.findById(userId, id);
    if (!account) throw new NotFoundError("Account not found.");
    return account;
  },

  async create(userId: string, input: CreateAccountInput) {
    const sortOrder = await accountRepo.nextSortOrder(userId);
    const initial = toDecimal(input.initialBalance ?? 0);

    return accountRepo.create({
      userId,
      name: input.name,
      type: input.type,
      currencyCode: input.currencyCode ?? DEFAULT_CURRENCY,
      // Balance starts at the opening balance; transactions adjust it later.
      initialBalance: initial,
      balance: initial,
      institution: input.institution?.trim() || null,
      mask: input.mask?.trim() || null,
      color: input.color,
      creditLimit:
        input.creditLimit != null ? toDecimal(input.creditLimit) : null,
      sortOrder,
    });
  },

  async update(userId: string, id: string, input: UpdateAccountInput) {
    const existing = await accountRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Account not found.");

    const data: Prisma.AccountUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.type !== undefined) data.type = input.type;
    if (input.currencyCode !== undefined) data.currencyCode = input.currencyCode;
    if (input.institution !== undefined)
      data.institution = input.institution.trim() || null;
    if (input.mask !== undefined) data.mask = input.mask.trim() || null;
    if (input.color !== undefined) data.color = input.color;
    if (input.isArchived !== undefined) data.isArchived = input.isArchived;
    if (input.creditLimit !== undefined)
      data.creditLimit =
        input.creditLimit != null ? toDecimal(input.creditLimit) : null;

    // Editing the opening balance shifts the running balance by the same delta,
    // preserving the effect of any transactions already recorded.
    if (input.initialBalance !== undefined) {
      const newInitial = toDecimal(input.initialBalance);
      const delta = newInitial.minus(existing.initialBalance);
      data.initialBalance = newInitial;
      data.balance = existing.balance.plus(delta);
    }

    return accountRepo.update(id, data);
  },

  async remove(userId: string, id: string) {
    const existing = await accountRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Account not found.");
    // Cascades to transactions/holdings via the schema's onDelete rules.
    await accountRepo.delete(id);
  },

  /** Net worth, cash, assets and liabilities in the user's primary currency. */
  async summary(userId: string): Promise<AccountSummaryDTO> {
    const [user, accounts, convert] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      accountRepo.list(userId, false),
      buildConverter(),
    ]);

    const primary = user?.primaryCurrency ?? DEFAULT_CURRENCY;
    const zero = new Prisma.Decimal(0);
    let assets = zero;
    let liabilities = zero;
    let cash = zero;

    for (const account of accounts) {
      const balance = convert(account.balance, account.currencyCode, primary);
      if (LIABILITY_TYPES.includes(account.type)) {
        liabilities = liabilities.plus(balance);
      } else {
        assets = assets.plus(balance);
        if (CASH_TYPES.includes(account.type)) cash = cash.plus(balance);
      }
    }

    return {
      currency: primary,
      netWorth: assets.minus(liabilities).toString(),
      assets: assets.toString(),
      liabilities: liabilities.toString(),
      cash: cash.toString(),
      accountCount: accounts.length,
    };
  },
};
