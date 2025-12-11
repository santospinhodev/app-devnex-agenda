"use client";

import { useMemo } from "react";
import { Button } from "@/src/components/ui/Button";

interface DateNavigatorProps {
  value: Date;
  onChange?: (date: Date) => void;
}

const formatLabel = (value: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );

  const shortFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  const formattedDate = shortFormatter
    .format(target)
    .replace(".", "")
    .replace(/\s+/g, " ")
    .trim();

  if (diffDays === 0) {
    return `Hoje, ${formattedDate}`;
  }
  if (diffDays === 1) {
    return `Amanhã, ${formattedDate}`;
  }
  if (diffDays === -1) {
    return `Ontem, ${formattedDate}`;
  }

  return formattedDate;
};

export function DateNavigator({ value, onChange }: DateNavigatorProps) {
  const label = useMemo(() => formatLabel(value), [value]);

  const updateDate = (delta: number) => {
    const next = new Date(value);
    next.setDate(next.getDate() + delta);
    next.setHours(0, 0, 0, 0);
    onChange?.(next);
  };

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-yellow bg-brand-blue px-5 py-4 shadow-card">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white">
          Agenda
        </p>
        <p className="text-2xl font-semibold text-white">{label}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          aria-label="Dia anterior"
          onClick={() => updateDate(-1)}
        >
          &lt;
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label="Dia seguinte"
          onClick={() => updateDate(1)}
        >
          &gt;
        </Button>
      </div>
    </section>
  );
}
