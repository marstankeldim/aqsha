import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-base font-bold text-primary-foreground shadow-sm">
        ₸
      </span>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight">Aqsha</span>
      )}
    </Link>
  );
}
