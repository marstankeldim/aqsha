import { Repeat } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata = { title: "Recurring" };

export default function RecurringPage() {
  return (
    <FeaturePlaceholder
      title="Recurring transactions"
      description="Rent, salary, subscriptions, and bills — generated automatically."
      icon={Repeat}
      step="Step 6"
    />
  );
}
