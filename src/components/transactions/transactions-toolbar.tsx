"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import type { TransactionQuery } from "@/hooks/use-transactions";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

interface Props {
  query: TransactionQuery;
  onChange: (patch: Partial<TransactionQuery>) => void;
}

export function TransactionsToolbar({ query, onChange }: Props) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const [search, setSearch] = useState(query.search ?? "");

  // Debounce the search box so we don't refetch on every keystroke.
  useEffect(() => {
    const id = setTimeout(
      () => onChange({ search: search || undefined, page: 1 }),
      300,
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const sortValue = `${query.sort ?? "date"}:${query.order ?? "desc"}`;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions…"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
        <Select
          value={query.type ?? ALL}
          onValueChange={(v) =>
            onChange({
              type: v === ALL ? undefined : (v as TransactionQuery["type"]),
              page: 1,
            })
          }
        >
          <SelectTrigger className="lg:w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={query.accountId ?? ALL}
          onValueChange={(v) =>
            onChange({ accountId: v === ALL ? undefined : v, page: 1 })
          }
        >
          <SelectTrigger className="lg:w-[150px]">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.categoryId ?? ALL}
          onValueChange={(v) =>
            onChange({ categoryId: v === ALL ? undefined : v, page: 1 })
          }
        >
          <SelectTrigger className="lg:w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories
              .filter((c) => !c.parentId)
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{c.icon}</span>
                    {c.name}
                  </span>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={sortValue}
          onValueChange={(v) => {
            const [sort, order] = v.split(":") as [
              TransactionQuery["sort"],
              TransactionQuery["order"],
            ];
            onChange({ sort, order, page: 1 });
          }}
        >
          <SelectTrigger className="lg:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date:desc">Newest first</SelectItem>
            <SelectItem value="date:asc">Oldest first</SelectItem>
            <SelectItem value="amount:desc">Largest amount</SelectItem>
            <SelectItem value="amount:asc">Smallest amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
