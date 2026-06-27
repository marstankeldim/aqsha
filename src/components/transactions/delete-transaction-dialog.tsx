"use client";

import { Loader2 } from "lucide-react";

import { useDeleteTransaction } from "@/hooks/use-transactions";
import type { TransactionDTO } from "@/types/transaction";
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
  transaction: TransactionDTO | null;
}

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: Props) {
  const deleteMutation = useDeleteTransaction();

  async function onConfirm() {
    if (!transaction) return;
    await deleteMutation.mutateAsync(transaction.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete transaction?</DialogTitle>
          <DialogDescription>
            This removes{" "}
            <strong className="text-foreground">
              {transaction?.description}
            </strong>{" "}
            and reverses its effect on your account balance
            {transaction?.type === "TRANSFER" ? "s" : ""}.
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
