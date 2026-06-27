"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import type { BudgetsResponse } from "@/types/budget";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/validations/budget";

const BUDGETS_KEY = ["budgets"] as const;

async function toError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.error ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export function useBudgets(month: Date) {
  return useQuery({
    queryKey: [...BUDGETS_KEY, format(month, "yyyy-MM")],
    queryFn: async (): Promise<BudgetsResponse> => {
      const res = await fetch(`/api/budgets?month=${month.toISOString()}`);
      if (!res.ok) throw await toError(res, "Failed to load budgets.");
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: BUDGETS_KEY });
}

export function useCreateBudget() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to create budget.");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast.success("Budget created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateBudget() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateBudgetInput;
    }) => {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to update budget.");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast.success("Budget updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteBudget() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!res.ok) throw await toError(res, "Failed to delete budget.");
      return id;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Budget deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
