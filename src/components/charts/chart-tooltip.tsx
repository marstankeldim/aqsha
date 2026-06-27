"use client";

import { formatMoney } from "@/lib/money";

interface TooltipItem {
  name?: string | number;
  value?: number;
  color?: string;
}

interface MoneyTooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
  currency: string;
}

/** Themed Recharts tooltip rendering money values. */
export function MoneyTooltip({
  active,
  payload,
  label,
  currency,
}: MoneyTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      {label != null && label !== "" && (
        <div className="mb-1 font-medium">{label}</div>
      )}
      <div className="space-y-0.5">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums">
              {formatMoney(item.value ?? 0, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
