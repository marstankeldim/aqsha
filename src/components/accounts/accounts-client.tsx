"use client";

import { useState } from "react";
import { Plus, Wallet } from "lucide-react";

import { useAccounts, useAccountSummary } from "@/hooks/use-accounts";
import type { AccountDTO } from "@/types/account";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCard } from "./account-card";
import { AccountFormDialog } from "./account-form-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";

function SummaryStat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div
          className={cn(
            "mt-1 text-2xl font-semibold tabular-nums",
            emphasis && "text-primary",
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountsClient() {
  const { data: accounts, isLoading } = useAccounts();
  const { data: summary } = useAccountSummary();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AccountDTO | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<AccountDTO | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(account: AccountDTO) {
    setEditing(account);
    setFormOpen(true);
  }
  function openDelete(account: AccountDTO) {
    setDeleting(account);
    setDeleteOpen(true);
  }

  const hasAccounts = (accounts?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts" description="All your balances in one place.">
        <Button onClick={openCreate}>
          <Plus /> Add account
        </Button>
      </PageHeader>

      {hasAccounts && summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryStat
            label="Net worth"
            value={formatMoney(summary.netWorth, summary.currency)}
            emphasis
          />
          <SummaryStat
            label="Assets"
            value={formatMoney(summary.assets, summary.currency)}
          />
          <SummaryStat
            label="Liabilities"
            value={formatMoney(summary.liabilities, summary.currency)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : hasAccounts ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts!.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add your checking, savings, credit cards, cash, and investments to start tracking your finances."
          action={
            <Button onClick={openCreate}>
              <Plus /> Add your first account
            </Button>
          }
        />
      )}

      <AccountFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        account={editing}
      />
      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        account={deleting}
      />
    </div>
  );
}
