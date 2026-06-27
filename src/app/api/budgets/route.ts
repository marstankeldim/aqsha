import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { budgetService } from "@/server/budgets/budget.service";
import { budgetMonthSchema, createBudgetSchema } from "@/validations/budget";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const monthParam = req.nextUrl.searchParams.get("month");
    const { month } = budgetMonthSchema.parse({
      month: monthParam ?? undefined,
    });

    const data = await budgetService.listWithProgress(
      user.id,
      month ?? new Date(),
    );
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const input = createBudgetSchema.parse(await req.json());
    await budgetService.create(user.id, input);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
