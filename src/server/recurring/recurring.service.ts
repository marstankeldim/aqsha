import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError, NotFoundError } from "@/lib/errors";
import { advanceDate } from "@/lib/recurrence";
import { transactionService } from "@/server/transactions/transaction.service";
import {
  recurringRepo,
  type RecurringWithRelations,
} from "./recurring.repo";
import type {
  CreateRecurringInput,
  UpdateRecurringInput,
} from "@/validations/recurring";

// Safety cap so a far-past start date with a tiny interval can't run away.
const MAX_CATCHUP = 120;

function toDecimal(value: number | string): Prisma.Decimal {
  return new Prisma.Decimal(typeof value === "number" ? value.toString() : value);
}

async function ensureAccount(userId: string, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new NotFoundError("Account not found.");
  return account;
}

async function ensureCategory(userId: string, categoryId: string | null) {
  if (!categoryId) return;
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) throw new NotFoundError("Category not found.");
}

export const recurringService = {
  list(userId: string) {
    return recurringRepo.list(userId);
  },

  async get(userId: string, id: string) {
    const r = await recurringRepo.findById(userId, id);
    if (!r) throw new NotFoundError("Recurring transaction not found.");
    return r;
  },

  async create(userId: string, input: CreateRecurringInput) {
    const account = await ensureAccount(userId, input.accountId);
    await ensureCategory(userId, input.categoryId ?? null);

    return recurringRepo.create({
      userId,
      accountId: account.id,
      categoryId: input.categoryId || null,
      type: input.type,
      amount: toDecimal(input.amount),
      currencyCode: account.currencyCode,
      description: input.description,
      notes: input.notes?.trim() || null,
      frequency: input.frequency,
      interval: input.interval,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      nextRunDate: input.startDate,
      lastRunDate: null,
      isActive: true,
      autoPost: input.autoPost,
    });
  },

  async update(userId: string, id: string, input: UpdateRecurringInput) {
    const existing = await recurringRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Recurring transaction not found.");

    const data: Prisma.RecurringTransactionUncheckedUpdateInput = {};
    if (input.type !== undefined) data.type = input.type;
    if (input.accountId !== undefined) {
      const account = await ensureAccount(userId, input.accountId);
      data.accountId = account.id;
      data.currencyCode = account.currencyCode;
    }
    if (input.categoryId !== undefined) {
      await ensureCategory(userId, input.categoryId ?? null);
      data.categoryId = input.categoryId || null;
    }
    if (input.amount !== undefined) data.amount = toDecimal(input.amount);
    if (input.description !== undefined) data.description = input.description;
    if (input.notes !== undefined) data.notes = input.notes.trim() || null;
    if (input.endDate !== undefined) data.endDate = input.endDate ?? null;
    if (input.autoPost !== undefined) data.autoPost = input.autoPost;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    // Changing the cadence re-bases the next run date off the last run.
    if (input.frequency !== undefined || input.interval !== undefined) {
      const frequency = input.frequency ?? existing.frequency;
      const interval = input.interval ?? existing.interval;
      if (input.frequency !== undefined) data.frequency = input.frequency;
      if (input.interval !== undefined) data.interval = input.interval;
      data.nextRunDate = existing.lastRunDate
        ? advanceDate(existing.lastRunDate, frequency, interval)
        : existing.startDate;
    }

    return recurringRepo.update(id, data);
  },

  async remove(userId: string, id: string) {
    const existing = await recurringRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Recurring transaction not found.");
    // Generated transactions survive; their recurringId is set null (SetNull).
    await recurringRepo.delete(id);
  },

  /** Post one occurrence at `date`, skipping if it was already posted. */
  async postOccurrence(r: RecurringWithRelations, date: Date): Promise<boolean> {
    const already = await prisma.transaction.findFirst({
      where: { recurringId: r.id, date },
    });
    if (already) return false;
    await transactionService.create(
      r.userId,
      {
        type: r.type,
        accountId: r.accountId,
        amount: r.amount.toNumber(),
        date,
        description: r.description,
        notes: r.notes ?? undefined,
        categoryId: r.categoryId ?? undefined,
        tags: [],
      },
      r.id,
    );
    return true;
  },

  /** Catch up a single template to `now`, posting every missed occurrence. */
  async processDue(r: RecurringWithRelations, now: Date): Promise<number> {
    let posted = 0;
    let nextRun = r.nextRunDate;
    let lastRun = r.lastRunDate;
    let active = r.isActive;
    let iterations = 0;

    while (
      active &&
      nextRun.getTime() <= now.getTime() &&
      iterations < MAX_CATCHUP
    ) {
      if (r.endDate && nextRun.getTime() > r.endDate.getTime()) {
        active = false;
        break;
      }
      if (await this.postOccurrence(r, nextRun)) posted++;
      lastRun = nextRun;
      nextRun = advanceDate(nextRun, r.frequency, r.interval);
      iterations++;
      if (r.endDate && nextRun.getTime() > r.endDate.getTime()) active = false;
    }

    await recurringRepo.update(r.id, {
      nextRunDate: nextRun,
      lastRunDate: lastRun,
      isActive: active,
    });
    return posted;
  },

  async runDue(userId: string, now: Date = new Date()): Promise<number> {
    const due = await recurringRepo.findDue(userId, now);
    let posted = 0;
    for (const r of due) posted += await this.processDue(r, now);
    return posted;
  },

  async runDueForAll(now: Date = new Date()): Promise<number> {
    const due = await recurringRepo.findDueAll(now);
    let posted = 0;
    for (const r of due) posted += await this.processDue(r, now);
    return posted;
  },

  /** Manually post the next occurrence now (also works for reminder-only ones). */
  async postNext(userId: string, id: string) {
    const r = await recurringRepo.findById(userId, id);
    if (!r) throw new NotFoundError("Recurring transaction not found.");
    if (!r.isActive) throw new AppError("This recurring transaction is paused.");

    await this.postOccurrence(r, r.nextRunDate);
    const next = advanceDate(r.nextRunDate, r.frequency, r.interval);
    const active = !(r.endDate && next.getTime() > r.endDate.getTime());
    await recurringRepo.update(r.id, {
      nextRunDate: next,
      lastRunDate: r.nextRunDate,
      isActive: active,
    });
    return this.get(userId, id);
  },
};
