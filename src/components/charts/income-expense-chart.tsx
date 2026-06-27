"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyPoint } from "@/types/analytics";
import { formatMoney } from "@/lib/money";
import { MoneyTooltip } from "./chart-tooltip";

const INCOME_COLOR = "#10b981";
const EXPENSE_COLOR = "#f43f5e";
const AXIS_COLOR = "#94a3b8";

interface Props {
  data: MonthlyPoint[];
  currency: string;
}

export function IncomeExpenseChart({ data, currency }: Props) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={AXIS_COLOR}
            strokeOpacity={0.15}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickFormatter={(v: number) =>
              formatMoney(v, currency, { compact: true, hideDecimals: true })
            }
          />
          <Tooltip
            cursor={{ fill: AXIS_COLOR, fillOpacity: 0.08 }}
            content={<MoneyTooltip currency={currency} />}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill={INCOME_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="expense"
            name="Expenses"
            fill={EXPENSE_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
