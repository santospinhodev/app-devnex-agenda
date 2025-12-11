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
