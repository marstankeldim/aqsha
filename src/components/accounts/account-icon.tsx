import type { AccountType } from "@prisma/client";

import { ACCOUNT_TYPE_BY_VALUE } from "@/config/accounts";
import { cn } from "@/lib/utils";

interface AccountIconProps {
  type: AccountType;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AccountIcon({
  type,
  color,
  size = "md",
  className,
}: AccountIconProps) {
  const Icon = ACCOUNT_TYPE_BY_VALUE[type]?.icon;
  const box =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const glyph = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-lg", box, className)}
      style={
        color
          ? { backgroundColor: `${color}1f`, color }
          : undefined
      }
    >
      {Icon ? <Icon className={glyph} /> : null}
    </span>
  );
}
