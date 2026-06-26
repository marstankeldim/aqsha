import { PiggyBank } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata = { title: "Budgets" };

export default function BudgetsPage() {
  return (
    <FeaturePlaceholder
      title="Budgets"
      description="Monthly budgets per category with progress and overspend warnings."
      icon={PiggyBank}
      step="Step 3"
    />
  );
}
