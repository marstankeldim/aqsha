"use client";

import { Loader2 } from "lucide-react";

import { useDeleteGoal } from "@/hooks/use-goals";
import type { GoalDTO } from "@/types/goal";
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
  goal: GoalDTO | null;
}

export function DeleteGoalDialog({ open, onOpenChange, goal }: Props) {
  const deleteMutation = useDeleteGoal();

  async function onConfirm() {
    if (!goal) return;
    await deleteMutation.mutateAsync(goal.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete goal?</DialogTitle>
          <DialogDescription>
            This permanently deletes{" "}
            <strong className="text-foreground">{goal?.name}</strong> and all of
            its contributions. This can&apos;t be undone.
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
            Delete goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
