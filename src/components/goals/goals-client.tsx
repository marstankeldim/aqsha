"use client";

import { useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";

import { useGoals } from "@/hooks/use-goals";
import type { GoalDTO } from "@/types/goal";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalCard } from "./goal-card";
import { GoalFormDialog } from "./goal-form-dialog";
import { ContributionDialog } from "./contribution-dialog";
import { DeleteGoalDialog } from "./delete-goal-dialog";

type Filter = "all" | "active" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export function GoalsClient() {
  const { data: goals = [], isLoading } = useGoals();
  const [filter, setFilter] = useState<Filter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Hide archived goals from this view.
  const visible = useMemo(
    () => goals.filter((g) => g.status !== "ARCHIVED"),
    [goals],
  );
  const filtered = useMemo(() => {
    if (filter === "completed") return visible.filter((g) => g.status === "COMPLETED");
    if (filter === "active")
      return visible.filter((g) => g.status === "ACTIVE" || g.status === "PAUSED");
    return visible;
  }, [visible, filter]);

  // Derive live objects by id so dialogs always reflect the latest data.
  const byId = (id: string | null) => goals.find((g) => g.id === id) ?? null;

  function openCreate() {
    setEditingId(null);
    setFormOpen(true);
  }
  function openEdit(g: GoalDTO) {
    setEditingId(g.id);
    setFormOpen(true);
  }
  function openContribute(g: GoalDTO) {
    setContributingId(g.id);
    setContributeOpen(true);
  }
  function openDelete(g: GoalDTO) {
    setDeletingId(g.id);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Save toward what matters and watch your progress grow."
      >
        <Button onClick={openCreate}>
          <Plus /> New goal
        </Button>
      </PageHeader>

      {visible.length > 0 && (
        <div className="flex gap-1 rounded-lg bg-muted p-1 sm:w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
                filter === f.value && "bg-background text-foreground shadow-sm",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create a goal — an emergency fund, a vacation, a down payment — and track your progress toward it."
          action={
            <Button onClick={openCreate}>
              <Plus /> Create your first goal
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No goals in this view.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={openDelete}
              onContribute={openContribute}
            />
          ))}
        </div>
      )}

      <GoalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={byId(editingId)}
      />
      <ContributionDialog
        open={contributeOpen}
        onOpenChange={setContributeOpen}
        goal={byId(contributingId)}
      />
      <DeleteGoalDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        goal={byId(deletingId)}
      />
    </div>
  );
}
