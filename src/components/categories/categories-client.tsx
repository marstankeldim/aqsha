"use client";

import { useMemo, useState } from "react";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { CategoryType } from "@prisma/client";

import { useCategories } from "@/hooks/use-categories";
import type { CategoryDTO } from "@/types/category";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

const SECTIONS: { type: CategoryType; label: string }[] = [
  { type: "EXPENSE", label: "Expense categories" },
  { type: "INCOME", label: "Income categories" },
  { type: "TRANSFER", label: "Transfers" },
];

function CategoryRow({
  category,
  child,
  onEdit,
  onDelete,
}: {
  category: CategoryDTO;
  child?: boolean;
  onEdit: (c: CategoryDTO) => void;
  onDelete: (c: CategoryDTO) => void;
}) {
  return (
    <div
      className={cnRow(child)}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base"
          style={{ backgroundColor: `${category.color}1f` }}
        >
          {category.icon}
        </span>
        <span className="truncate text-sm font-medium">{category.name}</span>
        {category.isSystem && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            default
          </span>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            aria-label="Category actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(category)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function cnRow(child?: boolean) {
  return `flex items-center justify-between rounded-lg py-2 pr-1 hover:bg-accent/40 ${
    child ? "pl-6" : "pl-1"
  }`;
}

export function CategoriesClient() {
  const { data: categories = [], isLoading } = useCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [defaultType, setDefaultType] = useState<CategoryType>("EXPENSE");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<CategoryDTO | null>(null);

  const grouped = useMemo(() => {
    const byParent = new Map<string, CategoryDTO[]>();
    for (const c of categories) {
      if (c.parentId) {
        const arr = byParent.get(c.parentId) ?? [];
        arr.push(c);
        byParent.set(c.parentId, arr);
      }
    }
    return { byParent };
  }, [categories]);

  function openCreate(type: CategoryType) {
    setEditing(null);
    setDefaultType(type);
    setFormOpen(true);
  }
  function openEdit(c: CategoryDTO) {
    setEditing(c);
    setFormOpen(true);
  }
  function openDelete(c: CategoryDTO) {
    setDeleting(c);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your spending and income with custom categories."
      >
        <Button onClick={() => openCreate("EXPENSE")}>
          <Plus /> New category
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {SECTIONS.map(({ type, label }) => {
            const tops = categories.filter(
              (c) => c.type === type && !c.parentId,
            );
            return (
              <Card key={type}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openCreate(type)}
                    aria-label={`Add ${label}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-0.5">
                  {tops.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No categories yet.
                    </p>
                  ) : (
                    tops.map((parent) => (
                      <div key={parent.id}>
                        <CategoryRow
                          category={parent}
                          onEdit={openEdit}
                          onDelete={openDelete}
                        />
                        {(grouped.byParent.get(parent.id) ?? []).map((child) => (
                          <CategoryRow
                            key={child.id}
                            category={child}
                            child
                            onEdit={openEdit}
                            onDelete={openDelete}
                          />
                        ))}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        defaultType={defaultType}
      />
      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deleting}
      />
    </div>
  );
}
