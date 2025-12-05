"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card } from "@/src/components/ui/Card";
import { Logo } from "@/src/components/Logo";

export default function LoginPage() {
  const { signIn, isBootstrapping } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Informe seu email";
    }
    if (!password.trim()) {
      errors.password = "Informe sua senha";
    }
    setFormErrors((prev) => ({ ...prev, ...errors, general: undefined }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      setFormErrors({ general: "Credenciais invalidas. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 space-y-2 text-center">
          <Logo size="md" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Acesse sua conta
            </h1>
            <p className="text-sm text-slate-500">
              Controle sua agenda e financeiro em um só lugar.
            </p>
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={formErrors.email}
            placeholder="contato@devnex.com"
          />
          <Input
            type="password"
            label="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={formErrors.password}
            placeholder="********"
          />
          {formErrors.general && (
            <p className="text-sm text-red-500" role="alert">
              {formErrors.general}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting || isBootstrapping}
            disabled={isBootstrapping}
          >
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}
