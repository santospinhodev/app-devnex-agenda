"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";

const PAYMENT_METHODS = [
  { label: "Dinheiro", value: "CASH" },
  { label: "Cartão", value: "CARD" },
  { label: "Pix", value: "PIX" },
] as const;

type PaymentOption = (typeof PAYMENT_METHODS)[number]["value"];

interface FinishAppointmentModalProps {
  open: boolean;
  appointmentId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FinishAppointmentModal({
  open,
  appointmentId,
  onClose,
  onSuccess,
}: FinishAppointmentModalProps) {
  const [method, setMethod] = useState<PaymentOption>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!appointmentId) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.patch(`/agendamentos/${appointmentId}/finish`, {
        paymentMethod: method,
      });
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string } | undefined;
        setError(
          payload?.message ?? "Não foi possível finalizar o atendimento."
        );
      } else {
        setError("Não foi possível finalizar o atendimento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Finalizar atendimento">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm text-slate-600">
          Confirme o método de pagamento para registrar o financeiro.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <label className="text-sm font-semibold text-slate-700">
            Método de pagamento
          </label>
          <select
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
            value={method}
            onChange={(event) => setMethod(event.target.value as PaymentOption)}
          >
            {PAYMENT_METHODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Registrar pagamento
          </Button>
        </div>
      </form>
    </Modal>
  );
}
