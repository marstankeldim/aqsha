import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

/** Base class for expected, client-facing errors. */
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "BAD_REQUEST",
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Already exists.") {
    super(message, 409, "CONFLICT");
  }
}

/** Maps thrown errors to a consistent JSON response for route handlers. */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed.", issues: error.flatten() },
      { status: 422 },
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  // Unique-constraint violation (e.g. a concurrent duplicate create).
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return NextResponse.json(
      { error: "That already exists.", code: "CONFLICT" },
      { status: 409 },
    );
  }
  console.error("[api] Unhandled error:", error);
  return NextResponse.json(
    { error: "Something went wrong on our end." },
    { status: 500 },
  );
}
