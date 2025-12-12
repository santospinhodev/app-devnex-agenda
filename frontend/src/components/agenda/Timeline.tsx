"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";
import { FinalTimelineEntry, TimelineSlotStatus } from "@/src/types/agenda";

interface TimelineProps {
  date: Date;
  barberId: string | null;
  onSelectFreeSlot?: (slot: FinalTimelineEntry) => void;
  refreshKey?: number;
  onSelectAppointment?: (entry: FinalTimelineEntry) => void;
}

const formatDateParam = (date: Date) => {
  const normalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatHumanDate = (date: Date) => {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const STATUS_LABELS: Record<TimelineSlotStatus, string> = {
  FREE: "Disponível",
  APPOINTMENT: "Agendado",
  PENDING: "Aguardando confirmação",
  CONFIRMED: "Confirmado",
  DONE: "Concluído",
  CANCELLED: "Cancelado",
  BLOCKED: "Bloqueado",
  UNAVAILABLE: "Indisponível",
};

const APPOINTMENT_STATUS_STYLES: Record<string, string> = {
  PENDING:
    "border-l-4 border-l-amber-400 border border-amber-100 bg-amber-50 text-amber-900",
  CONFIRMED:
    "border-l-4 border-l-emerald-500 border border-emerald-100 bg-emerald-50 text-emerald-900",
  DONE: "border-l-4 border-l-slate-400 border border-slate-200 bg-slate-50 text-slate-600",
  CANCELLED:
    "border-l-4 border-l-rose-400 border border-rose-100 bg-rose-50 text-rose-800",
};

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DONE: "Concluído",
  CANCELLED: "Cancelado",
};

const isBusyStatus = (status: TimelineSlotStatus) =>
  status !== "FREE" && status !== "BLOCKED" && status !== "UNAVAILABLE";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getBlockCopy = (entry: FinalTimelineEntry) => {
  if (entry.source === "LUNCH") {
    return "Pausa";
  }
  return entry.type === "HOLIDAY" ? "Feriado" : "Bloqueado";
};

export function Timeline({
  date,
  barberId,
  onSelectFreeSlot,
  refreshKey = 0,
  onSelectAppointment,
}: TimelineProps) {
  const [entries, setEntries] = useState<FinalTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = useMemo(() => formatDateParam(date), [date]);
  const humanReadableDate = useMemo(() => formatHumanDate(date), [date]);

  const fetchTimeline = useCallback(
    async (signal?: AbortSignal) => {
      if (!barberId) {
        setEntries([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<FinalTimelineEntry[]>(
          `/agenda/barber/${barberId}/final/day`,
          {
            params: { date: formattedDate },
            signal,
          }
        );
        setEntries(response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        setError("Não foi possível carregar a agenda. Tente novamente.");
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [barberId, formattedDate]
  );

  useEffect(() => {
    if (!barberId) {
      return;
    }
    const controller = new AbortController();
    fetchTimeline(controller.signal);
    return () => controller.abort();
  }, [barberId, fetchTimeline, refreshKey]);

  if (!barberId) {
    return (
      <Card className="border-dashed border-brand-yellow/60 bg-white/70 p-6 text-center">
        <p className="text-base font-semibold text-slate-800">
          Selecione um barbeiro para visualizar a agenda do dia.
        </p>
      </Card>
    );
  }

  const handleRetry = () => fetchTimeline();

  const renderSlot = (entry: FinalTimelineEntry, index: number) => {
    const slotStatus = entry.status;
    const baseKey = `${entry.time}-${slotStatus}-${entry.appointment?.id ?? index}`;
    const hasAppointment = Boolean(entry.appointment);
    const busySlot = isBusyStatus(slotStatus);

    if (hasAppointment) {
      const appointmentStatus =
        entry.appointment?.status ??
        (slotStatus === "PENDING" ? "PENDING" : "CONFIRMED");
      const appointmentClasses = cx(
        "relative z-10 flex items-stretch gap-4 rounded-2xl border px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
        APPOINTMENT_STATUS_STYLES[appointmentStatus] ??
          APPOINTMENT_STATUS_STYLES.CONFIRMED,
        "cursor-pointer"
      );
      const label =
        APPOINTMENT_STATUS_LABELS[appointmentStatus] ??
        STATUS_LABELS.APPOINTMENT;

      const handleAppointmentClick = () => onSelectAppointment?.(entry);

      return (
        <div
          key={baseKey}
          className={appointmentClasses}
          role="button"
          tabIndex={0}
          onClick={handleAppointmentClick}
          onKeyUp={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleAppointmentClick();
            }
          }}
        >
          <div className="w-16 shrink-0 text-sm font-semibold text-slate-500">
            {entry.time}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {label}
            </p>
            <div className="mt-1 space-y-1">
              <p className="text-base font-semibold text-slate-900">
                {entry.appointment!.customer.name ?? "Cliente sem nome"}
              </p>
              <p className="text-sm text-slate-700">
                {entry.appointment!.service.name} •{" "}
                {entry.appointment!.service.durationMin} min
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (busySlot && !hasAppointment) {
      const fallbackLabel = STATUS_LABELS[slotStatus] ?? STATUS_LABELS.PENDING;
      return (
        <div
          key={baseKey}
          className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            {fallbackLabel}
          </p>
          <p className="mt-1">
            Horário reservado. Atualize a página para ver os detalhes.
          </p>
        </div>
      );
    }

    if (slotStatus === "BLOCKED") {
      return (
        <div
          key={baseKey}
          className="flex items-stretch gap-4 rounded-2xl border border-slate-200 bg-stripe px-4 py-3 text-slate-600"
        >
          <div className="w-16 shrink-0 text-sm font-semibold text-slate-500">
            {entry.time}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {STATUS_LABELS.BLOCKED}
            </p>
            <p className="mt-1 text-sm">{getBlockCopy(entry)}</p>
          </div>
        </div>
      );
    }

    if (slotStatus === "UNAVAILABLE") {
      return (
        <div
          key={baseKey}
          className="flex items-stretch gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
        >
          <div className="w-16 shrink-0 text-sm font-semibold text-slate-500">
            {entry.time}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {STATUS_LABELS.UNAVAILABLE}
            </p>
            <p className="mt-1 text-sm">Fora da disponibilidade padrão.</p>
          </div>
        </div>
      );
    }

    const handleCreate = () => onSelectFreeSlot?.(entry);

    return (
      <div
        key={baseKey}
        className="flex items-stretch gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-slate-600 transition hover:border-brand-yellow hover:bg-brand-yellow/10"
        role="button"
        tabIndex={0}
        onClick={handleCreate}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCreate();
          }
        }}
      >
        <div className="w-16 shrink-0 text-sm font-semibold text-slate-500">
          {entry.time}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {STATUS_LABELS.FREE}
          </p>
          <p className="mt-1 text-sm">Toque para criar um agendamento</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Linha do tempo
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {humanReadableDate}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>{entries.length} horários</span>
          <Button type="button" variant="outline" onClick={handleRetry}>
            Atualizar
          </Button>
        </div>
      </div>
      <div className="max-h-[calc(100vh-280px)] space-y-3 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Carregando agenda do dia...
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <div>
              <Button type="button" variant="outline" onClick={handleRetry}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}
        {!isLoading && !error && entries.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nenhum horário configurado para esta data.
          </div>
        )}
        {!error && entries.map(renderSlot)}
      </div>
    </Card>
  );
}
