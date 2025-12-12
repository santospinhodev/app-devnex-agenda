"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BarbershopServiceItem } from "@/src/types/services";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { apiClient } from "@/src/services/apiClient";
import { formatCurrency, formatDuration } from "@/src/utils/formatters";
import { Input } from "@/src/components/ui/Input";
import { ServiceFormModal } from "@/src/components/services/ServiceFormModal";
import { Toast } from "@/src/components/ui/Toast";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { useAuth } from "@/src/contexts/AuthContext";

export function ServicesPageClient() {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<BarbershopServiceItem[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const permissions = useMemo(
    () => new Set(user?.permissions ?? []),
    [user?.permissions]
  );

  const canViewServices = useMemo(
    () =>
      permissions.has("ADMIN") ||
      permissions.has("BARBER") ||
      permissions.has("RECEPTIONIST"),
    [permissions]
  );

  const canManageServices = useMemo(
    () => permissions.has("ADMIN"),
    [permissions]
  );

  const fetchServices = useCallback(
    async (signal?: AbortSignal) => {
      if (!user || !canViewServices) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<BarbershopServiceItem[]>(
          "/services",
          {
            params: { name: debouncedSearch || undefined },
            signal,
          }
        );
        setServices(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError("Não foi possível carregar os serviços.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [canViewServices, debouncedSearch, user]
  );

  useEffect(() => {
    if (!user || isBootstrapping) {
      return;
    }
    if (!canViewServices) {
      router.replace("/dashboard");
      return;
    }
    const controller = new AbortController();
    fetchServices(controller.signal);
    return () => controller.abort();
  }, [canViewServices, fetchServices, isBootstrapping, router, user]);

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setToast("Serviço cadastrado com sucesso!");
    fetchServices();
  };

  const emptyState = !isLoading && services.length === 0;

  const servicesContent = useMemo(() => {
    if (isLoading) {
      return <p className="text-sm text-slate-500">Carregando serviços...</p>;
    }

    if (error) {
      return <p className="text-sm text-red-600">{error}</p>;
    }

    if (emptyState) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-base font-medium text-slate-900">
            Nada por aqui ainda
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Cadastre seu primeiro serviço para liberar o agendamento online.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {services.map((service) => (
          <article
            key={service.id}
            className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_6px_30px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {service.description}
                  </p>
                )}
                <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">
                  {formatDuration(service.durationMin)} • Comissão{" "}
                  {service.commissionPercentage ?? 0}%
                </p>
              </div>
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(service.price)}
              </p>
            </div>
          </article>
        ))}
      </div>
    );
  }, [services, isLoading, error, emptyState]);

  if (isBootstrapping || !user || !canViewServices) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          {isBootstrapping || !user
            ? "Carregando serviços..."
            : "Você não possui permissão para acessar Serviços."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl pb-28">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow">
              Serviços
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Catálogo disponível online
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie os serviços disponíveis para agendamento em poucos
              toques.
            </p>
          </div>
          <Input
            label="Buscar"
            placeholder="Pesquisar por nome"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="mt-6">{servicesContent}</div>
      </div>

      {canManageServices && (
        <>
          <button
            type="button"
            aria-label="Cadastrar serviço"
            className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-yellow text-3xl font-bold text-brand-blue shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-yellow/40 lg:right-10"
            onClick={() => setIsModalOpen(true)}
          >
            +
          </button>

          <ServiceFormModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleModalSuccess}
          />
        </>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </DashboardLayout>
  );
}
