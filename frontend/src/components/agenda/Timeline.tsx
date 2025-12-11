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
}

const formatDateParam = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.toISOString().split("T")[0];
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
  BLOCKED: "Bloqueado",
  UNAVAILABLE: "Indisponível",
};

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
    const baseKey = `${entry.time}-${entry.status}-${entry.appointment?.id ?? index}`;
    const isFree = entry.status === "FREE";
    const isAppointment = entry.status === "APPOINTMENT" && entry.appointment;
    const slotClasses = cx(
      "flex items-stretch gap-4 rounded-2xl border px-4 py-3",
      isFree &&
        "min-h-[52px] cursor-pointer border-dashed border-slate-200 bg-white text-slate-600 hover:border-brand-yellow hover:bg-brand-yellow/10",
      entry.status === "APPOINTMENT" &&
        "border border-primary/20 border-l-4 border-l-primary bg-primary/10",
      entry.status === "BLOCKED" && "border-slate-200 bg-stripe text-slate-600",
      entry.status === "UNAVAILABLE" &&
        "border-slate-200 bg-slate-50 text-slate-500",
      !isFree && "text-slate-800"
    );

    const handleClick = () => {
      if (isFree) {
        onSelectFreeSlot?.(entry);
      }
    };

    return (
      <div
        key={baseKey}
        className={slotClasses}
        role={isFree ? "button" : undefined}
        tabIndex={isFree ? 0 : undefined}
        onClick={handleClick}
        onKeyUp={(event) => {
          if (!isFree) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelectFreeSlot?.(entry);
          }
        }}
      >
        <div className="w-16 shrink-0 text-sm font-semibold text-slate-500">
          {entry.time}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {STATUS_LABELS[entry.status]}
          </p>
          {isAppointment ? (
            <div className="mt-1 space-y-1">
              <p className="text-base font-semibold text-slate-900">
                {entry.appointment!.customer.name ?? "Cliente sem nome"}
              </p>
              <p className="text-sm text-slate-700">
                {entry.appointment!.service.name} •{" "}
                {entry.appointment!.service.durationMin} min
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              {entry.status === "BLOCKED"
                ? getBlockCopy(entry)
                : entry.status === "UNAVAILABLE"
                  ? "Fora da disponibilidade"
                  : "Toque para criar um agendamento"}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Timeline
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {humanReadableDate}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>{entries.length} slots</span>
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
