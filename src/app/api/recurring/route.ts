import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { recurringService } from "@/server/recurring/recurring.service";
import { serializeRecurring } from "@/types/recurring";
import { createRecurringSchema } from "@/validations/recurring";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const items = await recurringService.list(user.id);
    return NextResponse.json({ recurring: items.map(serializeRecurring) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const input = createRecurringSchema.parse(await req.json());
    const recurring = await recurringService.create(user.id, input);

    return NextResponse.json(
      { recurring: serializeRecurring(recurring) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
