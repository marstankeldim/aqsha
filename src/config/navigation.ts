import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  PiggyBank,
  Repeat,
  Settings,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Accounts", href: "/accounts", icon: Wallet },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { title: "Budgets", href: "/budgets", icon: PiggyBank },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Recurring", href: "/recurring", icon: Repeat },
  { title: "Investments", href: "/investments", icon: TrendingUp },
  { title: "Reports", href: "/reports", icon: BarChart3 },
];

export const SECONDARY_NAV: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];
