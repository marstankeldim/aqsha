import { CURRENCY_BY_CODE, DEFAULT_CURRENCY } from "@/config/currencies";

/**
 * Money formatting helpers. These are client-safe (pure Intl) — Decimal
 * arithmetic happens in server services using Prisma.Decimal, never here.
 *
 * `amount` accepts number | string because Prisma.Decimal serializes to a
 * string when it crosses the server/client boundary.
 */
export type MoneyInput = number | string;

function toNumber(amount: MoneyInput): number {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return Number.isFinite(n) ? n : 0;
}

interface FormatMoneyOptions {
  locale?: string;
  /** Use compact notation, e.g. $1.2K, $3.4M. */
  compact?: boolean;
  /** Hide the fractional part regardless of currency. */
  hideDecimals?: boolean;
  /** Always show a leading +/- sign. */
  signDisplay?: "auto" | "always" | "never" | "exceptZero";
}

export function formatMoney(
  amount: MoneyInput,
  currency: string = DEFAULT_CURRENCY,
  options: FormatMoneyOptions = {},
): string {
  const value = toNumber(amount);
  const meta = CURRENCY_BY_CODE[currency];
  const digits = options.hideDecimals ? 0 : meta?.decimalDigits ?? 2;

  try {
    return new Intl.NumberFormat(options.locale ?? "en-US", {
      style: "currency",
      currency,
      notation: options.compact ? "compact" : "standard",
      minimumFractionDigits: options.compact ? 0 : digits,
      maximumFractionDigits: digits,
      signDisplay: options.signDisplay ?? "auto",
    }).format(value);
  } catch {
    // Fallback for any code Intl can't resolve.
    const symbol = meta?.symbol ?? currency;
    return `${symbol}${value.toFixed(digits)}`;
  }
}

/** Format a 0–1 ratio (e.g. 0.42) as a percentage string. */
export function formatPercent(
  ratio: number,
  options: { locale?: string; decimals?: number; signDisplay?: "auto" | "always" | "exceptZero" } = {},
): string {
  return new Intl.NumberFormat(options.locale ?? "en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: options.decimals ?? 1,
    signDisplay: options.signDisplay ?? "auto",
  }).format(ratio);
}

/** Plain number with thousands separators (e.g. share quantities). */
export function formatNumber(
  value: MoneyInput,
  options: { locale?: string; decimals?: number } = {},
): string {
  return new Intl.NumberFormat(options.locale ?? "en-US", {
    maximumFractionDigits: options.decimals ?? 2,
  }).format(toNumber(value));
}

/**
 * Signed magnitude for a transaction given its type. Amounts are stored as
 * positive magnitudes; income is positive, expense negative for display/sums.
 */
export function signedAmount(
  amount: MoneyInput,
  type: "INCOME" | "EXPENSE" | "TRANSFER",
): number {
  const value = toNumber(amount);
  return type === "EXPENSE" ? -value : value;
}
