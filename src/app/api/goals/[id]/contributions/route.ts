import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { goalService } from "@/server/goals/goal.service";
import { serializeGoal } from "@/types/goal";
import { createContributionSchema } from "@/validations/goal";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    const input = createContributionSchema.parse(await req.json());
    const goal = await goalService.addContribution(user.id, id, input);

    return NextResponse.json({ goal: serializeGoal(goal) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
