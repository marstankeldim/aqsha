import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { recurringService } from "@/server/recurring/recurring.service";
import { serializeRecurring } from "@/types/recurring";
import { updateRecurringSchema } from "@/validations/recurring";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    const input = updateRecurringSchema.parse(await req.json());
    const recurring = await recurringService.update(user.id, id, input);

    return NextResponse.json({ recurring: serializeRecurring(recurring) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    await recurringService.remove(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
