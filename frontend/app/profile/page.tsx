import { Suspense } from "react";
import { ProfilePageClient } from "@/src/components/profile/ProfilePageClient";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Carregando perfil...
        </div>
      }
    >
      <ProfilePageClient />
    </Suspense>
  );
}
