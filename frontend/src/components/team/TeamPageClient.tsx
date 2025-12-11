"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Toast } from "@/src/components/ui/Toast";
import { useAuth } from "@/src/contexts/AuthContext";
import { apiClient } from "@/src/services/apiClient";
import { SanitizedBarberProfile } from "@/src/types/barbers";
import { SanitizedReceptionistProfile } from "@/src/types/receptionists";
import { NewTeamMemberModal } from "@/src/components/team/NewTeamMemberModal";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "BARBER" | "RECEPTIONIST";
}

const ROLE_LABELS: Record<TeamMember["role"], string> = {
  BARBER: "Barbeiro",
  RECEPTIONIST: "Recepcionista",
};

export function TeamPageClient() {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = useMemo(
    () => Boolean(user?.permissions?.includes("ADMIN")),
    [user]
  );

  useEffect(() => {
    if (!isBootstrapping && (!user || !isAdmin)) {
      router.replace("/dashboard");
    }
  }, [isAdmin, isBootstrapping, router, user]);

  const loadTeam = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    setError(null);
    try {
      const [barbersResponse, receptionistsResponse] = await Promise.all([
        apiClient.get<SanitizedBarberProfile[]>("/users/barbers"),
        apiClient.get<SanitizedReceptionistProfile[]>("/users/receptionists"),
      ]);

      const nextMembers: TeamMember[] = [
        ...barbersResponse.data.map((profile) => ({
          id: profile.id,
          name: profile.name ?? profile.user.name ?? "Sem nome",
          email: profile.user.email,
          phone: profile.user.phone,
          role: "BARBER" as const,
        })),
        ...receptionistsResponse.data.map((profile) => ({
          id: profile.id,
          name: profile.name ?? profile.user.name ?? "Sem nome",
          email: profile.user.email,
          phone: profile.user.phone,
          role: "RECEPTIONIST" as const,
        })),
      ].sort((a, b) => a.name.localeCompare(b.name));

      setMembers(nextMembers);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError("Não foi possível carregar a equipe.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadTeam();
    }
  }, [isAdmin, loadTeam]);

  if (isBootstrapping || !user || !isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
          Carregando equipe...
        </div>
      </DashboardLayout>
    );
  }

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadTeam();
    setToastMessage("Colaborador criado com sucesso");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-blue">
              Equipe
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Gestão de colaboradores
            </h1>
            <p className="text-sm text-slate-500">
              Cadastre barbeiros e recepcionistas para controlar quem pode
              acessar o painel.
            </p>
          </div>
          <Button type="button" onClick={() => setIsModalOpen(true)}>
            Novo colaborador
          </Button>
        </div>

        <Card className="p-6 shadow-card">
          {isLoading ? (
            <p className="text-sm text-slate-500">Carregando equipe...</p>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600">{error}</p>
              <Button type="button" variant="outline" onClick={loadTeam}>
                Tentar novamente
              </Button>
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum colaborador encontrado. Cadastre o primeiro acima.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {members.map((member) => (
                <div
                  key={`${member.role}-${member.id}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {member.name}
                      </p>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                    <span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-blue">
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                  {member.phone && (
                    <p className="mt-2 text-sm text-slate-500">
                      {member.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <NewTeamMemberModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </DashboardLayout>
  );
}
