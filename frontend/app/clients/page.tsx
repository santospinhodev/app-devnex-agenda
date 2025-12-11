import { Suspense } from "react";
import { ClientsPageClient } from "@/src/components/clients/ClientsPageClient";

export default function ClientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Carregando clientes...
        </div>
      }
    >
      <ClientsPageClient />
    </Suspense>
  );
}
