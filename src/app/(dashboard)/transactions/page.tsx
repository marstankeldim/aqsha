import { ArrowLeftRight } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata = { title: "Transactions" };

export default function TransactionsPage() {
  return (
    <FeaturePlaceholder
      title="Transactions"
      description="Income, expenses, and transfers — searchable, filterable, sortable."
      icon={ArrowLeftRight}
      step="Step 2"
    />
  );
}
