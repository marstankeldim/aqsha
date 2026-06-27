import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type Converter = (
  amount: Prisma.Decimal,
  from: string,
  to: string,
) => Prisma.Decimal;

/**
 * Builds a currency converter from the latest USD-base exchange rates.
 * Conversion goes A → USD → B. If a rate is missing we fall back to 1:1 so a
 * total is never silently dropped.
 *
 * One DB read builds a reusable function — call this once per request, not per
 * row, when summing many accounts.
 */
export async function buildConverter(): Promise<Converter> {
  const rates = await prisma.exchangeRate.findMany({
    where: { baseCode: "USD" },
    orderBy: { asOf: "desc" },
  });

  const latest = new Map<string, Prisma.Decimal>();
  for (const r of rates) {
    if (!latest.has(r.quoteCode)) latest.set(r.quoteCode, r.rate);
  }
  latest.set("USD", new Prisma.Decimal(1));

  return (amount, from, to) => {
    if (from === to) return amount;
    const rFrom = latest.get(from);
    const rTo = latest.get(to);
    if (!rFrom || !rTo || rFrom.isZero()) return amount;
    return amount.div(rFrom).mul(rTo);
  };
}
