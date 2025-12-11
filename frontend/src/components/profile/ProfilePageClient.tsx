"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/contexts/AuthContext";
import { apiClient } from "@/src/services/apiClient";
import { AvailabilityEditor } from "@/src/components/profile/AvailabilityEditor";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
};

export function ProfilePageClient() {
  const { user, signOut } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email,
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      (form.name ?? "") !== (user.name ?? "") ||
      form.email !== user.email ||
      (form.phone ?? "") !== (user.phone ?? "")
    );
  }, [form, user]);

  if (!user) {
    return null;
  }

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiClient.patch(`/users/${user.id}`, {
        name: form.name.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      setSuccessMessage("Dados atualizados com sucesso!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string | string[] };
        if (Array.isArray(payload?.message)) {
          setError(payload?.message[0] ?? "Não foi possível salvar.");
        } else {
          setError(payload?.message ?? "Não foi possível salvar.");
        }
      } else {
        setError("Não foi possível salvar.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-blue">
                Perfil
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Seus dados
              </h1>
            </div>
            <Button type="button" variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nome"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Seu nome"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="nome@email.com"
              required
            />
            <Input
              label="Telefone"
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder="(11) 99999-9999"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && (
              <p className="text-sm text-green-600">{successMessage}</p>
            )}
            <div className="flex items-center justify-end">
              <Button type="submit" disabled={!isDirty} isLoading={isSaving}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </Card>
        {user.barberProfile ? (
          <AvailabilityEditor barberId={user.barberProfile.id} />
        ) : (
          <Card className="p-6 shadow-card">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-blue">
                Disponibilidade
              </p>
              <p className="text-sm text-slate-600">
                Vincule um perfil de barbeiro para configurar horários.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
