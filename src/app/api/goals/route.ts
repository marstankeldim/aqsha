import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { goalService } from "@/server/goals/goal.service";
import { serializeGoal } from "@/types/goal";
import { createGoalSchema } from "@/validations/goal";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const goals = await goalService.list(user.id);
    return NextResponse.json({ goals: goals.map(serializeGoal) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const input = createGoalSchema.parse(await req.json());
    const goal = await goalService.create(user.id, input);

    return NextResponse.json(
      { goal: serializeGoal(goal) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
