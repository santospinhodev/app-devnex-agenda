"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";

const ROLE_OPTIONS = [
  { label: "Barbeiro", value: "BARBER", endpoint: "/users/barbers" },
  {
    label: "Recepcionista",
    value: "RECEPTIONIST",
    endpoint: "/users/receptionists",
  },
] as const;

interface NewTeamMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  role: ROLE_OPTIONS[0].value as (typeof ROLE_OPTIONS)[number]["value"],
};

export function NewTeamMemberModal({
  open,
  onClose,
  onSuccess,
}: NewTeamMemberModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [open]);

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedRole = ROLE_OPTIONS.find((role) => role.value === form.role);
    if (!selectedRole) {
      setError("Selecione um cargo válido.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post(selectedRole.endpoint, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string | string[] };
        const message = payload?.message;
        setError(
          Array.isArray(message)
            ? message[0]
            : (message ?? "Não foi possível criar o colaborador.")
        );
      } else {
        setError("Não foi possível criar o colaborador.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !form.name.trim() ||
    !form.email.trim() ||
    !form.password.trim() ||
    form.password.trim().length < 8;

  return (
    <Modal open={open} onClose={onClose} title="Novo colaborador">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Nome"
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="Nome completo"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => handleChange("email", event.target.value)}
          placeholder="contato@exemplo.com"
          required
        />
        <Input
          label="Senha inicial"
          type="password"
          value={form.password}
          minLength={8}
          onChange={(event) => handleChange("password", event.target.value)}
          placeholder="Mínimo de 8 caracteres"
          required
        />
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Cargo</label>
          <select
            value={form.role}
            onChange={(event) => handleChange("role", event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
            Criar colaborador
          </Button>
        </div>
      </form>
    </Modal>
  );
}
