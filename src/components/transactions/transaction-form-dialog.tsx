"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, X } from "lucide-react";

import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import type { TransactionDTO } from "@/types/transaction";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/validations/transaction";
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
import { Textarea } from "@/components/ui/textarea";

type TxType = "INCOME" | "EXPENSE" | "TRANSFER";

const TYPE_OPTIONS: { value: TxType; label: string; activeClass: string }[] = [
  { value: "EXPENSE", label: "Expense", activeClass: "bg-background text-foreground shadow-sm" },
  { value: "INCOME", label: "Income", activeClass: "bg-background text-success shadow-sm" },
  { value: "TRANSFER", label: "Transfer", activeClass: "bg-background text-foreground shadow-sm" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionDTO | null;
  defaultType?: TxType;
}

function buildDefaults(
  t: TransactionDTO | null | undefined,
  defaultType: TxType,
): CreateTransactionInput {
  return {
    type: t?.type ?? defaultType,
    accountId: t?.accountId ?? "",
    amount: t ? Number(t.amount) : 0,
    date: t ? new Date(t.date) : new Date(),
    description: t?.description ?? "",
    notes: t?.notes ?? "",
    categoryId: t?.categoryId ?? undefined,
    transferAccountId: t?.transferAccountId ?? undefined,
    tags: t?.tags.map((tag) => tag.name) ?? [],
  };
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultType = "EXPENSE",
}: Props) {
  const isEdit = Boolean(transaction);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: buildDefaults(transaction, defaultType),
  });

  useEffect(() => {
    if (open) form.reset(buildDefaults(transaction, defaultType));
  }, [open, transaction, defaultType, form]);

  const type = form.watch("type") as TxType;
  const accountId = form.watch("accountId");

  // Default to the first account once accounts load.
  useEffect(() => {
    if (open && !accountId && accounts.length > 0) {
      form.setValue("accountId", accounts[0]!.id);
    }
  }, [open, accountId, accounts, form]);

  const sourceCurrency =
    accounts.find((a) => a.id === accountId)?.currencyCode ?? "USD";

  // Categories grouped by parent for the matching transaction type.
  const categoryOptions = useMemo(() => {
    const ofType = categories.filter((c) => c.type === type);
    const parents = ofType.filter((c) => !c.parentId);
    return parents.map((parent) => ({
      parent,
      children: ofType.filter((c) => c.parentId === parent.id),
    }));
  }, [categories, type]);

  function setType(next: TxType) {
    form.setValue("type", next);
    if (next === "TRANSFER") form.setValue("categoryId", undefined);
    else form.setValue("transferAccountId", undefined);
  }

  async function onSubmit(values: CreateTransactionInput) {
    if (isEdit && transaction) {
      await updateMutation.mutateAsync({ id: transaction.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  }

  const typeOptions = isEdit
    ? transaction?.type === "TRANSFER"
      ? TYPE_OPTIONS.filter((o) => o.value === "TRANSFER")
      : TYPE_OPTIONS.filter((o) => o.value !== "TRANSFER")
    : TYPE_OPTIONS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit transaction" : "Add transaction"}
          </DialogTitle>
          <DialogDescription>
            {type === "TRANSFER"
              ? "Move money between two of your accounts."
              : "Record income or an expense."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type toggle */}
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
                    type === option.value && option.activeClass,
                  )}
                >
                  {option.label}
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
                        {getCurrencySymbol(sourceCurrency)}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        autoFocus
                        className="pl-8 text-base"
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : e.target.valueAsNumber,
                          )
                        }
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
                    <FormLabel>{type === "TRANSFER" ? "From" : "Account"}</FormLabel>
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

              {type === "TRANSFER" ? (
                <FormField
                  control={form.control}
                  name="transferAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Destination" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts
                            .filter((a) => a.id !== accountId)
                            .map((a) => (
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
              ) : (
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
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Groceries" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tags <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <TagsInput value={field.value} onChange={field.onChange} />
                  <FormMessage />
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
                      placeholder="Anything worth remembering…"
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
                {isEdit ? "Save changes" : "Add transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const tag = input.trim();
    if (tag && !value.includes(tag) && value.length < 20) {
      onChange([...value, tag]);
    }
    setInput("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-input p-1.5">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
          } else if (e.key === "Backspace" && !input && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={addTag}
        placeholder={value.length ? "" : "Add tags…"}
        className="min-w-[6rem] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
