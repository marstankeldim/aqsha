"use client";

import { Loader2 } from "lucide-react";

import { useDeleteBudget } from "@/hooks/use-budgets";
import type { BudgetProgressDTO } from "@/types/budget";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetProgressDTO | null;
}

export function DeleteBudgetDialog({ open, onOpenChange, budget }: Props) {
  const deleteMutation = useDeleteBudget();
  const name = budget?.categoryId
    ? (budget.category?.name ?? "this category")
    : "overall spending";

  async function onConfirm() {
    if (!budget) return;
    await deleteMutation.mutateAsync(budget.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete budget?</DialogTitle>
          <DialogDescription>
            This removes the monthly budget for{" "}
            <strong className="text-foreground">{name}</strong>. Your
            transactions aren&apos;t affected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
