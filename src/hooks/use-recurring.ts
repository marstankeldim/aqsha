"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { RecurringDTO } from "@/types/recurring";
import type {
  CreateRecurringInput,
  UpdateRecurringInput,
} from "@/validations/recurring";

const RECURRING_KEY = ["recurring"] as const;

async function toError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.error ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export function useRecurring() {
  return useQuery({
    queryKey: RECURRING_KEY,
    queryFn: async (): Promise<RecurringDTO[]> => {
      const res = await fetch("/api/recurring");
      if (!res.ok) throw await toError(res, "Failed to load recurring items.");
      return (await res.json()).recurring;
    },
  });
}

function useInvalidateTemplates() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: RECURRING_KEY });
}

/** Posting creates real transactions, so refresh transactions/accounts/budgets too. */
function useInvalidatePosted() {
  const qc = useQueryClient();
  return () => {
    for (const key of [RECURRING_KEY, ["transactions"], ["accounts"], ["budgets"]]) {
      qc.invalidateQueries({ queryKey: key });
    }
  };
}

export function useCreateRecurring() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: async (input: CreateRecurringInput) => {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to create recurring item.");
      return (await res.json()).recurring as RecurringDTO;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Recurring transaction created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateRecurring() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateRecurringInput;
    }) => {
      const res = await fetch(`/api/recurring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to update recurring item.");
      return (await res.json()).recurring as RecurringDTO;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Recurring transaction updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRecurring() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!res.ok) throw await toError(res, "Failed to delete recurring item.");
      return id;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Recurring transaction deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function usePostRecurringNow() {
  const invalidate = useInvalidatePosted();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recurring/${id}/post`, { method: "POST" });
      if (!res.ok) throw await toError(res, "Failed to post transaction.");
      return (await res.json()).recurring as RecurringDTO;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Transaction posted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRunRecurringDue() {
  const invalidate = useInvalidatePosted();
  return useMutation({
    mutationFn: async (): Promise<number> => {
      const res = await fetch("/api/recurring/run", { method: "POST" });
      if (!res.ok) throw await toError(res, "Failed to run recurring items.");
      return (await res.json()).posted as number;
    },
    onSuccess: (posted) => {
      invalidate();
      if (posted > 0) {
        toast.success(
          `Posted ${posted} recurring transaction${posted === 1 ? "" : "s"}`,
        );
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
