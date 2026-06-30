"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Send,
  Trash2,
} from "lucide-react";

import type { RecurringDTO } from "@/types/recurring";
import { frequencyLabel } from "@/config/recurring";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  usePostRecurringNow,
  useUpdateRecurring,
} from "@/hooks/use-recurring";
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

interface Props {
  recurring: RecurringDTO;
  onEdit: (r: RecurringDTO) => void;
  onDelete: (r: RecurringDTO) => void;
}

export function RecurringCard({ recurring, onEdit, onDelete }: Props) {
  const update = useUpdateRecurring();
  const postNow = usePostRecurringNow();

  const isIncome = recurring.type === "INCOME";
  const chipColor = recurring.category?.color ?? recurring.account.color;
  const glyph = recurring.category?.icon;
  const FallbackIcon = isIncome ? ArrowDownLeft : ArrowUpRight;

  return (
    <Card className={cn(!recurring.isActive && "opacity-75")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-base"
              style={{ backgroundColor: `${chipColor}1f`, color: chipColor }}
            >
              {glyph ? <span aria-hidden>{glyph}</span> : <FallbackIcon className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <div className="truncate font-medium leading-tight">
                {recurring.description}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {frequencyLabel(recurring.frequency, recurring.interval)} ·{" "}
                {recurring.account.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-medium tabular-nums",
                isIncome ? "text-success" : "text-foreground",
              )}
            >
              {isIncome ? "+" : "−"}
              {formatMoney(recurring.amount, recurring.currencyCode, {
                signDisplay: "never",
              })}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  aria-label="Recurring actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={!recurring.isActive || postNow.isPending}
                  onClick={() => postNow.mutate(recurring.id)}
                >
                  <Send className="h-4 w-4" /> Post now
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(recurring)}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                {recurring.isActive ? (
                  <DropdownMenuItem
                    onClick={() =>
                      update.mutate({
                        id: recurring.id,
                        input: { isActive: false },
                      })
                    }
                  >
                    <Pause className="h-4 w-4" /> Pause
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() =>
                      update.mutate({
                        id: recurring.id,
                        input: { isActive: true },
                      })
                    }
                  >
                    <Play className="h-4 w-4" /> Resume
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(recurring)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            {recurring.isActive ? (
              <>Next {formatDate(recurring.nextRunDate)}</>
            ) : (
              "Paused"
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {!recurring.autoPost && <Badge variant="outline">Reminder</Badge>}
            {!recurring.isActive && <Badge variant="secondary">Paused</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
