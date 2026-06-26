import { BarChart3 } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <FeaturePlaceholder
      title="Reports"
      description="Spending and income trends, cash flow, and net-worth history."
      icon={BarChart3}
      step="Step 8"
    />
  );
}
