import { Prisma, type GoalStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type {
  CreateContributionInput,
  CreateGoalInput,
  UpdateGoalInput,
} from "@/validations/goal";
import { goalRepo } from "./goal.repo";

function toDecimal(value: number | string): Prisma.Decimal {
  return new Prisma.Decimal(typeof value === "number" ? value.toString() : value);
}

/**
 * Auto-toggle between ACTIVE and COMPLETED based on progress. Manual PAUSED /
 * ARCHIVED states are left untouched.
 */
function statusAfter(
  current: Prisma.Decimal,
  target: Prisma.Decimal,
  status: GoalStatus,
): GoalStatus {
  if (status === "PAUSED" || status === "ARCHIVED") return status;
  return current.gte(target) ? "COMPLETED" : "ACTIVE";
}

async function resolveAccount(userId: string, accountId: string | null) {
  if (!accountId) return null;
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new NotFoundError("Linked account not found.");
  return account.id;
}

export const goalService = {
  list(userId: string) {
    return goalRepo.list(userId);
  },

  async get(userId: string, id: string) {
    const goal = await goalRepo.findById(userId, id);
    if (!goal) throw new NotFoundError("Goal not found.");
    return goal;
  },

  async create(userId: string, input: CreateGoalInput) {
    const accountId = await resolveAccount(userId, input.accountId ?? null);
    return goalRepo.create({
      userId,
      name: input.name,
      type: input.type,
      targetAmount: toDecimal(input.targetAmount),
      currentAmount: 0,
      currencyCode: input.currencyCode,
      targetDate: input.targetDate ?? null,
      accountId,
      color: input.color,
      status: "ACTIVE",
    });
  },

  async update(userId: string, id: string, input: UpdateGoalInput) {
    const existing = await goalRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Goal not found.");

    const data: Prisma.GoalUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.type !== undefined) data.type = input.type;
    if (input.currencyCode !== undefined) data.currencyCode = input.currencyCode;
    if (input.color !== undefined) data.color = input.color;
    if (input.targetDate !== undefined) data.targetDate = input.targetDate ?? null;
    if (input.accountId !== undefined) {
      data.accountId = await resolveAccount(userId, input.accountId ?? null);
    }
    if (input.status !== undefined) data.status = input.status;
    if (input.targetAmount !== undefined) {
      const newTarget = toDecimal(input.targetAmount);
      data.targetAmount = newTarget;
      // Re-evaluate completion against the new target (unless explicitly set).
      if (input.status === undefined) {
        data.status = statusAfter(
          existing.currentAmount,
          newTarget,
          existing.status,
        );
      }
    }
    return goalRepo.update(id, data);
  },

  async remove(userId: string, id: string) {
    const existing = await goalRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Goal not found.");
    await goalRepo.delete(id); // cascades contributions
  },

  async addContribution(
    userId: string,
    goalId: string,
    input: CreateContributionInput,
  ) {
    const goal = await goalRepo.findById(userId, goalId);
    if (!goal) throw new NotFoundError("Goal not found.");

    const amount = toDecimal(input.amount);
    await prisma.$transaction(async (tx) => {
      await tx.goalContribution.create({
        data: {
          goalId,
          userId,
          amount,
          date: input.date,
          note: input.note?.trim() || null,
        },
      });
      const newCurrent = goal.currentAmount.plus(amount);
      await tx.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrent,
          status: statusAfter(newCurrent, goal.targetAmount, goal.status),
        },
      });
    });

    return this.get(userId, goalId);
  },

  async removeContribution(
    userId: string,
    goalId: string,
    contributionId: string,
  ) {
    const goal = await goalRepo.findById(userId, goalId);
    if (!goal) throw new NotFoundError("Goal not found.");

    const contribution = await prisma.goalContribution.findFirst({
      where: { id: contributionId, goalId, userId },
    });
    if (!contribution) throw new NotFoundError("Contribution not found.");

    await prisma.$transaction(async (tx) => {
      await tx.goalContribution.delete({ where: { id: contributionId } });
      const newCurrent = goal.currentAmount.minus(contribution.amount);
      await tx.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrent,
          status: statusAfter(newCurrent, goal.targetAmount, goal.status),
        },
      });
    });

    return this.get(userId, goalId);
  },
};
