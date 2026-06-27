"use client";

import { Loader2 } from "lucide-react";

import { useDeleteCategory } from "@/hooks/use-categories";
import type { CategoryDTO } from "@/types/category";
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
  category: CategoryDTO | null;
}

export function DeleteCategoryDialog({ open, onOpenChange, category }: Props) {
  const deleteMutation = useDeleteCategory();

  async function onConfirm() {
    if (!category) return;
    await deleteMutation.mutateAsync(category.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete category?</DialogTitle>
          <DialogDescription>
            Deleting{" "}
            <strong className="text-foreground">{category?.name}</strong> keeps
            its transactions but marks them uncategorized. Any subcategories
            become top-level, and budgets on it are removed.
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
