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
      setFormErrors({ general: "Credenciais inválidas. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-mobile md:bg-gradient-desktop flex md:flex-row flex-col px-4 py-10">
      <div className="left-area hidden md:flex flex-1 items-center justify-center">
        <Logo size="lg" />
      </div>
      <div className="right-area flex flex-1 flex-col items-center justify-center">
        <div className="mb-10 flex w-full justify-center md:hidden">
          <Logo size="md" />
        </div>
        <Card
          variant="plain"
          className="w-full max-w-[360px] md:max-w-[480px] rounded-[32px] p-8 md:p-10 bg-[#0f1d37] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        >
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-white">
              Entrar no painel
            </h1>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              variant="auth"
              type="email"
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={formErrors.email}
              placeholder="contato@devnex.com"
            />
            <Input
              variant="auth"
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
              variant="auth"
              type="submit"
              className="w-full"
              isLoading={isSubmitting || isBootstrapping}
              disabled={isBootstrapping}
            >
              Entrar
            </Button>
            <div className="mt-4 space-y-2 text-center">
              <button
                type="button"
                className="text-white/70 text-sm hover:text-white transition"
              >
                Esqueci minha senha
              </button>

              <p className="text-white/70 text-sm">
                Não tem conta?{" "}
                <a
                  href="#"
                  className="text-[#fae101] font-semibold hover:text-[#ffea50] transition"
                >
                  Cadastre-se
                </a>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
