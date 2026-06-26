import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const currency = user?.primaryCurrency ?? "USD";
  const firstName = user?.firstName ?? "there";
  const zero = formatMoney(0, currency);

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
          value={zero}
          icon={TrendingUp}
          hint="Across all accounts"
        />
        <StatCard
          label="Cash balance"
          value={zero}
          icon={Wallet}
          hint="Checking & savings"
        />
        <StatCard
          label="Income this month"
          value={zero}
          icon={ArrowUpRight}
          accentClassName="bg-success/10 text-success"
        />
        <StatCard
          label="Expenses this month"
          value={zero}
          icon={ArrowDownRight}
          accentClassName="bg-destructive/10 text-destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Create an account and add your first transaction to bring this dashboard to life."
            action={
              <Button asChild>
                <Link href="/accounts">
                  <Plus /> Add your first account
                </Link>
              </Button>
            }
            className="border-0 p-6"
          />
        </CardContent>
      </Card>
    </div>
  );
}
