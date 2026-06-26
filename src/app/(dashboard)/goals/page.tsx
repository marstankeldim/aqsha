import { Target } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <FeaturePlaceholder
      title="Financial goals"
      description="Emergency fund, vacation, car, house, retirement — tracked visually."
      icon={Target}
      step="Step 5"
    />
  );
}
