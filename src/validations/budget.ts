import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().nullish(), // null/absent = overall budget
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  name: z.string().trim().max(60).optional(),
});

export const updateBudgetSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  name: z.string().trim().max(60).optional(),
});

export const budgetMonthSchema = z.object({
  month: z.coerce.date().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
