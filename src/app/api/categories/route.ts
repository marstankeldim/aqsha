import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { categoryService } from "@/server/categories/category.service";
import { serializeCategory } from "@/types/category";
import { createCategorySchema } from "@/validations/category";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const categories = await categoryService.list(user.id);
    return NextResponse.json({ categories: categories.map(serializeCategory) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const input = createCategorySchema.parse(await req.json());
    const category = await categoryService.create(user.id, input);

    return NextResponse.json(
      { category: serializeCategory(category) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
