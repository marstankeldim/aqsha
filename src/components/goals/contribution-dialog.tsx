"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";

import { useAddContribution, useDeleteContribution } from "@/hooks/use-goals";
import type { GoalDTO } from "@/types/goal";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { getCurrencySymbol } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: GoalDTO | null;
}

export function ContributionDialog({ open, onOpenChange, goal }: Props) {
  const add = useAddContribution();
  const del = useDeleteContribution();
  const [amount, setAmount] = useState<number>(NaN);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  // Default the date field to today each time the dialog opens.
  useEffect(() => {
    if (open) {
      setAmount(NaN);
      setNote("");
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [open]);

  const currency = goal?.currencyCode ?? "USD";

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!goal || Number.isNaN(amount) || amount <= 0) return;
    await add.mutateAsync({
      goalId: goal.id,
      input: {
        amount,
        date: new Date(`${date || format(new Date(), "yyyy-MM-dd")}T00:00:00`),
        note: note.trim() || undefined,
      },
    });
    setAmount(NaN);
    setNote("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to {goal?.name}</DialogTitle>
          {goal && (
            <DialogDescription>
              {formatMoney(goal.currentAmount, currency)} of{" "}
              {formatMoney(goal.targetAmount, currency)} saved
            </DialogDescription>
          )}
        </DialogHeader>

        {goal && (
          <>
            <Progress value={goal.ratio * 100} />

            <form onSubmit={onAdd} className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {getCurrencySymbol(currency)}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    autoFocus
                    className="pl-8"
                    value={Number.isNaN(amount) ? "" : amount}
                    onChange={(e) => setAmount(e.target.valueAsNumber)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-[9.5rem]"
                />
              </div>
              <Button type="submit" disabled={add.isPending}>
                {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add
              </Button>
            </form>
            <Input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contributions
              </div>
              {goal.contributions.length === 0 ? (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  No contributions yet.
                </p>
              ) : (
                <ul className="max-h-52 divide-y overflow-y-auto">
                  {goal.contributions.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-2 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium tabular-nums">
                          {formatMoney(c.amount, currency)}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {formatDate(c.date)}
                          {c.note ? ` · ${c.note}` : ""}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        disabled={del.isPending}
                        onClick={() =>
                          del.mutate({ goalId: goal.id, contributionId: c.id })
                        }
                        aria-label="Remove contribution"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
