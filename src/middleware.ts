import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Everything that is NOT explicitly public requires an authenticated session.
 * We keep the public surface small: marketing, auth pages, and the health check.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId } = await auth();

  // For API routes, return 401 instead of redirecting to the sign-in page.
  if (!userId && req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For everything else, Clerk handles the redirect to the sign-in page.
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
    // Clerk's auto-proxy path.
    "/__clerk/:path*",
  ],
};
