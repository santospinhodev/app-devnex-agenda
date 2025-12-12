"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";
import { TimelineAppointmentDetails } from "@/src/types/agenda";

interface RescheduleAppointmentModalProps {
  open: boolean;
  appointment: TimelineAppointmentDetails | null;
  onClose: () => void;
  onSuccess: () => void;
}

const extractDate = (iso: string) => iso.slice(0, 10);
const extractTime = (iso: string) => iso.slice(11, 16);

export function RescheduleAppointmentModal({
  open,
  appointment,
  onClose,
  onSuccess,
}: RescheduleAppointmentModalProps) {
  const [date, setDate] = useState(
    appointment ? extractDate(appointment.startAt) : ""
  );
  const [time, setTime] = useState(
    appointment ? extractTime(appointment.startAt) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !appointment) {
      return;
    }
    setDate(extractDate(appointment.startAt));
    setTime(extractTime(appointment.startAt));
    setError(null);
  }, [appointment, open]);

  if (!appointment) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date || !time) {
      setError("Informe data e horário");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.patch(`/agendamentos/${appointment.id}`, {
        date,
        time,
      });
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string } | undefined;
        setError(payload?.message ?? "Não foi possível reagendar.");
      } else {
        setError("Não foi possível reagendar.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar agendamento">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold text-slate-700">Data</label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Horário
          </label>
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
            required
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
