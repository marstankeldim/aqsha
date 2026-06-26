import { TrendingUp } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata = { title: "Investments" };

export default function InvestmentsPage() {
  return (
    <FeaturePlaceholder
      title="Investment portfolio"
      description="Stocks, ETFs, mutual funds, and crypto with gain/loss and allocation."
      icon={TrendingUp}
      step="Step 7"
    />
  );
}
