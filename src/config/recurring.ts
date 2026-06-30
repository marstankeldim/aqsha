import type { RecurringFrequency } from "@prisma/client";

export interface FrequencyMeta {
  value: RecurringFrequency;
  label: string;
}

export const FREQUENCIES: FrequencyMeta[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Every 2 weeks" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

const FREQUENCY_LABEL = Object.fromEntries(
  FREQUENCIES.map((f) => [f.value, f.label]),
) as Record<RecurringFrequency, string>;

const PLURAL: Record<RecurringFrequency, string> = {
  DAILY: "days",
  WEEKLY: "weeks",
  BIWEEKLY: "fortnights",
  MONTHLY: "months",
  QUARTERLY: "quarters",
  YEARLY: "years",
};

/** Human label like "Monthly" or "Every 3 months". */
export function frequencyLabel(
  frequency: RecurringFrequency,
  interval: number,
): string {
  if (interval <= 1) return FREQUENCY_LABEL[frequency];
  return `Every ${interval} ${PLURAL[frequency]}`;
}
