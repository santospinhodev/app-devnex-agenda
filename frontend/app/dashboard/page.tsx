import { Suspense } from "react";
import { DashboardPageClient } from "@/src/components/dashboard/DashboardPageClient";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Carregando painel...
        </div>
      }
    >
      <DashboardPageClient />
    </Suspense>
  );
}
