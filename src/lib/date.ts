import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";

/** Absolute date, e.g. "Jun 26, 2026". */
export function formatDate(date: Date | string, pattern = "MMM d, yyyy"): string {
  return format(new Date(date), pattern);
}

/** "Today", "Yesterday", or an absolute date — handy for transaction lists. */
export function formatSmartDate(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

/** "3 days ago", "in 2 months" — for goals, reminders, activity feeds. */
export function formatRelative(date: Date | string): string {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

/** First day of the month for a given date (used by budgets & reports). */
export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Month label like "June 2026". */
export function formatMonth(date: Date | string): string {
  return format(new Date(date), "MMMM yyyy");
}
