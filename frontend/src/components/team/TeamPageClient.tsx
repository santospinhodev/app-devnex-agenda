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
import { EditTeamMemberModal } from "@/src/components/team/EditTeamMemberModal";
import {
  TEAM_ROLE_ENDPOINTS,
  TEAM_ROLE_LABELS,
  TeamMember,
} from "@/src/components/team/team.types";

const DEFAULT_TEAM_ACTION_ERROR = "Não foi possível atualizar o colaborador.";

const extractActionErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const payload = err.response?.data as { message?: string | string[] };
    const message = payload?.message;
    if (Array.isArray(message)) {
      return message[0];
    }
    if (typeof message === "string") {
      return message;
    }
  }
  return DEFAULT_TEAM_ACTION_ERROR;
};

export function TeamPageClient() {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
          isActive: profile.isActive,
        })),
        ...receptionistsResponse.data.map((profile) => ({
          id: profile.id,
          name: profile.name ?? profile.user.name ?? "Sem nome",
          email: profile.user.email,
          phone: profile.user.phone,
          role: "RECEPTIONIST" as const,
          isActive: profile.isActive,
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

  const closeEditModal = () => {
    setSelectedMember(null);
    setIsEditModalOpen(false);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    loadTeam();
    setToastMessage("Colaborador criado com sucesso");
  };

  const handleEditClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    closeEditModal();
    loadTeam();
    setToastMessage("Colaborador atualizado com sucesso");
  };

  const handleArchiveToggle = useCallback(
    async (member: TeamMember, nextIsActive: boolean) => {
      if (!nextIsActive) {
        const confirmed = window.confirm(
          `Arquivar ${member.name}? O acesso ao sistema será bloqueado.`
        );
        if (!confirmed) {
          return;
        }
      }

      setActionLoadingId(member.id);
      try {
        await apiClient.patch(
          `${TEAM_ROLE_ENDPOINTS[member.role]}/${member.id}`,
          {
            isActive: nextIsActive,
          }
        );
        setToastMessage(
          nextIsActive
            ? "Colaborador reativado com sucesso"
            : "Colaborador arquivado com sucesso"
        );
        loadTeam();
      } catch (err) {
        setToastMessage(extractActionErrorMessage(err));
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadTeam]
  );

  if (isBootstrapping || !user || !isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
          Carregando equipe...
        </div>
      </DashboardLayout>
    );
  }

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
          <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
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
                  className={`rounded-2xl border border-slate-200 bg-white px-4 py-4 ${
                    member.isActive ? "" : "opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {member.name}
                      </p>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                    <span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-blue">
                      {TEAM_ROLE_LABELS[member.role]}
                    </span>
                  </div>
                  {member.phone && (
                    <p className="mt-2 text-sm text-slate-500">
                      {member.phone}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                        member.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {member.isActive ? "Ativo" : "Arquivado"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-3 py-1 text-xs"
                        onClick={() => handleEditClick(member)}
                        disabled={actionLoadingId === member.id}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant={member.isActive ? "outline" : "secondary"}
                        className="px-3 py-1 text-xs"
                        onClick={() =>
                          handleArchiveToggle(member, !member.isActive)
                        }
                        isLoading={actionLoadingId === member.id}
                      >
                        {member.isActive ? "Arquivar" : "Reativar"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <NewTeamMemberModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditTeamMemberModal
        open={isEditModalOpen}
        member={selectedMember}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </DashboardLayout>
  );
}
