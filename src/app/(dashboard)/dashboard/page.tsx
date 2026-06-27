import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { accountService } from "@/server/accounts/account.service";
import { transactionService } from "@/server/transactions/transaction.service";
import { budgetService } from "@/server/budgets/budget.service";
import { ACCOUNT_TYPE_BY_VALUE } from "@/config/accounts";
import { formatMoney } from "@/lib/money";
import { serializeTransaction } from "@/types/transaction";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AccountIcon } from "@/components/accounts/account-icon";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [summary, accounts, txns, budgetData] = await Promise.all([
    accountService.summary(user.id),
    accountService.list(user.id),
    transactionService.dashboard(user.id),
    budgetService.listWithProgress(user.id, new Date()),
  ]);

  const currency = summary.currency;
  const firstName = user.firstName ?? "there";
  const recent = txns.recent.map(serializeTransaction);

  // Surface the most at-risk budgets first.
  const topBudgets = [...budgetData.budgets]
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's the snapshot of your financial life."
      >
        <Button asChild>
          <Link href="/transactions">
            <Plus /> Add transaction
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Net worth"
          value={formatMoney(summary.netWorth, currency)}
          icon={TrendingUp}
          hint={`${summary.accountCount} account${summary.accountCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Cash balance"
          value={formatMoney(summary.cash, currency)}
          icon={Wallet}
          hint="Checking, savings & cash"
        />
        <StatCard
          label="Income this month"
          value={formatMoney(txns.income, currency)}
          icon={ArrowUpRight}
          accentClassName="bg-success/10 text-success"
        />
        <StatCard
          label="Expenses this month"
          value={formatMoney(txns.expense, currency)}
          icon={ArrowDownRight}
          accentClassName="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Accounts</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/accounts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {accounts.length > 0 ? (
              <ul className="space-y-1">
                {accounts.slice(0, 6).map((account) => (
                  <li
                    key={account.id}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-accent/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <AccountIcon
                        type={account.type}
                        color={account.color}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {account.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ACCOUNT_TYPE_BY_VALUE[account.type]?.label}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {formatMoney(
                        account.balance.toString(),
                        account.currencyCode,
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Wallet}
                title="No accounts yet"
                description="Add an account to start tracking your balances."
                action={
                  <Button asChild>
                    <Link href="/accounts">
                      <Plus /> Add account
                    </Link>
                  </Button>
                }
                className="border-0 p-4"
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent transactions</CardTitle>
            {recent.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/transactions">View all</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recent.length > 0 ? (
              <div className="divide-y">
                {recent.map((t) => (
                  <TransactionItem key={t.id} t={t} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Add your first transaction to see your latest activity here."
                action={
                  <Button asChild>
                    <Link href="/transactions">
                      <Plus /> Add transaction
                    </Link>
                  </Button>
                }
                className="border-0 p-6"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {topBudgets.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Budget progress</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/budgets">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {topBudgets.map((b) => {
              const pct = Math.round(b.ratio * 100);
              const name = b.categoryId
                ? (b.category?.name ?? "—")
                : "All spending";
              const indicator =
                b.status === "over"
                  ? "bg-destructive"
                  : b.status === "warning"
                    ? "bg-warning"
                    : "bg-primary";
              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {b.category?.icon ?? "💰"} {name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatMoney(b.spent, currency)} /{" "}
                      {formatMoney(b.amount, currency)}
                    </span>
                  </div>
                  <Progress value={pct} indicatorClassName={indicator} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
