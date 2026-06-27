"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type { TransactionListResponse } from "@/types/transaction";
import type { CreateTransactionInput } from "@/validations/transaction";

export interface TransactionQuery {
  search?: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  accountId?: string;
  categoryId?: string;
  sort?: "date" | "amount";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const TX_KEY = ["transactions"] as const;

async function toError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.error ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

function buildQuery(params: TransactionQuery): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export function useTransactions(params: TransactionQuery) {
  return useQuery({
    queryKey: [...TX_KEY, params],
    queryFn: async (): Promise<TransactionListResponse> => {
      const res = await fetch(`/api/transactions?${buildQuery(params)}`);
      if (!res.ok) throw await toError(res, "Failed to load transactions.");
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

/** Transactions change account balances and budget progress, so refresh both. */
function useInvalidateAfterMutation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: TX_KEY });
    qc.invalidateQueries({ queryKey: ["accounts"] });
    qc.invalidateQueries({ queryKey: ["budgets"] });
  };
}

export function useCreateTransaction() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to create transaction.");
      return (await res.json()).transaction;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Transaction added");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: CreateTransactionInput;
    }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to update transaction.");
      return (await res.json()).transaction;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Transaction updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw await toError(res, "Failed to delete transaction.");
      return id;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Transaction deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
