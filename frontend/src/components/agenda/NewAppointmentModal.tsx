"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";
import { FinalTimelineEntry } from "@/src/types/agenda";

interface NewAppointmentModalProps {
  open: boolean;
  slot: FinalTimelineEntry | null;
  date: Date;
  barberId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const formatDateForPayload = (value: Date) => {
  const normalized = new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate()
  );
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatHumanDate = (value: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    weekday: "long",
  })
    .format(value)
    .replace(/^./, (letter) => letter.toUpperCase());

const INITIAL_FORM = {
  customerName: "",
  customerPhone: "",
  serviceId: "",
  notes: "",
};

export function NewAppointmentModal({
  open,
  slot,
  date,
  barberId,
  onClose,
  onSuccess,
}: NewAppointmentModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [open]);

  const readableDate = useMemo(() => formatHumanDate(date), [date]);
  const slotTime = slot?.time ?? "--:--";

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slot) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post("/agendamentos", {
        barberId,
        serviceId: form.serviceId.trim(),
        date: formatDateForPayload(date),
        time: slot.time,
        customer: {
          name: form.customerName.trim(),
          phone: form.customerPhone.trim(),
        },
        notes: form.notes.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string | string[] };
        const message = payload?.message;
        if (Array.isArray(message)) {
          setError(message[0]);
        } else {
          setError(message ?? "Não foi possível criar o agendamento.");
        }
      } else {
        setError("Não foi possível criar o agendamento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !form.customerName.trim() ||
    !form.customerPhone.trim() ||
    !form.serviceId.trim() ||
    !slot;

  return (
    <Modal
      open={open && Boolean(slot)}
      onClose={onClose}
      title="Novo agendamento"
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-brand-blue px-4 py-3 text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Horário
          </p>
          <p className="text-3xl font-semibold">{slotTime}</p>
          <p className="text-sm text-white/80">{readableDate}</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Telefone do cliente"
            type="tel"
            value={form.customerPhone}
            onChange={(event) =>
              handleChange("customerPhone", event.target.value)
            }
            placeholder="(11) 99999-9999"
            required
          />
          <Input
            label="Nome do cliente"
            value={form.customerName}
            onChange={(event) =>
              handleChange("customerName", event.target.value)
            }
            placeholder="João da Silva"
            required
          />
          <Input
            label="Serviço (ID)"
            value={form.serviceId}
            onChange={(event) => handleChange("serviceId", event.target.value)}
            placeholder="Digite o ID do serviço"
            required
          />
          <p className="text-xs text-slate-500">
            Use o ID do serviço cadastrado na plataforma. Suporte a seleção
            visual chegará na próxima fase.
          </p>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Observações (opcional)
            </label>
            <textarea
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
              rows={3}
              value={form.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
              placeholder="Ex.: cliente prefere máquina 1"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              isLoading={isSubmitting}
            >
              Criar agendamento
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
