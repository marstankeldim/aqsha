"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCategories, useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import type { CategoryDTO } from "@/types/category";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/validations/category";
import { ColorSwatches } from "@/components/shared/color-swatches";
import { EmojiPicker } from "@/components/shared/emoji-picker";
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

type CatType = "INCOME" | "EXPENSE" | "TRANSFER";
const TYPES: { value: CatType; label: string }[] = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
  { value: "TRANSFER", label: "Transfer" },
];
const NONE = "__none__";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryDTO | null;
  defaultType?: CatType;
}

function buildDefaults(
  c: CategoryDTO | null | undefined,
  defaultType: CatType,
): CreateCategoryInput {
  return {
    name: c?.name ?? "",
    type: c?.type ?? defaultType,
    parentId: c?.parentId ?? undefined,
    icon: c?.icon ?? "📦",
    color: c?.color ?? "#10b981",
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  defaultType = "EXPENSE",
}: Props) {
  const isEdit = Boolean(category);
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: buildDefaults(category, defaultType),
  });

  useEffect(() => {
    if (open) form.reset(buildDefaults(category, defaultType));
  }, [open, category, defaultType, form]);

  const type = form.watch("type") as CatType;

  const parentOptions = categories.filter(
    (c) => c.type === type && !c.parentId && c.id !== category?.id,
  );

  async function onSubmit(values: CreateCategoryInput) {
    if (isEdit && category) {
      await updateMutation.mutateAsync({
        id: category.id,
        input: {
          name: values.name,
          icon: values.icon,
          color: values.color,
          parentId: values.parentId ?? null,
        },
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this category's name, icon, color, or parent."
              : "Create a custom category to organize your transactions."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isEdit && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                      {TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => {
                            field.onChange(t.value);
                            form.setValue("parentId", undefined);
                          }}
                          className={cn(
                            "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
                            field.value === t.value &&
                              "bg-background text-foreground shadow-sm",
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-end gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Coffee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-lg"
                style={{
                  backgroundColor: `${form.watch("color")}1f`,
                }}
              >
                {form.watch("icon")}
              </div>
            </div>

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Parent{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(v) =>
                      field.onChange(v === NONE ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Top-level category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Top-level (no parent)</SelectItem>
                      {parentOptions.map((c) => (
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

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <EmojiPicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <ColorSwatches value={field.value} onChange={field.onChange} />
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
                {isEdit ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
