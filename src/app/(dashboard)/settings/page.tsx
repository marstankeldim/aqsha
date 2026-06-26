import { getCurrentUser } from "@/lib/auth";
import { getCurrencyMeta } from "@/lib/currency";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Settings" };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const currency = getCurrencyMeta(user?.primaryCurrency ?? "USD");
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Synced from your Clerk account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" value={fullName} />
          <Field label="Email" value={user?.email ?? "—"} />
          <Field
            label="Primary currency"
            value={`${currency.flag} ${currency.code} — ${currency.name}`}
          />
          <Field label="Locale" value={user?.locale ?? "en-US"} />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Use the avatar menu in the top-right to manage your account, password,
        and sign out. Editable preferences (currency, locale, theme defaults)
        arrive with the Settings feature.
      </p>
    </div>
  );
}
