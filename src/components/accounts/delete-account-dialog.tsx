"use client";

import { Loader2 } from "lucide-react";

import { useDeleteAccount } from "@/hooks/use-accounts";
import type { AccountDTO } from "@/types/account";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountDTO | null;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  account,
}: DeleteAccountDialogProps) {
  const deleteMutation = useDeleteAccount();

  async function onConfirm() {
    if (!account) return;
    await deleteMutation.mutateAsync(account.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete account?</DialogTitle>
          <DialogDescription>
            This permanently deletes{" "}
            <strong className="text-foreground">{account?.name}</strong> and
            every transaction in it. This action can&apos;t be undone.
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
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
