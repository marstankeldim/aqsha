import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  Repeat,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { SITE } from "@/config/site";

const FEATURES = [
  {
    icon: Wallet,
    title: "Every account, one place",
    body: "Checking, savings, credit cards, cash, and investments — unified across currencies.",
  },
  {
    icon: BarChart3,
    title: "Reports that explain",
    body: "Spending trends, cash flow, and net-worth history in interactive charts.",
  },
  {
    icon: PiggyBank,
    title: "Budgets that hold",
    body: "Per-category monthly budgets with progress and gentle overspend warnings.",
  },
  {
    icon: Target,
    title: "Goals you reach",
    body: "Emergency fund, vacation, a home — tracked visually until you get there.",
  },
  {
    icon: Repeat,
    title: "Set it and forget it",
    body: "Recurring rent, salary, and subscriptions post themselves automatically.",
  },
  {
    icon: TrendingUp,
    title: "Investments, demystified",
    body: "Holdings, cost basis, gain/loss, and allocation at a glance.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6">
        {/* Nav */}
        <header className="flex h-20 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <SignedOut>
              <Button asChild variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild>
                <Link href="/dashboard">
                  Open dashboard <ArrowRight />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-3xl py-20 text-center sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Private by design — your data, your control
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Your money,</span>
            <br />
            beautifully understood.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SignedOut>
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start for free <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">I already have an account</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Go to your dashboard <ArrowRight />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-card/60 p-6 backdrop-blur transition-colors hover:bg-card"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {SITE.name}. Built as a portfolio-grade
          finance platform.
        </footer>
      </div>
    </div>
  );
}
