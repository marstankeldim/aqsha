import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
} from "date-fns";
import type { RecurringFrequency } from "@prisma/client";

/** Advance a date by `interval` units of the given frequency. */
export function advanceDate(
  date: Date,
  frequency: RecurringFrequency,
  interval: number,
): Date {
  switch (frequency) {
    case "DAILY":
      return addDays(date, interval);
    case "WEEKLY":
      return addWeeks(date, interval);
    case "BIWEEKLY":
      return addWeeks(date, interval * 2);
    case "MONTHLY":
      return addMonths(date, interval);
    case "QUARTERLY":
      return addQuarters(date, interval);
    case "YEARLY":
      return addYears(date, interval);
    default:
      return addMonths(date, interval);
  }
}
