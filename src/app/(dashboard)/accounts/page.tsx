import { Wallet } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata = { title: "Accounts" };

export default function AccountsPage() {
  return (
    <FeaturePlaceholder
      title="Accounts"
      description="Checking, savings, credit cards, cash, and investment accounts."
      icon={Wallet}
      step="Step 1 — next up"
    />
  );
}
