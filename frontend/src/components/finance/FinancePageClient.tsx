"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { useAuth } from "@/src/contexts/AuthContext";
import { apiClient } from "@/src/services/apiClient";
import { DailyCashSummary } from "@/src/types/finance";
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

export function FinancePageClient() {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<DailyCashSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const permissions = useMemo(
    () => new Set(user?.permissions ?? []),
    [user?.permissions]
  );
  const canAccessFinance = useMemo(
    () => permissions.has("ADMIN") || permissions.has("RECEPTIONIST"),
    [permissions]
  );

  const loadSummary = useCallback(async () => {
    if (!user || !canAccessFinance) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<DailyCashSummary>("/finance/daily");
      setSummary(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError("Não foi possível carregar o financeiro.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [canAccessFinance, user]);

  useEffect(() => {
    if (!user || isBootstrapping) {
      return;
    }
    if (!canAccessFinance) {
      router.replace("/dashboard");
      return;
    }
    loadSummary();
  }, [canAccessFinance, isBootstrapping, loadSummary, router, user]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Faturamento hoje",
        value: formatCurrency(summary?.totalIncome ?? "0"),
        accent: "bg-emerald-50 text-emerald-800",
      },
      {
        label: "Despesas hoje",
        value: formatCurrency(summary?.totalExpense ?? "0"),
        accent: "bg-rose-50 text-rose-800",
      },
      {
        label: "Saldo líquido",
        value: formatCurrency(summary?.netTotal ?? "0"),
        accent: "bg-slate-100 text-slate-900",
      },
    ],
    [summary?.netTotal, summary?.totalExpense, summary?.totalIncome]
  );

  const handleExpenseSuccess = () => {
    setIsExpenseModalOpen(false);
    setToastMessage("Despesa lançada com sucesso!");
    loadSummary();
  };

  if (isBootstrapping || !user || !canAccessFinance) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          {isBootstrapping || !user
            ? "Carregando financeiro..."
            : "Você não possui permissão para acessar o Financeiro."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
          {summary && (
            <p className="text-sm text-slate-500">
              Referente a {formatSummaryDate(summary.date)}
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
            <Button type="button" variant="outline" onClick={loadSummary}>
              Atualizar
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Carregando extrato...</p>
            ) : error ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600">{error}</p>
                <Button type="button" variant="outline" onClick={loadSummary}>
                  Tentar novamente
                </Button>
              </div>
            ) : !summary || summary.transactions.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhuma movimentação registrada hoje.
              </p>
            ) : (
              summary.transactions.map((transaction) => {
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
                          {PAYMENT_METHOD_LABELS[transaction.paymentMethod] ??
                            transaction.paymentMethod}
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

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </DashboardLayout>
  );
}
