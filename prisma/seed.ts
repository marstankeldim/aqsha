import { PrismaClient } from "@prisma/client";

import { SUPPORTED_CURRENCIES } from "../src/config/currencies";

const prisma = new PrismaClient();

/**
 * Static, approximate USD-base rates so multi-currency net-worth rollups have
 * data out of the box. Replace with a live FX feed later (stretch goal).
 */
const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  KZT: 470,
  AUD: 1.52,
  JPY: 157,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.3,
  RUB: 89,
  TRY: 32.5,
};

async function main() {
  console.log("→ Seeding currencies…");
  for (const c of SUPPORTED_CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        symbol: c.symbol,
        decimalDigits: c.decimalDigits,
        flag: c.flag,
      },
      create: c,
    });
  }
  console.log(`  ✓ ${SUPPORTED_CURRENCIES.length} currencies`);

  console.log("→ Seeding exchange rates (USD base, static placeholders)…");
  const asOf = new Date();
  asOf.setUTCHours(0, 0, 0, 0);
  let rateCount = 0;
  for (const c of SUPPORTED_CURRENCIES) {
    const rate = USD_RATES[c.code];
    if (rate == null) continue;
    await prisma.exchangeRate.upsert({
      where: {
        baseCode_quoteCode_asOf: {
          baseCode: "USD",
          quoteCode: c.code,
          asOf,
        },
      },
      update: { rate },
      create: { baseCode: "USD", quoteCode: c.code, rate, asOf },
    });
    rateCount++;
  }
  console.log(`  ✓ ${rateCount} exchange rates`);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
