"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import type { BudgetProgressDTO } from "@/types/budget";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  budget: BudgetProgressDTO;
  currency: string;
  onEdit: (b: BudgetProgressDTO) => void;
  onDelete: (b: BudgetProgressDTO) => void;
}

export function BudgetCard({ budget, currency, onEdit, onDelete }: Props) {
  const isOverall = !budget.categoryId;
  const name = isOverall ? "All spending" : (budget.category?.name ?? "—");
  const icon = isOverall ? "💰" : budget.category?.icon;
  const color = budget.category?.color ?? "#10b981";
  const pct = Math.round(budget.ratio * 100);
  const remaining = Number(budget.remaining);

  const indicator =
    budget.status === "over"
      ? "bg-destructive"
      : budget.status === "warning"
        ? "bg-warning"
        : "bg-primary";

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base"
              style={{ backgroundColor: `${color}1f` }}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <div className="truncate font-medium">{name}</div>
              <div className="text-xs text-muted-foreground">
                {formatMoney(budget.spent, currency)} of{" "}
                {formatMoney(budget.amount, currency)}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                aria-label="Budget actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(budget)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Progress value={pct} indicatorClassName={indicator} />

        <div className="flex items-center justify-between text-sm">
          <span
            className={cn(
              "font-medium",
              budget.status === "over"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {remaining >= 0
              ? `${formatMoney(budget.remaining, currency)} left`
              : `${formatMoney(Math.abs(remaining), currency)} over`}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {pct}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
