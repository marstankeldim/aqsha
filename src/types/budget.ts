export type BudgetStatus = "ok" | "warning" | "over";

export interface BudgetProgressDTO {
  id: string;
  categoryId: string | null;
  name: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string;
  } | null;
  amount: string;
  spent: string;
  remaining: string;
  /** spent / amount, where >1 means over budget. */
  ratio: number;
  status: BudgetStatus;
}

export interface BudgetsResponse {
  /** ISO timestamp of the first day of the month shown. */
  month: string;
  currency: string;
  budgets: BudgetProgressDTO[];
  summary: {
    totalBudgeted: string;
    totalSpent: string;
    totalRemaining: string;
    /** Expenses this month not covered by any category budget. */
    unbudgeted: string;
  };
}
