import { SignIn } from "@clerk/nextjs";

import { Logo } from "@/components/shared/logo";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
        <Logo />
        <SignIn />
      </div>
    </div>
  );
}
