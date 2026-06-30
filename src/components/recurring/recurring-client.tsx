"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Repeat, Wallet } from "lucide-react";

import { useAccounts } from "@/hooks/use-accounts";
import { useRecurring, useRunRecurringDue } from "@/hooks/use-recurring";
import type { RecurringDTO } from "@/types/recurring";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecurringCard } from "./recurring-card";
import { RecurringFormDialog } from "./recurring-form-dialog";
import { DeleteRecurringDialog } from "./delete-recurring-dialog";

export function RecurringClient() {
  const { data: items = [], isLoading } = useRecurring();
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const runDue = useRunRecurringDue();
  const ranOnce = useRef(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Catch up any due auto-posting templates when the page opens.
  useEffect(() => {
    if (!ranOnce.current) {
      ranOnce.current = true;
      runDue.mutate();
    }
  }, [runDue]);

  const byId = (id: string | null) => items.find((i) => i.id === id) ?? null;
  const hasAccounts = accounts.length > 0;

  function openCreate() {
    setEditingId(null);
    setFormOpen(true);
  }
  function openEdit(r: RecurringDTO) {
    setEditingId(r.id);
    setFormOpen(true);
  }
  function openDelete(r: RecurringDTO) {
    setDeletingId(r.id);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring"
        description="Rent, salary, subscriptions, and bills that post on a schedule."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => runDue.mutate()}
            disabled={runDue.isPending || !hasAccounts}
          >
            <RefreshCw className={cn("h-4 w-4", runDue.isPending && "animate-spin")} />
            Run due
          </Button>
          <Button onClick={openCreate} disabled={!hasAccounts}>
            <Plus /> New
          </Button>
        </div>
      </PageHeader>

      {!hasAccounts && !accountsLoading ? (
        <EmptyState
          icon={Wallet}
          title="Add an account first"
          description="You need at least one account before scheduling recurring transactions."
          action={
            <Button asChild>
              <Link href="/accounts">Go to accounts</Link>
            </Button>
          }
        />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring transactions"
          description="Set up rent, a salary, or a subscription and it will post itself on schedule."
          action={
            <Button onClick={openCreate}>
              <Plus /> New recurring transaction
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <RecurringCard
              key={r.id}
              recurring={r}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      <RecurringFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        recurring={byId(editingId)}
      />
      <DeleteRecurringDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        recurring={byId(deletingId)}
      />
    </div>
  );
}
