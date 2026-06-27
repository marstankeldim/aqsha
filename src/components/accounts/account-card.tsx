"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import type { AccountDTO } from "@/types/account";
import { ACCOUNT_TYPE_BY_VALUE } from "@/config/accounts";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountIcon } from "./account-icon";

interface AccountCardProps {
  account: AccountDTO;
  onEdit: (account: AccountDTO) => void;
  onDelete: (account: AccountDTO) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const meta = ACCOUNT_TYPE_BY_VALUE[account.type];
  const isLiability = meta?.isLiability ?? false;
  const owes = isLiability && Number(account.balance) > 0;

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: account.color }}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <AccountIcon type={account.type} color={account.color} />
            <div className="min-w-0">
              <div className="truncate font-medium leading-tight">
                {account.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {meta?.label}
                {account.mask ? ` ···· ${account.mask}` : ""}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
                aria-label="Account actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(account)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <div className="text-xs text-muted-foreground">
            {isLiability ? "Balance owed" : "Balance"}
          </div>
          <div
            className={cn(
              "text-2xl font-semibold tabular-nums",
              owes && "text-destructive",
            )}
          >
            {formatMoney(account.balance, account.currencyCode)}
          </div>
          {account.institution && (
            <div className="mt-1 truncate text-xs text-muted-foreground">
              {account.institution}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
