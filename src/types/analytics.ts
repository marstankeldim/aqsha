export interface CategorySpend {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  value: number;
}

export interface MonthlyPoint {
  key: string; // yyyy-MM
  label: string; // e.g. "Jun"
  income: number;
  expense: number;
  net: number;
}

export interface DashboardAnalytics {
  currency: string;
  totalSpending: number;
  spendingByCategory: CategorySpend[];
  monthlyTrend: MonthlyPoint[];
}
