"use client";

import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale/pt-BR";

export interface CalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  fromYear?: number;
  toYear?: number;
}

export function Calendar({
  selected,
  onSelect,
  fromYear = selected.getFullYear() - 1,
  toYear = selected.getFullYear() + 1,
}: CalendarProps) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={(date) => {
        if (date) {
          onSelect(date);
        }
      }}
      captionLayout="dropdown"
      weekStartsOn={1}
      locale={ptBR}
      defaultMonth={selected}
      fromYear={fromYear}
      toYear={toYear}
      showOutsideDays
      fixedWeeks
      className="rdp-responsive"
    />
  );
}
