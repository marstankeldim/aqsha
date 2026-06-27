import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError } from "@/lib/errors";
import { accountService } from "@/server/accounts/account.service";
import { serializeAccount } from "@/types/account";
import { createAccountSchema } from "@/validations/account";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const includeArchived =
      req.nextUrl.searchParams.get("includeArchived") === "true";
    const accounts = await accountService.list(user.id, includeArchived);

    return NextResponse.json({ accounts: accounts.map(serializeAccount) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError();

    const input = createAccountSchema.parse(await req.json());
    const account = await accountService.create(user.id, input);

    return NextResponse.json(
      { account: serializeAccount(account) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
