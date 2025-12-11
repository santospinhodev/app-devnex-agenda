import { Suspense } from "react";
import { FinancePageClient } from "@/src/components/finance/FinancePageClient";

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Carregando financeiro...
        </div>
      }
    >
      <FinancePageClient />
    </Suspense>
  );
}
