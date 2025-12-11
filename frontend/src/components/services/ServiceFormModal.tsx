"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";
import { normalizeCurrencyInput } from "@/src/utils/formatters";

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM = {
  name: "",
  price: "",
  durationMin: "30",
  commissionPercentage: "",
  description: "",
};

export function ServiceFormModal({
  open,
  onClose,
  onSuccess,
}: ServiceFormModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitizedPrice = normalizeCurrencyInput(form.price);
    if (!sanitizedPrice) {
      setError("Informe um preço válido");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post("/services", {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: sanitizedPrice,
        durationMin: Number(form.durationMin) || 30,
        commissionPercentage: form.commissionPercentage
          ? Number(form.commissionPercentage)
          : undefined,
      });
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string | string[] };
        const message = payload?.message;
        setError(
          Array.isArray(message)
            ? message[0]
            : (message ?? "Não foi possível salvar o serviço.")
        );
      } else {
        setError("Não foi possível salvar o serviço.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !form.name.trim() || !form.price.trim();

  return (
    <Modal open={open} onClose={onClose} title="Novo serviço">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Nome"
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="Corte executivo"
          required
        />
        <Input
          label="Preço"
          value={form.price}
          onChange={(event) => handleChange("price", event.target.value)}
          placeholder="50,00"
          inputMode="decimal"
          required
        />
        <Input
          label="Duração (minutos)"
          type="number"
          min={5}
          step={5}
          value={form.durationMin}
          onChange={(event) => handleChange("durationMin", event.target.value)}
          placeholder="30"
          required
        />
        <Input
          label="Comissão (%)"
          type="number"
          min={0}
          max={100}
          step={1}
          value={form.commissionPercentage}
          onChange={(event) =>
            handleChange("commissionPercentage", event.target.value)
          }
          placeholder="50"
        />
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Descrição (opcional)
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
            placeholder="Detalhes rápidos do serviço"
          />
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
            Salvar serviço
          </Button>
        </div>
      </form>
    </Modal>
  );
}
