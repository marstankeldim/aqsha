"use client";

import { useState } from "react";
import { addMonths, startOfMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, PiggyBank, Plus } from "lucide-react";

import { useBudgets } from "@/hooks/use-budgets";
import type { BudgetProgressDTO } from "@/types/budget";
import { formatMoney } from "@/lib/money";
import { formatMonth } from "@/lib/date";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetCard } from "./budget-card";
import { BudgetFormDialog } from "./budget-form-dialog";
import { DeleteBudgetDialog } from "./delete-budget-dialog";

function SummaryFigure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function BudgetsClient() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const { data, isLoading } = useBudgets(month);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetProgressDTO | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<BudgetProgressDTO | null>(null);

  const budgets = data?.budgets ?? [];
  const currency = data?.currency ?? "USD";
  const summary = data?.summary;

  const budgetedCategoryIds = budgets
    .filter((b) => b.categoryId)
    .map((b) => b.categoryId as string);
  const hasOverall = budgets.some((b) => !b.categoryId);

  const spentRatio =
    summary && Number(summary.totalBudgeted) > 0
      ? (Number(summary.totalSpent) / Number(summary.totalBudgeted)) * 100
      : 0;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(b: BudgetProgressDTO) {
    setEditing(b);
    setFormOpen(true);
  }
  function openDelete(b: BudgetProgressDTO) {
    setDeleting(b);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Set monthly limits and track your spending against them."
      >
        <Button onClick={openCreate}>
          <Plus /> Add budget
        </Button>
      </PageHeader>

      {/* Month navigation + summary */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMonth((m) => startOfMonth(subMonths(m, 1)))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="w-40 text-center text-sm font-medium">
                {formatMonth(month)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMonth((m) => startOfMonth(addMonths(m, 1)))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {summary && Number(summary.unbudgeted) > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatMoney(summary.unbudgeted, currency)} unbudgeted
              </span>
            )}
          </div>

          {summary && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <SummaryFigure
                  label="Budgeted"
                  value={formatMoney(summary.totalBudgeted, currency)}
                />
                <SummaryFigure
                  label="Spent"
                  value={formatMoney(summary.totalSpent, currency)}
                />
                <SummaryFigure
                  label="Remaining"
                  value={formatMoney(summary.totalRemaining, currency)}
                />
              </div>
              <Progress
                value={spentRatio}
                indicatorClassName={cn(spentRatio > 100 && "bg-destructive")}
              />
            </>
          )}
        </CardContent>
      </Card>

      {isLoading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets yet"
          description="Create your first budget to start tracking spending against a monthly limit."
          action={
            <Button onClick={openCreate}>
              <Plus /> Add budget
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              currency={currency}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        budget={editing}
        budgetedCategoryIds={budgetedCategoryIds}
        hasOverall={hasOverall}
        currency={currency}
      />
      <DeleteBudgetDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        budget={deleting}
      />
    </div>
  );
}
