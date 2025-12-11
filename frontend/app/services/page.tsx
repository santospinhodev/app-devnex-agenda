import { Suspense } from "react";
import { ServicesPageClient } from "@/src/components/services/ServicesPageClient";

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Carregando serviços...
        </div>
      }
    >
      <ServicesPageClient />
    </Suspense>
  );
}
