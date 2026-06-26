import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Where this feature sits in the build order, e.g. "Step 7". */
  step?: string;
}

/**
 * Temporary screen for routes whose feature hasn't been built yet. Keeps the
 * app navigable end-to-end while we ship features one at a time.
 */
export function FeaturePlaceholder({
  title,
  description,
  icon: Icon,
  step,
}: FeaturePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}>
        {step && <Badge variant="secondary">{step}</Badge>}
      </PageHeader>
      <EmptyState
        icon={Icon}
        title="Coming soon"
        description="This section is part of the build roadmap and isn't wired up yet."
      />
    </div>
  );
}
