"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategorySpend } from "@/types/analytics";
import { formatMoney } from "@/lib/money";
import { MoneyTooltip } from "./chart-tooltip";

interface Props {
  data: CategorySpend[];
  total: number;
  currency: string;
}

export function SpendingDonut({ data, total, currency }: Props) {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<MoneyTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Spent</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatMoney(total, currency, { compact: total >= 100000 })}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-1.5">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.id} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="truncate">
                {d.icon ? `${d.icon} ` : ""}
                {d.name}
              </span>
              <span className="ml-auto tabular-nums text-muted-foreground">
                {formatMoney(d.value, currency)}
              </span>
              <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
