import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { recurringService } from "@/server/recurring/recurring.service";

/** Posts all of the current user's due recurring transactions. */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const posted = await recurringService.runDue(user.id);
    return NextResponse.json({ posted });
  } catch (error) {
    return handleApiError(error);
  }
}
