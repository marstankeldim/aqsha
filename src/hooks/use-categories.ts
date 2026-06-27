"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { CategoryDTO } from "@/types/category";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/validations/category";

const CATEGORIES_KEY = ["categories"] as const;

async function toError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.error ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async (): Promise<CategoryDTO[]> => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories.");
      return (await res.json()).categories;
    },
    staleTime: 5 * 60_000,
  });
}

/** Editing/removing categories can touch transactions and budgets too. */
function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["budgets"] });
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: CreateCategoryInput): Promise<CategoryDTO> => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to create category.");
      return (await res.json()).category;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Category created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCategoryInput;
    }): Promise<CategoryDTO> => {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to update category.");
      return (await res.json()).category;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Category updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw await toError(res, "Failed to delete category.");
      return id;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Category deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
