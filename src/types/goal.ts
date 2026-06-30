import type { GoalStatus, GoalType } from "@prisma/client";

import type { GoalWithRelations } from "@/server/goals/goal.repo";

export interface ContributionDTO {
  id: string;
  amount: string;
  date: string;
  note: string | null;
}

export interface GoalDTO {
  id: string;
  name: string;
  type: GoalType;
  status: GoalStatus;
  targetAmount: string;
  currentAmount: string;
  remaining: string;
  ratio: number; // currentAmount / targetAmount (can exceed 1)
  currencyCode: string;
  targetDate: string | null;
  color: string;
  accountId: string | null;
  account: { id: string; name: string; color: string } | null;
  contributions: ContributionDTO[];
  createdAt: string;
}

export function serializeGoal(g: GoalWithRelations): GoalDTO {
  const target = g.targetAmount;
  const current = g.currentAmount;
  const rem = target.minus(current);
  return {
    id: g.id,
    name: g.name,
    type: g.type,
    status: g.status,
    targetAmount: target.toString(),
    currentAmount: current.toString(),
    remaining: rem.isNegative() ? "0" : rem.toString(),
    ratio: target.gt(0) ? current.div(target).toNumber() : 0,
    currencyCode: g.currencyCode,
    targetDate: g.targetDate?.toISOString() ?? null,
    color: g.color,
    accountId: g.accountId,
    account: g.account
      ? { id: g.account.id, name: g.account.name, color: g.account.color }
      : null,
    contributions: g.contributions.map((c) => ({
      id: c.id,
      amount: c.amount.toString(),
      date: c.date.toISOString(),
      note: c.note,
    })),
    createdAt: g.createdAt.toISOString(),
  };
}
