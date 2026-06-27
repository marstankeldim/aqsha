import { Prisma, type AccountType, type TransactionType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError, NotFoundError } from "@/lib/errors";
import { LIABILITY_TYPES } from "@/config/accounts";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { buildConverter } from "@/server/shared/fx";
import { transactionRepo } from "./transaction.repo";
import type {
  CreateTransactionInput,
  ListTransactionsParams,
} from "@/validations/transaction";

type Tx = Prisma.TransactionClient;

function isLiability(type: AccountType) {
  return LIABILITY_TYPES.includes(type);
}

function toDecimal(value: number | string): Prisma.Decimal {
  return new Prisma.Decimal(typeof value === "number" ? value.toString() : value);
}

// Signed effect of money entering/leaving an account on its stored `balance`
// (liability balances are positive = amount owed, so the signs flip).
function inflowDelta(type: AccountType, amt: Prisma.Decimal) {
  return isLiability(type) ? amt.negated() : amt;
}
function outflowDelta(type: AccountType, amt: Prisma.Decimal) {
  return isLiability(type) ? amt : amt.negated();
}

type Effects = { accountId: string; delta: Prisma.Decimal }[];

function effectsFor(params: {
  type: TransactionType;
  amount: Prisma.Decimal;
  accountId: string;
  accountType: AccountType;
  transferAccountId?: string | null;
  transferAccountType?: AccountType | null;
  transferAmount?: Prisma.Decimal | null;
}): Effects {
  const { type, amount, accountId, accountType } = params;
  if (type === "INCOME") return [{ accountId, delta: inflowDelta(accountType, amount) }];
  if (type === "EXPENSE") return [{ accountId, delta: outflowDelta(accountType, amount) }];

  const effects: Effects = [{ accountId, delta: outflowDelta(accountType, amount) }];
  if (params.transferAccountId && params.transferAccountType && params.transferAmount) {
    effects.push({
      accountId: params.transferAccountId,
      delta: inflowDelta(params.transferAccountType, params.transferAmount),
    });
  }
  return effects;
}

async function applyEffects(tx: Tx, effects: Effects, reverse = false) {
  for (const { accountId, delta } of effects) {
    await tx.account.update({
      where: { id: accountId },
      data: { balance: { increment: reverse ? delta.negated() : delta } },
    });
  }
}

async function setTags(tx: Tx, userId: string, transactionId: string, names: string[]) {
  await tx.transactionTag.deleteMany({ where: { transactionId } });
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))].slice(0, 20);
  for (const name of unique) {
    const tag = await tx.tag.upsert({
      where: { userId_name: { userId, name } },
      create: { userId, name },
      update: {},
    });
    await tx.transactionTag.create({ data: { transactionId, tagId: tag.id } });
  }
}

/** Resolves accounts and the destination amount (with FX) for a write. */
async function resolveTargets(userId: string, input: CreateTransactionInput) {
  const account = await prisma.account.findFirst({
    where: { id: input.accountId, userId },
  });
  if (!account) throw new NotFoundError("Account not found.");

  const amount = toDecimal(input.amount);

  if (input.type !== "TRANSFER") {
    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId },
      });
      if (!category) throw new NotFoundError("Category not found.");
    }
    return { account, amount, transferAccount: null, transferAmount: null };
  }

  const transferAccount = await prisma.account.findFirst({
    where: { id: input.transferAccountId ?? "", userId },
  });
  if (!transferAccount) throw new NotFoundError("Destination account not found.");

  let transferAmount = amount;
  if (account.currencyCode !== transferAccount.currencyCode) {
    const convert = await buildConverter();
    transferAmount = convert(amount, account.currencyCode, transferAccount.currencyCode);
  }

  return { account, amount, transferAccount, transferAmount };
}

export const transactionService = {
  async get(userId: string, id: string) {
    const t = await transactionRepo.findById(userId, id);
    if (!t) throw new NotFoundError("Transaction not found.");
    return t;
  },

  async create(userId: string, input: CreateTransactionInput) {
    const { account, amount, transferAccount, transferAmount } =
      await resolveTargets(userId, input);

    const created = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          userId,
          accountId: account.id,
          type: input.type,
          amount,
          currencyCode: account.currencyCode,
          date: input.date,
          description: input.description,
          notes: input.notes?.trim() || null,
          categoryId: input.type === "TRANSFER" ? null : input.categoryId || null,
          transferAccountId: transferAccount?.id ?? null,
          transferAmount,
        },
      });

      await applyEffects(
        tx,
        effectsFor({
          type: input.type,
          amount,
          accountId: account.id,
          accountType: account.type,
          transferAccountId: transferAccount?.id,
          transferAccountType: transferAccount?.type,
          transferAmount,
        }),
      );

      if (input.tags.length) await setTags(tx, userId, t.id, input.tags);
      return t;
    });

    return this.get(userId, created.id);
  },

  async update(userId: string, id: string, input: CreateTransactionInput) {
    const existing = await transactionRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Transaction not found.");

    if ((existing.type === "TRANSFER") !== (input.type === "TRANSFER")) {
      throw new AppError(
        "You can't convert a transfer to or from a regular transaction. Delete it and add a new one.",
      );
    }

    const { account, amount, transferAccount, transferAmount } =
      await resolveTargets(userId, input);

    const oldEffects = effectsFor({
      type: existing.type,
      amount: existing.amount,
      accountId: existing.accountId,
      accountType: existing.account.type,
      transferAccountId: existing.transferAccountId,
      transferAccountType: existing.transferAccount?.type ?? null,
      transferAmount: existing.transferAmount,
    });

    await prisma.$transaction(async (tx) => {
      await applyEffects(tx, oldEffects, true); // reverse the old effects

      await tx.transaction.update({
        where: { id },
        data: {
          accountId: account.id,
          type: input.type,
          amount,
          currencyCode: account.currencyCode,
          date: input.date,
          description: input.description,
          notes: input.notes?.trim() || null,
          categoryId: input.type === "TRANSFER" ? null : input.categoryId || null,
          transferAccountId: transferAccount?.id ?? null,
          transferAmount,
        },
      });

      await applyEffects(
        tx,
        effectsFor({
          type: input.type,
          amount,
          accountId: account.id,
          accountType: account.type,
          transferAccountId: transferAccount?.id,
          transferAccountType: transferAccount?.type,
          transferAmount,
        }),
      );

      await setTags(tx, userId, id, input.tags);
    });

    return this.get(userId, id);
  },

  async remove(userId: string, id: string) {
    const existing = await transactionRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Transaction not found.");

    const effects = effectsFor({
      type: existing.type,
      amount: existing.amount,
      accountId: existing.accountId,
      accountType: existing.account.type,
      transferAccountId: existing.transferAccountId,
      transferAccountType: existing.transferAccount?.type ?? null,
      transferAmount: existing.transferAmount,
    });

    await prisma.$transaction(async (tx) => {
      await applyEffects(tx, effects, true); // reverse the balance effects
      await tx.transaction.delete({ where: { id } }); // cascades tag links
    });
  },

  async list(userId: string, params: ListTransactionsParams) {
    const where: Prisma.TransactionWhereInput = { userId };
    if (params.type) where.type = params.type;
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.accountId) {
      where.OR = [
        { accountId: params.accountId },
        { transferAccountId: params.accountId },
      ];
    }
    if (params.search) {
      const s = params.search;
      where.AND = [
        {
          OR: [
            { description: { contains: s, mode: "insensitive" } },
            { merchant: { contains: s, mode: "insensitive" } },
            { notes: { contains: s, mode: "insensitive" } },
          ],
        },
      ];
    }
    if (params.from || params.to) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (params.from) dateFilter.gte = params.from;
      if (params.to) dateFilter.lte = params.to;
      where.date = dateFilter;
    }

    const orderBy: Prisma.TransactionOrderByWithRelationInput[] =
      params.sort === "amount"
        ? [{ amount: params.order }, { date: "desc" }]
        : [{ date: params.order }, { createdAt: "desc" }];

    const skip = (params.page - 1) * params.pageSize;
    const [items, total] = await Promise.all([
      transactionRepo.list({ where, orderBy, skip, take: params.pageSize }),
      transactionRepo.count(where),
    ]);

    return { items, total, page: params.page, pageSize: params.pageSize };
  },

  /** Current-month income/expense totals + recent activity for the dashboard. */
  async dashboard(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const primary = user?.primaryCurrency ?? DEFAULT_CURRENCY;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [rows, convert, recent] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: { in: ["INCOME", "EXPENSE"] },
          isExcludedFromReports: false,
          date: { gte: start, lt: end },
        },
        select: { type: true, amount: true, currencyCode: true },
      }),
      buildConverter(),
      transactionRepo.recent(userId, 6),
    ]);

    let income = new Prisma.Decimal(0);
    let expense = new Prisma.Decimal(0);
    for (const row of rows) {
      const value = convert(row.amount, row.currencyCode, primary);
      if (row.type === "INCOME") income = income.plus(value);
      else expense = expense.plus(value);
    }

    return {
      currency: primary,
      income: income.toString(),
      expense: expense.toString(),
      net: income.minus(expense).toString(),
      recent,
    };
  },
};
