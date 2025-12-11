"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Toast } from "@/src/components/ui/Toast";
import { apiClient } from "@/src/services/apiClient";
import {
  BarberAvailabilityEntry,
  BarberAvailabilityResponse,
} from "@/src/types/agenda";

const WEEK_DAYS: Array<{ label: string; dayOfWeek: number }> = [
  { label: "Segunda-feira", dayOfWeek: 1 },
  { label: "Terça-feira", dayOfWeek: 2 },
  { label: "Quarta-feira", dayOfWeek: 3 },
  { label: "Quinta-feira", dayOfWeek: 4 },
  { label: "Sexta-feira", dayOfWeek: 5 },
  { label: "Sábado", dayOfWeek: 6 },
  { label: "Domingo", dayOfWeek: 0 },
];

interface DayState {
  dayOfWeek: number;
  label: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
  slotInterval: string;
}

interface AvailabilityEditorProps {
  barberId: string;
}

const createDayState = (label: string, dayOfWeek: number): DayState => ({
  dayOfWeek,
  label,
  enabled: false,
  startTime: "09:00",
  endTime: "18:00",
  lunchStart: "12:00",
  lunchEnd: "13:00",
  slotInterval: "30",
});

export function AvailabilityEditor({ barberId }: AvailabilityEditorProps) {
  const [days, setDays] = useState<DayState[]>(() =>
    WEEK_DAYS.map((day) => createDayState(day.label, day.dayOfWeek))
  );
  const [referenceSnapshot, setReferenceSnapshot] = useState<string>(
    JSON.stringify(days)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadAvailability = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<BarberAvailabilityResponse>(
        `/agenda/barber/${barberId}/availability`
      );
      const records: BarberAvailabilityEntry[] =
        response.data.availability ?? [];
      const mapped = WEEK_DAYS.map(({ dayOfWeek, label }) => {
        const match = records.find((entry) => entry.dayOfWeek === dayOfWeek);
        if (!match) {
          return createDayState(label, dayOfWeek);
        }
        return {
          dayOfWeek,
          label,
          enabled: true,
          startTime: match.startTime,
          endTime: match.endTime,
          lunchStart: match.lunchStart ?? "",
          lunchEnd: match.lunchEnd ?? "",
          slotInterval: String(match.slotInterval),
        } satisfies DayState;
      });
      setDays(mapped);
      setReferenceSnapshot(JSON.stringify(mapped));
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError("Não foi possível carregar a disponibilidade.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [barberId]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handleToggleDay = (dayOfWeek: number) => {
    setDays((previous) =>
      previous.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              enabled: !day.enabled,
            }
          : day
      )
    );
  };

  const updateDayField = (
    dayOfWeek: number,
    field: keyof Omit<DayState, "dayOfWeek" | "label">,
    value: string
  ) => {
    setDays((previous) =>
      previous.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    );
  };

  const validateDay = (day: DayState) => {
    if (!day.enabled) {
      return null;
    }

    if (!day.startTime || !day.endTime) {
      return `Defina início e fim para ${day.label}.`;
    }

    if (day.endTime <= day.startTime) {
      return `Hora final deve ser após o início em ${day.label}.`;
    }

    const hasLunchStart = Boolean(day.lunchStart);
    const hasLunchEnd = Boolean(day.lunchEnd);

    if (hasLunchStart !== hasLunchEnd) {
      return `Informe início e fim do almoço em ${day.label}.`;
    }

    if (hasLunchStart && hasLunchEnd && day.lunchEnd <= day.lunchStart) {
      return `Fim do almoço deve ser após o início em ${day.label}.`;
    }

    const slotIntervalNumber = Number(day.slotInterval);
    if (!Number.isFinite(slotIntervalNumber) || slotIntervalNumber <= 0) {
      return `Informe um tempo de slot válido para ${day.label}.`;
    }

    return null;
  };

  const handleSave = async () => {
    const enabledDays = days.filter((day) => day.enabled);
    if (enabledDays.length === 0) {
      setError("Escolha ao menos um dia para trabalhar.");
      return;
    }

    for (const day of enabledDays) {
      const validationError = validateDay(day);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    const payload = {
      rules: enabledDays.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        lunchStart: day.lunchStart || undefined,
        lunchEnd: day.lunchEnd || undefined,
        slotInterval: Number(day.slotInterval),
      })),
    };

    setIsSaving(true);
    setError(null);

    try {
      await apiClient.post(`/agenda/barber/${barberId}/availability`, payload);
      await loadAvailability();
      setToastMessage("Horários atualizados com sucesso");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payloadError = err.response?.data as {
          message?: string | string[];
        };
        const message = payloadError?.message;
        setError(
          Array.isArray(message)
            ? message[0]
            : (message ?? "Não foi possível salvar a disponibilidade.")
        );
      } else {
        setError("Não foi possível salvar a disponibilidade.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(days) !== referenceSnapshot;
  }, [days, referenceSnapshot]);

  return (
    <Card className="p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-blue">
            Disponibilidade
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            Horários de atendimento
          </h2>
          <p className="text-sm text-slate-500">
            Ajuste seus horários e o intervalo de almoço para cada dia.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={loadAvailability}>
          Recarregar
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">
            Carregando disponibilidade...
          </p>
        ) : (
          WEEK_DAYS.map(({ dayOfWeek }) => {
            const day = days.find((entry) => entry.dayOfWeek === dayOfWeek)!;
            return (
              <div
                key={day.dayOfWeek}
                className={`rounded-2xl border px-4 py-4 transition ${
                  day.enabled
                    ? "border-brand-yellow bg-white"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {day.label}
                    </p>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                      {day.enabled ? "Trabalhando" : "Folga"}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border border-slate-300 accent-brand-yellow"
                      checked={day.enabled}
                      onChange={() => handleToggleDay(day.dayOfWeek)}
                    />
                    Trabalha neste dia?
                  </label>
                </div>
                {day.enabled ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Início
                        </label>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(event) =>
                            updateDayField(
                              day.dayOfWeek,
                              "startTime",
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Fim
                        </label>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(event) =>
                            updateDayField(
                              day.dayOfWeek,
                              "endTime",
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Início almoço
                        </label>
                        <input
                          type="time"
                          value={day.lunchStart}
                          onChange={(event) =>
                            updateDayField(
                              day.dayOfWeek,
                              "lunchStart",
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Fim almoço
                        </label>
                        <input
                          type="time"
                          value={day.lunchEnd}
                          onChange={(event) =>
                            updateDayField(
                              day.dayOfWeek,
                              "lunchEnd",
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tempo de slot (min)
                      </label>
                      <input
                        type="number"
                        min={5}
                        step={5}
                        value={day.slotInterval}
                        onChange={(event) =>
                          updateDayField(
                            day.dayOfWeek,
                            "slotInterval",
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Marcado como folga. Nenhum horário será aberto.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          isLoading={isSaving}
        >
          Salvar disponibilidade
        </Button>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </Card>
  );
}
