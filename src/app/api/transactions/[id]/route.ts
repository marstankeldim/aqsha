import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { transactionService } from "@/server/transactions/transaction.service";
import { serializeTransaction } from "@/types/transaction";
import { updateTransactionSchema } from "@/validations/transaction";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    const input = updateTransactionSchema.parse(await req.json());
    const transaction = await transactionService.update(user.id, id, input);

    return NextResponse.json({ transaction: serializeTransaction(transaction) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    await transactionService.remove(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
