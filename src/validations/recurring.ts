import { z } from "zod";

export const recurringFrequencyEnum = z.enum([
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
]);

// Recurring entries are income or expense — transfers have no schedule slot.
export const recurringTypeEnum = z.enum(["INCOME", "EXPENSE"]);

export const createRecurringSchema = z
  .object({
    type: recurringTypeEnum,
    accountId: z.string().min(1, "Select an account"),
    categoryId: z.string().nullish(),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    description: z.string().trim().min(1, "Add a description").max(140),
    notes: z.string().trim().max(500).optional(),
    frequency: recurringFrequencyEnum,
    interval: z.coerce.number().int().min(1).max(365).default(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullish(),
    autoPost: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.endDate && v.endDate < v.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be after the start date",
      });
    }
  });

export const updateRecurringSchema = z.object({
  type: recurringTypeEnum.optional(),
  accountId: z.string().min(1).optional(),
  categoryId: z.string().nullish(),
  amount: z.coerce.number().positive().optional(),
  description: z.string().trim().min(1).max(140).optional(),
  notes: z.string().trim().max(500).optional(),
  frequency: recurringFrequencyEnum.optional(),
  interval: z.coerce.number().int().min(1).max(365).optional(),
  endDate: z.coerce.date().nullish(),
  autoPost: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;
