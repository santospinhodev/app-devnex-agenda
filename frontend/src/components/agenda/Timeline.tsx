"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";
import { useAuth } from "@/src/contexts/AuthContext";
import { FinalTimelineEntry, TimelineSlotStatus } from "@/src/types/agenda";

interface TimelineProps {
  date: Date;
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

const STATUS_STYLES: Record<TimelineSlotStatus, string> = {
  FREE: "border-slate-200 bg-white text-slate-700",
  APPOINTMENT: "border-primary bg-primary/10 text-slate-900",
  BLOCKED:
    "border-slate-200 bg-[repeating-linear-gradient(45deg,#e2e8f0,#e2e8f0_12px,#f8fafc_12px,#f8fafc_24px)] text-slate-600",
  UNAVAILABLE: "border-slate-200 border-dashed bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<TimelineSlotStatus, string> = {
  FREE: "Disponível",
  APPOINTMENT: "Agendado",
  BLOCKED: "Bloqueado",
  UNAVAILABLE: "Indisponível",
};

export function Timeline({ date }: TimelineProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FinalTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const barberProfileId = user?.barberProfile?.id ?? null;
  const formattedDate = useMemo(() => formatDateParam(date), [date]);
  const humanReadableDate = useMemo(() => formatHumanDate(date), [date]);

  const fetchTimeline = useCallback(
    async (signal?: AbortSignal) => {
      if (!barberProfileId) {
        setEntries([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<FinalTimelineEntry[]>(
          `/agenda/barber/${barberProfileId}/final/day`,
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
    [barberProfileId, formattedDate]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTimeline(controller.signal);
    return () => controller.abort();
  }, [fetchTimeline]);

  if (!user) {
    return null;
  }

  if (!barberProfileId) {
    return (
      <Card className="border-dashed p-6 text-center">
        <p className="text-base font-semibold text-slate-800">
          Você não possui uma agenda vinculada.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Solicite ao administrador para associar um perfil de barbeiro ao seu
          usuário.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Timeline
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {humanReadableDate}
          </p>
        </div>
        <span className="text-sm text-slate-400">
          {entries.length} horários
        </span>
      </div>
      <div className="max-h-[calc(100vh-280px)] space-y-3 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Carregando agenda do dia...
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fetchTimeline()}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        )}
        {!isLoading && !error && entries.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nenhum horário configurado para esta data.
          </div>
        )}
        {!error &&
          entries.map((entry, index) => (
            <div
              key={`${entry.time}-${entry.status}-${entry.appointment?.id ?? index}`}
              className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${STATUS_STYLES[entry.status]}`}
            >
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {entry.time}
                </p>
                <p className="text-sm text-slate-500">
                  {STATUS_LABELS[entry.status]}
                </p>
              </div>
              {entry.status === "APPOINTMENT" && entry.appointment && (
                <div className="flex-1 text-right">
                  <p className="text-base font-semibold text-slate-900">
                    {entry.appointment.customer.name ?? "Cliente sem nome"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {entry.appointment.service.name} •{" "}
                    {entry.appointment.service.durationMin}
                    min
                  </p>
                </div>
              )}
              {entry.status === "FREE" && (
                <p className="flex-1 text-right text-sm text-slate-500">
                  Slot liberado
                </p>
              )}
              {entry.status === "BLOCKED" && (
                <p className="flex-1 text-right text-sm text-slate-600">
                  {entry.source === "LUNCH" ? "Pausa" : "Bloqueado"}
                </p>
              )}
              {entry.status === "UNAVAILABLE" && (
                <p className="flex-1 text-right text-sm text-slate-500">
                  Fora da disponibilidade
                </p>
              )}
            </div>
          ))}
      </div>
    </Card>
  );
}
