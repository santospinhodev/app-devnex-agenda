import { Suspense } from "react";
import { TeamPageClient } from "@/src/components/team/TeamPageClient";

export default function TeamPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Carregando equipe...
        </div>
      }
    >
      <TeamPageClient />
    </Suspense>
  );
}
