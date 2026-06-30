import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { goalService } from "@/server/goals/goal.service";
import { serializeGoal } from "@/types/goal";

type Context = { params: Promise<{ id: string; contributionId: string }> };

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id, contributionId } = await params;
    const goal = await goalService.removeContribution(
      user.id,
      id,
      contributionId,
    );

    return NextResponse.json({ goal: serializeGoal(goal) });
  } catch (error) {
    return handleApiError(error);
  }
}
