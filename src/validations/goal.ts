import { z } from "zod";

import { isSupportedCurrency } from "@/lib/currency";
import { DEFAULT_SWATCH_COLOR } from "@/config/colors";

export const goalTypeEnum = z.enum([
  "EMERGENCY_FUND",
  "VACATION",
  "CAR",
  "HOUSE",
  "RETIREMENT",
  "EDUCATION",
  "CUSTOM",
]);

export const goalStatusEnum = z.enum([
  "ACTIVE",
  "COMPLETED",
  "PAUSED",
  "ARCHIVED",
]);

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color");
const currencyCode = z
  .string()
  .refine(isSupportedCurrency, "Unsupported currency");

export const createGoalSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  type: goalTypeEnum.default("CUSTOM"),
  targetAmount: z.coerce.number().positive("Target must be greater than 0"),
  currencyCode: currencyCode.default("USD"),
  targetDate: z.coerce.date().nullish(),
  accountId: z.string().nullish(),
  color: hexColor.default(DEFAULT_SWATCH_COLOR),
});

export const updateGoalSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  type: goalTypeEnum.optional(),
  targetAmount: z.coerce.number().positive().optional(),
  currencyCode: currencyCode.optional(),
  targetDate: z.coerce.date().nullish(),
  accountId: z.string().nullish(),
  color: hexColor.optional(),
  status: goalStatusEnum.optional(),
});

export const createContributionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.coerce.date().default(() => new Date()),
  note: z.string().trim().max(200).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateContributionInput = z.infer<typeof createContributionSchema>;
