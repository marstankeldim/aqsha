import {
  CURRENCY_BY_CODE,
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type CurrencyMeta,
} from "@/config/currencies";

export { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY };
export type { CurrencyMeta };

export function getCurrencyMeta(code: string): CurrencyMeta {
  return CURRENCY_BY_CODE[code] ?? CURRENCY_BY_CODE[DEFAULT_CURRENCY]!;
}

export function getCurrencySymbol(code: string): string {
  return getCurrencyMeta(code).symbol;
}

export function isSupportedCurrency(code: string): boolean {
  return code in CURRENCY_BY_CODE;
}
