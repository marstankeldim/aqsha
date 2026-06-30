import {
  Car,
  GraduationCap,
  Home,
  Plane,
  ShieldCheck,
  Target,
  Umbrella,
  type LucideIcon,
} from "lucide-react";
import type { GoalType } from "@prisma/client";

export interface GoalTypeMeta {
  value: GoalType;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const GOAL_TYPES: GoalTypeMeta[] = [
  { value: "EMERGENCY_FUND", label: "Emergency Fund", icon: ShieldCheck, color: "#10b981" },
  { value: "VACATION", label: "Vacation", icon: Plane, color: "#0ea5e9" },
  { value: "CAR", label: "Car", icon: Car, color: "#6366f1" },
  { value: "HOUSE", label: "House", icon: Home, color: "#f97316" },
  { value: "RETIREMENT", label: "Retirement", icon: Umbrella, color: "#8b5cf6" },
  { value: "EDUCATION", label: "Education", icon: GraduationCap, color: "#eab308" },
  { value: "CUSTOM", label: "Custom", icon: Target, color: "#14b8a6" },
];

export const GOAL_TYPE_BY_VALUE = Object.fromEntries(
  GOAL_TYPES.map((t) => [t.value, t]),
) as Record<GoalType, GoalTypeMeta>;
