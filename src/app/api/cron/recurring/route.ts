import { NextResponse, type NextRequest } from "next/server";

import { handleApiError } from "@/lib/errors";
import { recurringService } from "@/server/recurring/recurring.service";

export const dynamic = "force-dynamic";

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
    if (req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posted = await recurringService.runDueForAll();
    return NextResponse.json({ posted });
  } catch (error) {
    return handleApiError(error);
  }
}
