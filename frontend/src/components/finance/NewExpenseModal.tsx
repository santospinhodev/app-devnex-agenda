"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";
import { normalizeCurrencyInput } from "@/src/utils/formatters";

type PaymentMethodOption = "CASH" | "CARD" | "PIX";

interface NewExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHOD_OPTIONS: Array<{
  label: string;
  value: PaymentMethodOption;
}> = [
  { label: "Dinheiro", value: "CASH" },
  { label: "Cartão", value: "CARD" },
  { label: "Pix", value: "PIX" },
];

const INITIAL_FORM = {
  amount: "",
  description: "",
  paymentMethod: "CASH" as PaymentMethodOption,
};

export function NewExpenseModal({
  open,
  onClose,
  onSuccess,
}: NewExpenseModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setIsSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitizedAmount = normalizeCurrencyInput(form.amount);
    if (!sanitizedAmount) {
      setError("Informe um valor válido");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post("/finance/transaction", {
        type: "EXPENSE",
        paymentMethod: form.paymentMethod,
        amount: sanitizedAmount,
        description: form.description.trim(),
      });
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string | string[] };
        const message = payload?.message;
        setError(
          Array.isArray(message)
            ? message[0]
            : (message ?? "Não foi possível lançar a despesa.")
        );
      } else {
        setError("Não foi possível lançar a despesa.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !form.amount.trim() || !form.description.trim();

  return (
    <Modal open={open} onClose={onClose} title="Lançar despesa">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Valor"
          value={form.amount}
          onChange={(event) => handleChange("amount", event.target.value)}
          placeholder="120,00"
          inputMode="decimal"
          required
        />
        <Input
          label="Descrição"
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
          placeholder="Compra de produtos"
          required
        />
        <div>
          <label className="text-sm font-medium text-slate-700">
            Forma de pagamento
          </label>
          <div className="mt-1 rounded-2xl border border-slate-200 bg-white px-3 py-1 focus-within:border-brand-yellow focus-within:ring-2 focus-within:ring-brand-yellow/30">
            <select
              className="h-11 w-full bg-transparent text-sm text-slate-900 outline-none"
              value={form.paymentMethod}
              onChange={(event) =>
                handleChange(
                  "paymentMethod",
                  event.target.value as PaymentMethodOption
                )
              }
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            isLoading={isSubmitting}
          >
            Registrar despesa
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          Despesas lançadas aqui impactam o saldo líquido do dia.
        </p>
      </form>
    </Modal>
  );
}
