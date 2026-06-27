"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Pencil, Plus, Receipt, Trash2, Wallet } from "lucide-react";

import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions, type TransactionQuery } from "@/hooks/use-transactions";
import type { TransactionDTO } from "@/types/transaction";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionItem } from "./transaction-item";
import { TransactionsToolbar } from "./transactions-toolbar";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";

function RowActions({
  t,
  onEdit,
  onDelete,
}: {
  t: TransactionDTO;
  onEdit: (t: TransactionDTO) => void;
  onDelete: (t: TransactionDTO) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
          aria-label="Transaction actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(t)}>
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(t)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TransactionsClient() {
  const [query, setQuery] = useState<TransactionQuery>({
    page: 1,
    pageSize: 25,
    sort: "date",
    order: "desc",
  });
  const { data, isLoading } = useTransactions(query);
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionDTO | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<TransactionDTO | null>(null);

  const patch = (p: Partial<TransactionQuery>) =>
    setQuery((q) => ({ ...q, ...p }));

  const transactions = data?.transactions ?? [];
  const hasAccounts = accounts.length > 0;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(t: TransactionDTO) {
    setEditing(t);
    setFormOpen(true);
  }
  function openDelete(t: TransactionDTO) {
    setDeleting(t);
    setDeleteOpen(true);
  }

  const start = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const end = data ? Math.min(data.page * data.pageSize, data.total) : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        description="Income, expenses, and transfers across your accounts."
      >
        <Button onClick={openCreate} disabled={!hasAccounts}>
          <Plus /> Add transaction
        </Button>
      </PageHeader>

      {!hasAccounts && !accountsLoading ? (
        <EmptyState
          icon={Wallet}
          title="Add an account first"
          description="You need at least one account before you can record transactions."
          action={
            <Button asChild>
              <Link href="/accounts">Go to accounts</Link>
            </Button>
          }
        />
      ) : (
        <>
          <TransactionsToolbar query={query} onChange={patch} />

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-y px-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="py-3.5">
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No transactions found"
                  description="Try adjusting your filters, or add your first transaction."
                  className="border-0"
                  action={
                    <Button onClick={openCreate}>
                      <Plus /> Add transaction
                    </Button>
                  }
                />
              ) : (
                <div className="divide-y px-4">
                  {transactions.map((t) => (
                    <TransactionItem
                      key={t.id}
                      t={t}
                      actions={
                        <RowActions
                          t={t}
                          onEdit={openEdit}
                          onDelete={openDelete}
                        />
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {data && data.total > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {start}–{end} of {data.total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() => patch({ page: data.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() => patch({ page: data.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editing}
      />
      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transaction={deleting}
      />
    </div>
  );
}
