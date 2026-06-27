import type { Category, CategoryType } from "@prisma/client";

export interface CategoryDTO {
  id: string;
  name: string;
  type: CategoryType;
  parentId: string | null;
  icon: string | null;
  color: string;
  isSystem: boolean;
}

export function serializeCategory(c: Category): CategoryDTO {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    parentId: c.parentId,
    icon: c.icon,
    color: c.color,
    isSystem: c.isSystem,
  };
}
