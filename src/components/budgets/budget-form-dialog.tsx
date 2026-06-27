"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { getCurrencySymbol } from "@/lib/currency";
import { useCategories } from "@/hooks/use-categories";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import type { BudgetProgressDTO } from "@/types/budget";
import {
  createBudgetSchema,
  type CreateBudgetInput,
} from "@/validations/budget";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OVERALL = "__overall__";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: BudgetProgressDTO | null;
  budgetedCategoryIds: string[];
  hasOverall: boolean;
  currency: string;
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  budget,
  budgetedCategoryIds,
  hasOverall,
  currency,
}: Props) {
  const isEdit = Boolean(budget);
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const available = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.type === "EXPENSE" &&
          !c.parentId &&
          !budgetedCategoryIds.includes(c.id),
      ),
    [categories, budgetedCategoryIds],
  );

  const form = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: { categoryId: undefined, amount: 0 },
  });

  // Re-runs when the categories query resolves, so the default category
  // populates even if it loaded after the dialog opened.
  useEffect(() => {
    if (!open) return;
    if (budget) {
      form.reset({ categoryId: budget.categoryId, amount: Number(budget.amount) });
    } else {
      form.reset({
        categoryId: available[0]?.id ?? (hasOverall ? undefined : null),
        amount: NaN,
      });
    }
  }, [open, budget, available, hasOverall, form]);

  const nothingToBudget = !isEdit && available.length === 0 && hasOverall;

  async function onSubmit(values: CreateBudgetInput) {
    if (isEdit && budget) {
      await updateMutation.mutateAsync({
        id: budget.id,
        input: { amount: values.amount },
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  }

  const editName = budget?.categoryId
    ? (budget.category?.name ?? "Category")
    : "All spending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit budget" : "New budget"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Adjust the monthly limit for ${editName}.`
              : "Set a monthly spending limit for a category."}
          </DialogDescription>
        </DialogHeader>

        {nothingToBudget ? (
          <p className="py-4 text-sm text-muted-foreground">
            Every expense category already has a budget. Edit an existing one, or
            add a new category first.
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isEdit ? (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Category</span>
                  <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    {budget?.category?.icon} {editName}
                  </div>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value === null ? OVERALL : (field.value ?? undefined)}
                        onValueChange={(v) =>
                          field.onChange(v === OVERALL ? null : v)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!hasOverall && (
                            <SelectItem value={OVERALL}>
                              💰 Overall (all spending)
                            </SelectItem>
                          )}
                          {available.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <span className="flex items-center gap-2">
                                <span aria-hidden>{c.icon}</span>
                                {c.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly limit</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {getCurrencySymbol(currency)}
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          autoFocus
                          className="pl-8"
                          value={Number.isNaN(field.value) ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEdit ? "Save changes" : "Create budget"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
