import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { recurringService } from "@/server/recurring/recurring.service";
import { serializeRecurring } from "@/types/recurring";

type Context = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    const recurring = await recurringService.postNext(user.id, id);
    return NextResponse.json({ recurring: serializeRecurring(recurring) });
  } catch (error) {
    return handleApiError(error);
  }
}
