/**
 * Supported currencies — the single source of truth used by both the database
 * seed (prisma/seed.ts) and the client UI (so we never need a DB round-trip to
 * format an amount).
 */
export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  { code: "USD", name: "US Dollar", symbol: "$", decimalDigits: 2, flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", decimalDigits: 2, flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", decimalDigits: 2, flag: "🇬🇧" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimalDigits: 2, flag: "🇨🇦" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", decimalDigits: 2, flag: "🇰🇿" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimalDigits: 2, flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimalDigits: 0, flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimalDigits: 2, flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimalDigits: 2, flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimalDigits: 2, flag: "🇮🇳" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", decimalDigits: 2, flag: "🇷🇺" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", decimalDigits: 2, flag: "🇹🇷" },
];

export const DEFAULT_CURRENCY = "USD";

export const CURRENCY_BY_CODE: Record<string, CurrencyMeta> =
  Object.fromEntries(SUPPORTED_CURRENCIES.map((c) => [c.code, c]));
