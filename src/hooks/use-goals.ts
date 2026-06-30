"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { GoalDTO } from "@/types/goal";
import type {
  CreateContributionInput,
  CreateGoalInput,
  UpdateGoalInput,
} from "@/validations/goal";

const GOALS_KEY = ["goals"] as const;

async function toError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.error ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export function useGoals() {
  return useQuery({
    queryKey: GOALS_KEY,
    queryFn: async (): Promise<GoalDTO[]> => {
      const res = await fetch("/api/goals");
      if (!res.ok) throw await toError(res, "Failed to load goals.");
      return (await res.json()).goals;
    },
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: GOALS_KEY });
}

export function useCreateGoal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to create goal.");
      return (await res.json()).goal as GoalDTO;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Goal created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateGoal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateGoalInput }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to update goal.");
      return (await res.json()).goal as GoalDTO;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Goal updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteGoal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw await toError(res, "Failed to delete goal.");
      return id;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Goal deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddContribution() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({
      goalId,
      input,
    }: {
      goalId: string;
      input: CreateContributionInput;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await toError(res, "Failed to add contribution.");
      return (await res.json()).goal as GoalDTO;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Contribution added");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteContribution() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({
      goalId,
      contributionId,
    }: {
      goalId: string;
      contributionId: string;
    }) => {
      const res = await fetch(
        `/api/goals/${goalId}/contributions/${contributionId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw await toError(res, "Failed to remove contribution.");
      return (await res.json()).goal as GoalDTO;
    },
    onSuccess: () => invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });
}
