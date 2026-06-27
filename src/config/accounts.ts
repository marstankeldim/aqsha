import {
  CreditCard,
  HandCoins,
  Landmark,
  LineChart,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "@prisma/client";

export interface AccountTypeMeta {
  value: AccountType;
  label: string;
  icon: LucideIcon;
  isLiability: boolean;
  isCash: boolean;
  description: string;
}

export const ACCOUNT_TYPES: AccountTypeMeta[] = [
  {
    value: "CHECKING",
    label: "Checking",
    icon: Landmark,
    isLiability: false,
    isCash: true,
    description: "Everyday spending account",
  },
  {
    value: "SAVINGS",
    label: "Savings",
    icon: PiggyBank,
    isLiability: false,
    isCash: true,
    description: "Money set aside",
  },
  {
    value: "CASH",
    label: "Cash",
    icon: Wallet,
    isLiability: false,
    isCash: true,
    description: "Physical cash on hand",
  },
  {
    value: "CREDIT_CARD",
    label: "Credit Card",
    icon: CreditCard,
    isLiability: true,
    isCash: false,
    description: "Revolving credit balance you owe",
  },
  {
    value: "INVESTMENT",
    label: "Investment",
    icon: LineChart,
    isLiability: false,
    isCash: false,
    description: "Brokerage or retirement account",
  },
  {
    value: "LOAN",
    label: "Loan",
    icon: HandCoins,
    isLiability: true,
    isCash: false,
    description: "Outstanding loan balance you owe",
  },
];

export const ACCOUNT_TYPE_BY_VALUE = Object.fromEntries(
  ACCOUNT_TYPES.map((t) => [t.value, t]),
) as Record<AccountType, AccountTypeMeta>;

export const LIABILITY_TYPES: AccountType[] = ACCOUNT_TYPES.filter(
  (t) => t.isLiability,
).map((t) => t.value);

export const CASH_TYPES: AccountType[] = ACCOUNT_TYPES.filter(
  (t) => t.isCash,
).map((t) => t.value);

export const DEFAULT_ACCOUNT_COLOR = "#10b981";
