"use client";

import { useState } from "react";
import axios from "axios";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { FinalTimelineEntry } from "@/src/types/agenda";
import { apiClient } from "@/src/services/apiClient";
import { formatCurrency } from "@/src/utils/formatters";

interface AppointmentDetailsModalProps {
  open: boolean;
  entry: FinalTimelineEntry | null;
  onClose: () => void;
  onStatusUpdated: () => void;
  onRequestFinish: (appointmentId: string) => void;
  onRequestEdit: (entry: FinalTimelineEntry) => void;
}

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  DONE: "bg-slate-200 text-slate-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DONE: "Concluído",
  CANCELLED: "Cancelado",
};

const formatDateLabel = (iso: string) => {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(parsed)
    .replace(/^./, (letter) => letter.toUpperCase());
};

export function AppointmentDetailsModal({
  open,
  entry,
  onClose,
  onStatusUpdated,
  onRequestFinish,
  onRequestEdit,
}: AppointmentDetailsModalProps) {
  const appointment = entry?.appointment;
  const [actionError, setActionError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!appointment) {
    return null;
  }

  const statusBadge =
    STATUS_BADGES[appointment.status] ?? "bg-slate-100 text-slate-700";
  const formattedPrice = formatCurrency(appointment.service.price);
  const scheduleLabel = formatDateLabel(appointment.startAt);
  const statusLabel =
    STATUS_LABELS[appointment.status] ?? "Status desconhecido";

  const handleConfirm = async () => {
    setIsConfirming(true);
    setActionError(null);
    try {
      await apiClient.patch(`/agendamentos/${appointment.id}/status`, {
        status: "CONFIRMED",
      });
      onStatusUpdated();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string } | undefined;
        setActionError(payload?.message ?? "Não foi possível confirmar.");
      } else {
        setActionError("Não foi possível confirmar.");
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    setActionError(null);
    try {
      await apiClient.patch(`/agendamentos/${appointment.id}/cancelar`);
      onStatusUpdated();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string } | undefined;
        setActionError(payload?.message ?? "Não foi possível cancelar.");
      } else {
        setActionError("Não foi possível cancelar.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const canConfirm = appointment.status === "PENDING";
  const canFinish = appointment.status === "CONFIRMED";
  const canCancel =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED";

  return (
    <Modal open={open} onClose={onClose} title="Detalhes do agendamento">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Status
            </p>
            <p className="text-base font-semibold text-slate-900">
              {appointment.service.name}
            </p>
            <p className="text-sm text-slate-500">{scheduleLabel}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Cliente
          </p>
          <p className="text-base font-semibold text-slate-900">
            {appointment.customer.name ?? "Cliente sem nome"}
          </p>
          {appointment.customer.phone && (
            <p className="text-sm text-slate-500">
              {appointment.customer.phone}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Serviço e valor
          </p>
          <p className="text-base font-semibold text-slate-900">
            {appointment.service.name} • {formattedPrice}
          </p>
          <p className="text-sm text-slate-500">
            Duração: {appointment.service.durationMin} minutos
          </p>
        </div>

        {appointment.notes && (
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Observações
            </p>
            <p className="text-sm text-slate-700">{appointment.notes}</p>
          </div>
        )}

        {actionError && <p className="text-sm text-rose-600">{actionError}</p>}

        <div className="flex flex-wrap gap-3">
          {canConfirm && (
            <Button
              type="button"
              onClick={handleConfirm}
              isLoading={isConfirming}
            >
              ✅ Confirmar
            </Button>
          )}
          {canFinish && (
            <Button
              type="button"
              onClick={() => onRequestFinish(appointment.id)}
              variant="secondary"
            >
              💰 Finalizar
            </Button>
          )}
          {canCancel && (
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              isLoading={isCancelling}
            >
              ❌ Cancelar
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => onRequestEdit(entry)}
          >
            ✏️ Editar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
