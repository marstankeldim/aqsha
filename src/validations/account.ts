import { z } from "zod";

import { isSupportedCurrency } from "@/lib/currency";
import { DEFAULT_ACCOUNT_COLOR } from "@/config/accounts";

export const accountTypeEnum = z.enum([
  "CHECKING",
  "SAVINGS",
  "CASH",
  "CREDIT_CARD",
  "INVESTMENT",
  "LOAN",
]);

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color");

const currencyCode = z
  .string()
  .refine(isSupportedCurrency, "Unsupported currency");

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Keep it under 60 characters"),
  type: accountTypeEnum,
  currencyCode: currencyCode.default("USD"),
  initialBalance: z.coerce.number().finite("Enter a valid amount").default(0),
  institution: z.string().trim().max(80).optional(),
  mask: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, "Up to 4 digits")
    .optional(),
  color: hexColor.default(DEFAULT_ACCOUNT_COLOR),
  creditLimit: z.coerce.number().nonnegative("Must be 0 or more").optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60).optional(),
  type: accountTypeEnum.optional(),
  currencyCode: currencyCode.optional(),
  initialBalance: z.coerce.number().finite().optional(),
  institution: z.string().trim().max(80).optional(),
  mask: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, "Up to 4 digits")
    .optional(),
  color: hexColor.optional(),
  creditLimit: z.coerce.number().nonnegative().nullable().optional(),
  isArchived: z.boolean().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
