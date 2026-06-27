import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { accountService } from "@/server/accounts/account.service";
import { serializeAccount } from "@/types/account";
import { updateAccountSchema } from "@/validations/account";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    const account = await accountService.get(user.id, id);

    return NextResponse.json({ account: serializeAccount(account) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    const input = updateAccountSchema.parse(await req.json());
    const account = await accountService.update(user.id, id, input);

    return NextResponse.json({ account: serializeAccount(account) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const { id } = await params;
    await accountService.remove(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
