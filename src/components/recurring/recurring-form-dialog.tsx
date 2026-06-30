"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { FREQUENCIES } from "@/config/recurring";
import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateRecurring,
  useUpdateRecurring,
} from "@/hooks/use-recurring";
import type { RecurringDTO } from "@/types/recurring";
import {
  createRecurringSchema,
  type CreateRecurringInput,
} from "@/validations/recurring";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type RType = "INCOME" | "EXPENSE";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurring?: RecurringDTO | null;
}

function buildDefaults(r: RecurringDTO | null | undefined): CreateRecurringInput {
  return {
    type: (r?.type as RType) ?? "EXPENSE",
    accountId: r?.accountId ?? "",
    categoryId: r?.categoryId ?? undefined,
    amount: r ? Number(r.amount) : NaN,
    description: r?.description ?? "",
    notes: r?.notes ?? "",
    frequency: r?.frequency ?? "MONTHLY",
    interval: r?.interval ?? 1,
    startDate: r ? new Date(r.startDate) : new Date(),
    endDate: r?.endDate ? new Date(r.endDate) : null,
    autoPost: r?.autoPost ?? true,
  };
}

export function RecurringFormDialog({ open, onOpenChange, recurring }: Props) {
  const isEdit = Boolean(recurring);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateRecurring();
  const updateMutation = useUpdateRecurring();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CreateRecurringInput>({
    resolver: zodResolver(createRecurringSchema),
    defaultValues: buildDefaults(recurring),
  });

  useEffect(() => {
    if (open) form.reset(buildDefaults(recurring));
  }, [open, recurring, form]);

  const type = form.watch("type") as RType;
  const accountId = form.watch("accountId");
  const currency =
    accounts.find((a) => a.id === accountId)?.currencyCode ?? "USD";

  // Default to the first account once accounts load.
  useEffect(() => {
    if (open && !accountId && accounts.length > 0) {
      form.setValue("accountId", accounts[0]!.id);
    }
  }, [open, accountId, accounts, form]);

  const categoryOptions = useMemo(() => {
    const ofType = categories.filter((c) => c.type === type);
    const parents = ofType.filter((c) => !c.parentId);
    return parents.map((parent) => ({
      parent,
      children: ofType.filter((c) => c.parentId === parent.id),
    }));
  }, [categories, type]);

  function setType(next: RType) {
    form.setValue("type", next);
    form.setValue("categoryId", undefined);
  }

  async function onSubmit(values: CreateRecurringInput) {
    if (isEdit && recurring) {
      await updateMutation.mutateAsync({ id: recurring.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit recurring" : "New recurring transaction"}
          </DialogTitle>
          <DialogDescription>
            Rent, salary, subscriptions, and bills — scheduled to post
            automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["EXPENSE", "INCOME"] as RType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
                    type === t &&
                      (t === "INCOME"
                        ? "bg-background text-success shadow-sm"
                        : "bg-background text-foreground shadow-sm"),
                  )}
                >
                  {t === "INCOME" ? "Income" : "Expense"}
                </button>
              ))}
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {getCurrencySymbol(currency)}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8 text-base"
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-64">
                        {categoryOptions.map(({ parent, children }) => (
                          <div key={parent.id}>
                            <SelectItem value={parent.id}>
                              <span className="flex items-center gap-2">
                                <span aria-hidden>{parent.icon}</span>
                                {parent.name}
                              </span>
                            </SelectItem>
                            {children.map((child) => (
                              <SelectItem key={child.id} value={child.id}>
                                <span className="flex items-center gap-2 pl-3 text-muted-foreground">
                                  <span aria-hidden>{child.icon}</span>
                                  {child.name}
                                </span>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rent, Netflix, Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat every</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 1 : e.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isEdit}
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(`${e.target.value}T00:00:00`)
                              : new Date(),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End date{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(`${e.target.value}T00:00:00`)
                              : null,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="autoPost"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Automatically post</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {field.value
                        ? "Posts on schedule without asking."
                        : "Acts as a reminder — you post each one manually."}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      {...field}
                      value={field.value ?? ""}
                    />
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
                {isEdit ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
