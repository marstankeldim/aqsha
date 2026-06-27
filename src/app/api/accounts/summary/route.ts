import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { accountService } from "@/server/accounts/account.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const summary = await accountService.summary(user.id);
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
