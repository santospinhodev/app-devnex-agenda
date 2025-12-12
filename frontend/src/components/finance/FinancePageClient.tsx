"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { useAuth } from "@/src/contexts/AuthContext";
import { apiClient } from "@/src/services/apiClient";
import { BarberBalanceSummary, DailyCashSummary } from "@/src/types/finance";
import { formatCurrency } from "@/src/utils/formatters";
import { Button } from "@/src/components/ui/Button";
import { Toast } from "@/src/components/ui/Toast";
import { NewExpenseModal } from "./NewExpenseModal";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  CARD: "Cartão",
  PIX: "Pix",
};

const formatSummaryDate = (value?: string) => {
  if (!value) {
    return "";
  }
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return value;
  }
  const parsed = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
    .format(parsed)
    .replace(/^./, (letter) => letter.toUpperCase());
};

const formatTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--:--";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const getCurrentMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatMonthLabel = (value?: string) => {
  if (!value) {
    return "";
  }
  const [year, month] = value.split("-").map((part) => Number(part));
  if (!year || !month) {
    return value;
  }
  const parsed = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  })
    .format(parsed)
    .replace(/^./, (letter) => letter.toUpperCase());
};

const formatCommissionDate = (value?: string | null) => {
  if (!value) {
    return "--";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const COMMISSION_STATUS_META: Record<
  "PENDING" | "PAID",
  { label: string; badge: string }
> = {
  PENDING: {
    label: "Pendente",
    badge: "bg-amber-100 text-amber-900",
  },
  PAID: {
    label: "Pago",
    badge: "bg-emerald-100 text-emerald-900",
  },
};

export function FinancePageClient() {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const [dailySummary, setDailySummary] = useState<DailyCashSummary | null>(
    null
  );
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [barberSummary, setBarberSummary] =
    useState<BarberBalanceSummary | null>(null);
  const [barberLoading, setBarberLoading] = useState(false);
  const [barberError, setBarberError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const permissions = useMemo(
    () => new Set(user?.permissions ?? []),
    [user?.permissions]
  );
  const canViewAdminFinance = useMemo(
    () => permissions.has("ADMIN") || permissions.has("RECEPTIONIST"),
    [permissions]
  );
  const canViewBarberFinance = useMemo(
    () => permissions.has("BARBER"),
    [permissions]
  );
  const activeView: "ADMIN" | "BARBER" | null = canViewAdminFinance
    ? "ADMIN"
    : canViewBarberFinance
      ? "BARBER"
      : null;

  const loadAdminSummary = useCallback(async () => {
    if (!user || !canViewAdminFinance) {
      return;
    }
    setAdminLoading(true);
    setAdminError(null);
    try {
      const response = await apiClient.get<DailyCashSummary>("/finance/daily");
      setDailySummary(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setAdminError("Não foi possível carregar o financeiro.");
      }
    } finally {
      setAdminLoading(false);
    }
  }, [canViewAdminFinance, user]);

  const loadBarberBalance = useCallback(async () => {
    if (!user || !canViewBarberFinance) {
      return;
    }
    setBarberLoading(true);
    setBarberError(null);
    try {
      const response = await apiClient.get<BarberBalanceSummary>(
        "/finance/balance",
        {
          params: selectedMonth ? { month: selectedMonth } : undefined,
        }
      );
      setBarberSummary(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setBarberError("Não foi possível carregar seus recebimentos.");
      }
    } finally {
      setBarberLoading(false);
    }
  }, [canViewBarberFinance, selectedMonth, user]);

  useEffect(() => {
    if (!user || isBootstrapping) {
      return;
    }
    if (!activeView) {
      router.replace("/dashboard");
      return;
    }
    if (activeView === "ADMIN") {
      loadAdminSummary();
    } else {
      loadBarberBalance();
    }
  }, [
    activeView,
    isBootstrapping,
    loadAdminSummary,
    loadBarberBalance,
    router,
    user,
  ]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Faturamento hoje",
        value: formatCurrency(dailySummary?.totalIncome ?? "0"),
        accent: "bg-emerald-50 text-emerald-800",
      },
      {
        label: "Despesas hoje",
        value: formatCurrency(dailySummary?.totalExpense ?? "0"),
        accent: "bg-rose-50 text-rose-800",
      },
      {
        label: "Saldo líquido",
        value: formatCurrency(dailySummary?.netTotal ?? "0"),
        accent: "bg-slate-100 text-slate-900",
      },
    ],
    [
      dailySummary?.netTotal,
      dailySummary?.totalExpense,
      dailySummary?.totalIncome,
    ]
  );

  const barberHighlights = useMemo(() => {
    const monthLabel = formatMonthLabel(barberSummary?.month ?? selectedMonth);
    return [
      {
        label: "Minha produção",
        value: formatCurrency(barberSummary?.grossTotal ?? "0"),
        helper: monthLabel || "Competência atual",
      },
      {
        label: "Minha comissão",
        value: formatCurrency(barberSummary?.projectedCommission ?? "0"),
        helper: `${barberSummary?.commissionPercentage ?? 0}% sobre os serviços`,
      },
    ];
  }, [
    barberSummary?.commissionPercentage,
    barberSummary?.grossTotal,
    barberSummary?.month,
    barberSummary?.projectedCommission,
    selectedMonth,
  ]);

  const handleExpenseSuccess = () => {
    setIsExpenseModalOpen(false);
    setToastMessage("Despesa lançada com sucesso!");
    loadAdminSummary();
  };

  if (isBootstrapping || !user) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          Carregando financeiro...
        </div>
      </DashboardLayout>
    );
  }

  if (!activeView) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          Você não possui permissão para acessar o Financeiro.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {activeView === "ADMIN" ? (
        <>
          <div className="mx-auto max-w-4xl pb-28">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                  Financeiro
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Visão rápida do caixa
                </h1>
                <p className="text-sm text-slate-500">
                  Acompanhe entradas, despesas e lance movimentos manuais.
                </p>
              </div>
              {dailySummary && (
                <p className="text-sm text-slate-500">
                  Referente a {formatSummaryDate(dailySummary.date)}
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-3xl p-4 shadow-[0_6px_30px_rgba(15,23,42,0.04)] ${card.accent}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em]">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Extrato do dia
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadAdminSummary}
                >
                  Atualizar
                </Button>
              </div>

              <div className="mt-4 space-y-4">
                {adminLoading ? (
                  <p className="text-sm text-slate-500">
                    Carregando extrato...
                  </p>
                ) : adminError ? (
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">{adminError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadAdminSummary}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : !dailySummary || dailySummary.transactions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nenhuma movimentação registrada hoje.
                  </p>
                ) : (
                  dailySummary.transactions.map((transaction) => {
                    const isIncome = transaction.type === "INCOME";
                    const icon = isIncome ? "✂️" : "💸";
                    const label = isIncome
                      ? `Serviço ${transaction.appointmentId ? `#${transaction.appointmentId.slice(-4)}` : "finalizado"}`
                      : "Despesa manual";
                    const amount = `${isIncome ? "+" : "-"} ${formatCurrency(
                      transaction.amount
                    )}`;
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                            {icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatTime(transaction.createdAt)} •{" "}
                              {PAYMENT_METHOD_LABELS[
                                transaction.paymentMethod
                              ] ?? transaction.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            isIncome ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {amount}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-3 text-sm font-semibold uppercase tracking-wide text-brand-blue shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-yellow/50 lg:right-10"
            onClick={() => setIsExpenseModalOpen(true)}
          >
            Lançar despesa
          </button>

          <NewExpenseModal
            open={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            onSuccess={handleExpenseSuccess}
          />
        </>
      ) : (
        <div className="mx-auto max-w-3xl pb-24">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-yellow">
              Financeiro
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Minha visão do mês
            </h1>
            <p className="text-sm text-slate-500">
              Veja quanto você já produziu e quanto tem a receber.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {barberHighlights.map((card) => (
              <div
                key={card.label}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_6px_30px_rgba(15,23,42,0.04)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Serviços realizados
                </h2>
                <p className="text-sm text-slate-500">
                  Conferir pagamentos liberados e pendentes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-slate-600">
                  Competência
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className="mt-1 w-40 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadBarberBalance}
                >
                  Atualizar
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {barberLoading ? (
                <p className="text-sm text-slate-500">
                  Carregando serviços do mês...
                </p>
              ) : barberError ? (
                <div className="space-y-3">
                  <p className="text-sm text-red-600">{barberError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadBarberBalance}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : !barberSummary || barberSummary.commissions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum serviço registrado para este período.
                </p>
              ) : (
                barberSummary.commissions.map((commission) => {
                  const meta = COMMISSION_STATUS_META[commission.status];
                  const shortId = commission.appointmentId
                    ? commission.appointmentId.slice(-4)
                    : "";
                  return (
                    <div
                      key={commission.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {commission.serviceName ?? "Serviço registrado"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatCommissionDate(commission.performedAt)}
                          {shortId && ` • #${shortId}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:text-right">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                        <p className="text-base font-semibold text-slate-900">
                          {formatCurrency(commission.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </DashboardLayout>
  );
}
