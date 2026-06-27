"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AccountDTO, AccountSummaryDTO } from "@/types/account";
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "@/validations/account";

const ACCOUNTS_KEY = ["accounts"] as const;

async function toError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.error ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async (): Promise<AccountDTO[]> => {
      const res = await fetch("/api/accounts");
      if (!res.ok) throw await toError(res, "Failed to load accounts.");
      return (await res.json()).accounts;
    },
  });
}

export function useAccountSummary() {
  return useQuery({
    queryKey: [...ACCOUNTS_KEY, "summary"],
    queryFn: async (): Promise<AccountSummaryDTO> => {
      const res = await fetch("/api/accounts/summary");
      if (!res.ok) throw await toError(res, "Failed to load summary.");
      return res.json();
    },
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAccountInput): Promise<AccountDTO> => {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to create account.");
      return (await res.json()).account;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      toast.success("Account created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateAccountInput;
    }): Promise<AccountDTO> => {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to update account.");
      return (await res.json()).account;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      toast.success("Account updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw await toError(res, "Failed to delete account.");
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      toast.success("Account deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
