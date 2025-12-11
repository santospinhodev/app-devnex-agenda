"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar } from "@/src/components/ui/Calendar";

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
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (!popoverRef.current) {
        return;
      }
      if (!popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keyup", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keyup", handleKey);
    };
  }, [isOpen]);

  const handleSelectDate = (nextDate: Date) => {
    const normalized = new Date(nextDate);
    normalized.setHours(0, 0, 0, 0);
    onChange?.(normalized);
    setIsOpen(false);
  };

  return (
    <section className="relative rounded-2xl border border-brand-yellow bg-brand-blue px-5 py-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white">
            Agenda
          </p>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="mt-1 flex items-center gap-2 text-left text-2xl font-semibold text-white"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
          >
            <CalendarDays className="h-5 w-5 text-brand-yellow" aria-hidden />
            <span>{label}</span>
            <ChevronDown className="h-4 w-4 text-white/80" aria-hidden />
          </button>
        </div>
        <p className="text-sm text-white/80">
          Navegue pelos dias para ajustar a timeline.
        </p>
      </div>
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 right-0 top-full z-30 mt-3 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:w-auto"
        >
          <Calendar selected={value} onSelect={handleSelectDate} />
        </div>
      )}
    </section>
  );
}
