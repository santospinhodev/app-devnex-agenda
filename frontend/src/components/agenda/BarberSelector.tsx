"use client";

import { SanitizedBarberProfile } from "@/src/types/barbers";

interface BarberSelectorProps {
  options: SanitizedBarberProfile[];
  value: string | null;
  onChange?: (barberId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const FALLBACK_MESSAGE = "Nenhum barbeiro encontrado.";

export function BarberSelector({
  options,
  value,
  onChange,
  isLoading = false,
  error,
  onRetry,
}: BarberSelectorProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-brand-yellow bg-white/90 px-5 py-4 shadow-card">
        <p className="text-sm text-slate-500">Carregando barbeiros...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-card">
        <div className="flex flex-col gap-3 text-sm text-red-700">
          <p>{error}</p>
          {onRetry && (
            <button
              type="button"
              className="self-start rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              onClick={onRetry}
            >
              Tentar novamente
            </button>
          )}
        </div>
      </section>
    );
  }

  if (options.length === 0) {
    return (
      <section className="rounded-2xl border border-brand-yellow/40 bg-white/60 px-5 py-4 shadow-card">
        <p className="text-sm text-slate-500">{FALLBACK_MESSAGE}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-yellow bg-white px-5 py-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-blue">
            Barbeiros
          </p>
          <p className="text-sm text-slate-500">
            Selecione para visualizar a agenda.
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {options.map((option) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange?.(option.id)}
              className={`min-w-[160px] rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-brand-yellow bg-brand-yellow text-brand-blue shadow-card"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-yellow/60"
              }`}
            >
              <p className="text-sm font-semibold">
                {option.name ?? option.user.name ?? "Sem nome"}
              </p>
              <p className="text-xs text-slate-500">
                {option.user.email ?? option.user.id}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
