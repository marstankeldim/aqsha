"use client";

import { Loader2 } from "lucide-react";

import { useDeleteRecurring } from "@/hooks/use-recurring";
import type { RecurringDTO } from "@/types/recurring";
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
  recurring: RecurringDTO | null;
}

export function DeleteRecurringDialog({ open, onOpenChange, recurring }: Props) {
  const deleteMutation = useDeleteRecurring();

  async function onConfirm() {
    if (!recurring) return;
    await deleteMutation.mutateAsync(recurring.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete recurring transaction?</DialogTitle>
          <DialogDescription>
            This stops{" "}
            <strong className="text-foreground">{recurring?.description}</strong>{" "}
            from posting in the future. Transactions it already created are kept.
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
