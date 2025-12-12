"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CalendarClock, MessageCircle } from "lucide-react";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { useAuth } from "@/src/contexts/AuthContext";
import { apiClient } from "@/src/services/apiClient";
import { CustomerProfile } from "@/src/types/customers";
import { SanitizedBarberProfile } from "@/src/types/barbers";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Toast } from "@/src/components/ui/Toast";
import { DateNavigator } from "@/src/components/agenda/DateNavigator";
import { NewAppointmentModal } from "@/src/components/agenda/NewAppointmentModal";
import { extractInitials, formatPhoneNumber } from "@/src/utils/formatters";

export function ClientsPageClient() {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [barberOptions, setBarberOptions] = useState<SanitizedBarberProfile[]>(
    []
  );
  const [barbersLoading, setBarbersLoading] = useState(false);
  const [barbersError, setBarbersError] = useState<string | null>(null);
  const [bookingCustomer, setBookingCustomer] =
    useState<CustomerProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  const canSwitchBarber = useMemo(
    () => permissions.has("ADMIN") || permissions.has("RECEPTIONIST"),
    [permissions]
  );

  const modalBarberOptions = useMemo(
    () =>
      barberOptions.map((option) => ({
        id: option.id,
        name: option.name ?? option.user.name ?? "Sem nome",
      })),
    [barberOptions]
  );

  const defaultBarberId = useMemo(
    () =>
      canSwitchBarber
        ? (modalBarberOptions[0]?.id ?? null)
        : (user?.barberProfile?.id ?? null),
    [canSwitchBarber, modalBarberOptions, user?.barberProfile?.id]
  );

  const canScheduleAppointments = useMemo(
    () =>
      canSwitchBarber
        ? modalBarberOptions.length > 0
        : Boolean(defaultBarberId),
    [canSwitchBarber, defaultBarberId, modalBarberOptions]
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

  const loadBarbers = useCallback(async () => {
    if (!canSwitchBarber) {
      return;
    }
    setBarbersLoading(true);
    setBarbersError(null);
    try {
      const response =
        await apiClient.get<SanitizedBarberProfile[]>("/users/barbers");
      setBarberOptions(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setBarbersError("Não foi possível carregar os barbeiros.");
      }
    } finally {
      setBarbersLoading(false);
    }
  }, [canSwitchBarber]);

  useEffect(() => {
    if (!user || isBootstrapping) {
      return;
    }
    if (!canAccess) {
      router.replace("/dashboard");
      return;
    }
    loadCustomers();
    if (canSwitchBarber) {
      loadBarbers();
    }
  }, [
    canAccess,
    canSwitchBarber,
    isBootstrapping,
    loadBarbers,
    loadCustomers,
    router,
    user,
  ]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    if (!normalizedQuery) {
      return customers;
    }
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(normalizedQuery)
    );
  }, [customers, search]);

  const handleScheduleClick = (customer: CustomerProfile) => {
    if (!canScheduleAppointments) {
      setToastMessage(
        canSwitchBarber
          ? "Cadastre pelo menos um barbeiro antes de agendar."
          : "Vincule seu perfil de barbeiro antes de agendar."
      );
      return;
    }
    setBookingCustomer(customer);
  };

  const handleModalClose = () => setBookingCustomer(null);

  const handleAppointmentSuccess = () => {
    setBookingCustomer(null);
    setToastMessage("Agendamento criado com sucesso!");
    loadCustomers();
  };

  const handleToastDismiss = () => setToastMessage(null);

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

        <div className="mt-4 space-y-4">
          <DateNavigator value={selectedDate} onChange={setSelectedDate} />
          {!canSwitchBarber && user?.barberProfile && (
            <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Agendando para
              </p>
              <p className="text-base font-semibold text-slate-900">
                {user.name ?? "Barbeiro"}
              </p>
            </section>
          )}
          {!canScheduleAppointments && !barbersLoading && (
            <section className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {canSwitchBarber
                ? "Cadastre pelo menos um barbeiro para habilitar o agendamento rápido."
                : "Vincule seu perfil de barbeiro para habilitar o agendamento rápido."}
            </section>
          )}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleScheduleClick(customer)}
                    disabled={!canScheduleAppointments}
                    aria-label={`Agendar com ${customer.name}`}
                    title="Agendar"
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-base transition ${
                      canScheduleAppointments
                        ? "border-brand-yellow bg-brand-yellow/20 text-brand-blue hover:bg-brand-yellow/30"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CalendarClock className="h-5 w-5" aria-hidden />
                  </button>
                  <a
                    href={buildWhatsAppLink(customer.phone)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Conversar com ${customer.name} no WhatsApp`}
                    title="WhatsApp"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden />
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {bookingCustomer && (
        <NewAppointmentModal
          open={Boolean(bookingCustomer)}
          slot={null}
          date={selectedDate}
          barberId={defaultBarberId}
          barberOptions={canSwitchBarber ? modalBarberOptions : undefined}
          allowBarberSelection={canSwitchBarber}
          onClose={handleModalClose}
          onSuccess={handleAppointmentSuccess}
          initialCustomer={{
            id: bookingCustomer.id,
            name: bookingCustomer.name,
            phone: bookingCustomer.phone,
          }}
          requireTimeSelection
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={handleToastDismiss} />
      )}
    </DashboardLayout>
  );
}
