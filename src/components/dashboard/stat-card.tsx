import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: string; positive: boolean };
  /** Tailwind classes for the icon chip, e.g. "bg-success/10 text-success". */
  accentClassName?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accentClassName,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary",
              accentClassName,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        {(hint || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.positive ? "text-success" : "text-destructive",
                )}
              >
                {trend.value}
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
