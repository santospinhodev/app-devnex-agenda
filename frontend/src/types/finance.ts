export interface DailyCashTransaction {
  id: string;
  appointmentId: string | null;
  type: "INCOME" | "EXPENSE";
  amount: string;
  paymentMethod: "CASH" | "CARD" | "PIX";
  createdAt: string;
}

export interface DailyCashSummary {
  date: string;
  totalIncome: string;
  totalExpense: string;
  netTotal: string;
  transactions: DailyCashTransaction[];
}

export interface BarberCommissionEntry {
  id: string;
  appointmentId: string;
  status: "PENDING" | "PAID";
  amount: string;
  serviceName: string | null;
  performedAt: string | null;
  createdAt: string;
}

export interface BarberBalanceSummary {
  month: string;
  grossTotal: string;
  commissionPercentage: number;
  projectedCommission: string;
  pendingTotal: string;
  paidTotal: string;
  commissions: BarberCommissionEntry[];
}
