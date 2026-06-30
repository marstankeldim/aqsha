"use client";

import {
  CalendarDays,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";

import type { GoalDTO } from "@/types/goal";
import { GOAL_TYPE_BY_VALUE } from "@/config/goals";
import { formatMoney } from "@/lib/money";
import { formatDate, formatRelative } from "@/lib/date";
import { useUpdateGoal } from "@/hooks/use-goals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoalProgressRing } from "./goal-progress-ring";

interface Props {
  goal: GoalDTO;
  onEdit: (g: GoalDTO) => void;
  onDelete: (g: GoalDTO) => void;
  onContribute: (g: GoalDTO) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: Props) {
  const meta = GOAL_TYPE_BY_VALUE[goal.type];
  const Icon = meta?.icon;
  const updateGoal = useUpdateGoal();

  const isCompleted = goal.status === "COMPLETED";
  const isPaused = goal.status === "PAUSED";
  const pct = Math.round(goal.ratio * 100);
  const overdue =
    goal.targetDate && !isCompleted && new Date(goal.targetDate) < new Date();

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
              style={{ backgroundColor: `${goal.color}1f`, color: goal.color }}
            >
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </span>
            <div className="min-w-0">
              <div className="truncate font-medium leading-tight">
                {goal.name}
              </div>
              <div className="text-xs text-muted-foreground">{meta?.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isCompleted && <Badge variant="success">Completed</Badge>}
            {isPaused && <Badge variant="secondary">Paused</Badge>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label="Goal actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onContribute(goal)}>
                  <Plus className="h-4 w-4" /> Add contribution
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                {isPaused ? (
                  <DropdownMenuItem
                    onClick={() =>
                      updateGoal.mutate({
                        id: goal.id,
                        input: { status: "ACTIVE" },
                      })
                    }
                  >
                    <Play className="h-4 w-4" /> Resume
                  </DropdownMenuItem>
                ) : (
                  !isCompleted && (
                    <DropdownMenuItem
                      onClick={() =>
                        updateGoal.mutate({
                          id: goal.id,
                          input: { status: "PAUSED" },
                        })
                      }
                    >
                      <Pause className="h-4 w-4" /> Pause
                    </DropdownMenuItem>
                  )
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(goal)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <GoalProgressRing value={pct} color={goal.color}>
            <span className="text-sm font-semibold tabular-nums">{pct}%</span>
          </GoalProgressRing>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-lg font-semibold tabular-nums">
              {formatMoney(goal.currentAmount, goal.currencyCode)}
            </div>
            <div className="text-xs text-muted-foreground">
              of {formatMoney(goal.targetAmount, goal.currencyCode)}
              {!isCompleted && (
                <>
                  {" · "}
                  {formatMoney(goal.remaining, goal.currencyCode)} to go
                </>
              )}
            </div>
            {goal.targetDate && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  overdue ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                {formatDate(goal.targetDate, "MMM yyyy")}
                {!isCompleted && (
                  <span>· {overdue ? "overdue" : formatRelative(goal.targetDate)}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {!isCompleted && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onContribute(goal)}
          >
            <Plus className="h-4 w-4" /> Add contribution
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
