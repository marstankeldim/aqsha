import { z } from "zod";

import { DEFAULT_SWATCH_COLOR } from "@/config/colors";
import { DEFAULT_CATEGORY_ICON } from "@/config/icons";

export const categoryTypeEnum = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color");

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40, "Keep it short"),
  type: categoryTypeEnum,
  parentId: z.string().nullish(),
  icon: z.string().trim().min(1).max(8).default(DEFAULT_CATEGORY_ICON),
  color: hexColor.default(DEFAULT_SWATCH_COLOR),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40).optional(),
  icon: z.string().trim().min(1).max(8).optional(),
  color: hexColor.optional(),
  parentId: z.string().nullish(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
