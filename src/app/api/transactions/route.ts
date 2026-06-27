import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { transactionService } from "@/server/transactions/transaction.service";
import { serializeTransaction } from "@/types/transaction";
import {
  createTransactionSchema,
  listTransactionsSchema,
} from "@/validations/transaction";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    // Drop empty query params so they don't become "" filters.
    const raw: Record<string, string> = {};
    for (const [key, value] of req.nextUrl.searchParams) {
      if (value !== "") raw[key] = value;
    }
    const params = listTransactionsSchema.parse(raw);

    const { items, total, page, pageSize } = await transactionService.list(
      user.id,
      params,
    );

    return NextResponse.json({
      transactions: items.map(serializeTransaction),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const input = createTransactionSchema.parse(await req.json());
    const transaction = await transactionService.create(user.id, input);

    return NextResponse.json(
      { transaction: serializeTransaction(transaction) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
