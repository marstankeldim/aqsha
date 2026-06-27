import { prisma } from "@/lib/prisma";
import { AppError, NotFoundError } from "@/lib/errors";
import { DEFAULT_CATEGORIES } from "@/config/categories";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/validations/category";
import { categoryRepo } from "./category.repo";

async function resolveParent(
  userId: string,
  parentId: string,
  type: string,
  selfId?: string,
) {
  if (selfId && parentId === selfId) {
    throw new AppError("A category can't be its own parent.");
  }
  const parent = await categoryRepo.findById(userId, parentId);
  if (!parent) throw new NotFoundError("Parent category not found.");
  if (parent.parentId) {
    throw new AppError("Categories can only nest one level deep.");
  }
  if (parent.type !== type) {
    throw new AppError("A subcategory must match its parent's type.");
  }
  return parent;
}

export const categoryService = {
  /**
   * Provision the default category set for a user on first use. Idempotent:
   * a no-op once the user has any categories.
   */
  async ensureDefaults(userId: string) {
    const existing = await categoryRepo.count(userId);
    if (existing > 0) return;

    // Two bulk writes (parents, then children) rather than a long interactive
    // transaction — Neon's pooled connection doesn't hold interactive
    // transactions reliably across ~20 sequential writes.
    const parents = await prisma.category.createManyAndReturn({
      data: DEFAULT_CATEGORIES.map((category, i) => ({
        userId,
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        isSystem: true,
        sortOrder: i,
      })),
      select: { id: true, name: true, type: true },
    });

    const parentIdByKey = new Map(
      parents.map((p) => [`${p.type}:${p.name}`, p.id]),
    );

    const children = DEFAULT_CATEGORIES.flatMap((category) =>
      (category.children ?? []).map((child, i) => ({
        userId,
        name: child.name,
        type: category.type,
        parentId: parentIdByKey.get(`${category.type}:${category.name}`)!,
        icon: child.icon,
        color: category.color,
        isSystem: true,
        sortOrder: i,
      })),
    );

    if (children.length) {
      await prisma.category.createMany({ data: children });
    }
  },

  async list(userId: string) {
    await this.ensureDefaults(userId);
    return categoryRepo.listByUser(userId);
  },

  async create(userId: string, input: CreateCategoryInput) {
    let parentId: string | null = null;
    if (input.parentId) {
      const parent = await resolveParent(userId, input.parentId, input.type);
      parentId = parent.id;
    }
    const sortOrder = await categoryRepo.nextSortOrder(userId);
    return categoryRepo.create({
      userId,
      name: input.name,
      type: input.type,
      parentId,
      icon: input.icon,
      color: input.color,
      isSystem: false,
      sortOrder,
    });
  },

  async update(userId: string, id: string, input: UpdateCategoryInput) {
    const existing = await categoryRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Category not found.");

    const data: Parameters<typeof categoryRepo.update>[1] = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.icon !== undefined) data.icon = input.icon;
    if (input.color !== undefined) data.color = input.color;

    if (input.parentId !== undefined) {
      if (!input.parentId) {
        data.parentId = null;
      } else {
        await resolveParent(userId, input.parentId, existing.type, id);
        // A category with its own children can't also become a child.
        const childCount = await categoryRepo.childrenCount(id);
        if (childCount > 0) {
          throw new AppError(
            "This category has subcategories, so it can't become one itself.",
          );
        }
        // Budgets are only valid on top-level categories. Nesting a budgeted
        // category would leave an orphaned budget that double-counts spending.
        const ownBudget = await prisma.budget.findFirst({
          where: { userId, categoryId: id },
        });
        if (ownBudget) {
          throw new AppError(
            "Remove this category's budget before making it a subcategory.",
          );
        }
        data.parentId = input.parentId;
      }
    }

    return categoryRepo.update(id, data);
  },

  async remove(userId: string, id: string) {
    const existing = await categoryRepo.findById(userId, id);
    if (!existing) throw new NotFoundError("Category not found.");
    // Transactions fall back to uncategorized (SetNull); child categories are
    // promoted to top-level (SetNull); budgets on it are removed (Cascade).
    await categoryRepo.delete(id);
  },
};
