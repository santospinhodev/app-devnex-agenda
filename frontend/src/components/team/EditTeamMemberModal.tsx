"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { apiClient } from "@/src/services/apiClient";
import {
  TEAM_ROLE_ENDPOINTS,
  TeamMember,
} from "@/src/components/team/team.types";

interface EditTeamMemberModalProps {
  open: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export function EditTeamMemberModal({
  open,
  member,
  onClose,
  onSuccess,
}: EditTeamMemberModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && member) {
      setForm({
        name: member.name,
        email: member.email,
        phone: member.phone ?? "",
        password: "",
      });
      setError(null);
    }

    if (!open) {
      setForm(INITIAL_FORM);
      setIsSubmitting(false);
      setError(null);
    }
  }, [member, open]);

  const trimmedName = form.name.trim();
  const trimmedEmail = form.email.trim();
  const trimmedPhone = form.phone.trim();
  const passwordValue = form.password.trim();
  const isPasswordFilled = passwordValue.length > 0;
  const isPasswordValid = !isPasswordFilled || passwordValue.length >= 8;

  const hasChanges = useMemo(() => {
    if (!member) {
      return false;
    }

    return (
      trimmedName !== member.name ||
      trimmedEmail !== member.email ||
      trimmedPhone !== (member.phone ?? "") ||
      isPasswordFilled
    );
  }, [member, isPasswordFilled, trimmedEmail, trimmedName, trimmedPhone]);

  const isSubmitDisabled =
    !member || !hasChanges || !isPasswordValid || isSubmitting;

  const parseErrorMessage = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const payload = err.response?.data as { message?: string | string[] };
      const message = payload?.message;
      if (Array.isArray(message)) {
        return message[0];
      }
      if (typeof message === "string") {
        return message;
      }
    }
    return "Não foi possível atualizar o colaborador.";
  };

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!member) {
      return;
    }

    const payload: Record<string, string> = {};

    if (trimmedName && trimmedName !== member.name) {
      payload.name = trimmedName;
    }

    if (trimmedEmail && trimmedEmail !== member.email) {
      payload.email = trimmedEmail;
    }

    if (trimmedPhone !== (member.phone ?? "")) {
      payload.phone = trimmedPhone;
    }

    if (isPasswordFilled) {
      payload.password = form.password;
    }

    if (Object.keys(payload).length === 0) {
      setError("Nenhuma alteração detectada.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.patch(
        `${TEAM_ROLE_ENDPOINTS[member.role]}/${member.id}`,
        payload
      );
      onSuccess();
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar colaborador">
      {member ? (
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
            label="Telefone"
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="(11) 99999-0000"
          />
          <Input
            label="Nova senha (opcional)"
            type="password"
            value={form.password}
            minLength={8}
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="Mínimo de 8 caracteres"
            error={
              isPasswordFilled && !isPasswordValid
                ? "A senha precisa ter pelo menos 8 caracteres."
                : undefined
            }
          />
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
              Salvar alterações
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-500">
          Selecione um colaborador para editar.
        </p>
      )}
    </Modal>
  );
}
