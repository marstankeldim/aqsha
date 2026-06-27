import { z } from "zod";

export const transactionTypeEnum = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);

export const createTransactionSchema = z
  .object({
    type: transactionTypeEnum,
    accountId: z.string().min(1, "Select an account"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    date: z.coerce.date(),
    description: z.string().trim().min(1, "Add a description").max(140),
    notes: z.string().trim().max(500).optional(),
    categoryId: z.string().nullish(),
    transferAccountId: z.string().nullish(),
    tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
  })
  .superRefine((val, ctx) => {
    if (val.type === "TRANSFER") {
      if (!val.transferAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transferAccountId"],
          message: "Select a destination account",
        });
      } else if (val.transferAccountId === val.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transferAccountId"],
          message: "Choose a different destination account",
        });
      }
    }
  });

// Same shape for edits; the service enforces that a transfer stays a transfer.
export const updateTransactionSchema = createTransactionSchema;

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

/** Query params for the transactions list. */
export const listTransactionsSchema = z.object({
  search: z.string().trim().optional(),
  type: transactionTypeEnum.optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z.enum(["date", "amount"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListTransactionsParams = z.infer<typeof listTransactionsSchema>;
