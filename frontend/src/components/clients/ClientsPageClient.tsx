"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { useAuth } from "@/src/contexts/AuthContext";
import { apiClient } from "@/src/services/apiClient";
import { CustomerProfile } from "@/src/types/customers";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { extractInitials, formatPhoneNumber } from "@/src/utils/formatters";

export function ClientsPageClient() {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const permissions = useMemo(
    () => new Set(user?.permissions ?? []),
    [user?.permissions]
  );
  const canAccess = useMemo(
    () =>
      permissions.has("ADMIN") ||
      permissions.has("BARBER") ||
      permissions.has("RECEPTIONIST"),
    [permissions]
  );

  const loadCustomers = useCallback(async () => {
    if (!user || !canAccess) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response =
        await apiClient.get<CustomerProfile[]>("/users/customers");
      setCustomers(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError("Não foi possível carregar os clientes.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [canAccess, user]);

  useEffect(() => {
    if (!user || isBootstrapping) {
      return;
    }
    if (!canAccess) {
      router.replace("/dashboard");
      return;
    }
    loadCustomers();
  }, [canAccess, isBootstrapping, loadCustomers, router, user]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    if (!normalizedQuery) {
      return customers;
    }
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(normalizedQuery)
    );
  }, [customers, search]);

  const buildWhatsAppLink = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    const normalized = digits.startsWith("55") ? digits : `55${digits}`;
    return `https://wa.me/${normalized}`;
  };

  if (isBootstrapping || !user || !canAccess) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          {isBootstrapping || !user
            ? "Carregando clientes..."
            : "Você não possui permissão para acessar Clientes."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl pb-24">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow">
              Clientes
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Lista de contatos rápidos
            </h1>
            <p className="text-sm text-slate-500">
              Veja quem já agendou com você e chame no WhatsApp em um toque.
            </p>
          </div>
          <Input
            label="Buscar cliente"
            placeholder="Digite o nome"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p className="text-sm text-slate-500">Carregando clientes...</p>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600">{error}</p>
              <Button type="button" variant="outline" onClick={loadCustomers}>
                Tentar novamente
              </Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-base font-semibold text-slate-900">
                {customers.length === 0
                  ? "Nenhum cliente cadastrado."
                  : "Nenhum cliente encontrado."}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Cadastre clientes automaticamente ao criar um agendamento.
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <article
                key={customer.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white px-4 py-4 shadow-[0_6px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/20 text-base font-semibold uppercase tracking-wide text-brand-blue">
                    {extractInitials(customer.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {customer.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatPhoneNumber(customer.phone)}
                    </p>
                  </div>
                </div>
                <a
                  href={buildWhatsAppLink(customer.phone)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Conversar com ${customer.name} no WhatsApp`}
                  className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-200"
                >
                  WhatsApp
                </a>
              </article>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
