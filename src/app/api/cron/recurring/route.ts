import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { handleApiError } from "@/lib/errors";
import { recurringService } from "@/server/recurring/recurring.service";

export const dynamic = "force-dynamic";

/** Constant-time string comparison to avoid leaking the secret via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Posts every user's due recurring transactions. Intended for a scheduled
 * invocation (see vercel.json). Secured with CRON_SECRET — Vercel Cron sends it
 * as `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Cron is not configured." },
        { status: 503 },
      );
    }
    const header = req.headers.get("authorization") ?? "";
    if (!safeEqual(header, `Bearer ${secret}`)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posted = await recurringService.runDueForAll();
    return NextResponse.json({ posted });
  } catch (error) {
    return handleApiError(error);
  }
}
