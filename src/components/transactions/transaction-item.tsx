import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";

import type { TransactionDTO } from "@/types/transaction";
import { formatMoney } from "@/lib/money";
import { formatSmartDate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  t: TransactionDTO;
  actions?: React.ReactNode;
}

export function TransactionItem({ t, actions }: TransactionItemProps) {
  const isTransfer = t.type === "TRANSFER";
  const isIncome = t.type === "INCOME";
  const sign = isIncome ? "+" : t.type === "EXPENSE" ? "−" : "";
  const amountClass = isIncome
    ? "text-success"
    : isTransfer
      ? "text-muted-foreground"
      : "text-foreground";

  const chipColor = t.category?.color ?? t.account.color;
  const glyph = t.category?.icon;
  const FallbackIcon = isTransfer
    ? ArrowLeftRight
    : isIncome
      ? ArrowDownLeft
      : ArrowUpRight;

  const subtitle = isTransfer
    ? `${t.account.name} → ${t.transferAccount?.name ?? "—"}`
    : `${t.category?.name ?? "Uncategorized"} · ${t.account.name}`;

  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-base"
        style={{ backgroundColor: `${chipColor}1f`, color: chipColor }}
      >
        {glyph ? <span aria-hidden>{glyph}</span> : <FallbackIcon className="h-4 w-4" />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{t.description}</span>
          {t.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="hidden rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:inline"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>

      <div className="text-right">
        <div className={cn("font-medium tabular-nums", amountClass)}>
          {sign}
          {formatMoney(t.amount, t.currencyCode, { signDisplay: "never" })}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatSmartDate(t.date)}
        </div>
      </div>

      {actions}
    </div>
  );
}
