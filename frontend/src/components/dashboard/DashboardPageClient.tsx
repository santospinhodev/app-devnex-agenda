"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { DateNavigator } from "@/src/components/agenda/DateNavigator";
import { Timeline } from "@/src/components/agenda/Timeline";

const normalizeDate = (value: Date) => {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const parseDateParam = (raw: string | null): Date => {
  if (!raw) {
    return normalizeDate(new Date());
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return normalizeDate(new Date());
  }

  return normalizeDate(parsed);
};

const formatDateParam = (date: Date) =>
  normalizeDate(date).toISOString().split("T")[0];

export function DashboardPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentDateFromUrl = useMemo(
    () => parseDateParam(searchParams.get("date")),
    [searchParams]
  );

  const [selectedDate, setSelectedDate] = useState<Date>(currentDateFromUrl);

  useEffect(() => {
    setSelectedDate(currentDateFromUrl);
  }, [currentDateFromUrl]);

  useEffect(() => {
    if (!searchParams.get("date")) {
      router.replace(`/dashboard?date=${formatDateParam(selectedDate)}`, {
        scroll: false,
      });
    }
  }, [router, searchParams, selectedDate]);

  const handleDateChange = (nextDate: Date) => {
    const normalized = normalizeDate(nextDate);
    if (normalized.getTime() === selectedDate.getTime()) {
      return;
    }

    setSelectedDate(normalized);

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", formatDateParam(normalized));
    const queryString = params.toString();
    const url = queryString ? `/dashboard?${queryString}` : "/dashboard";
    router.replace(url, { scroll: false });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DateNavigator value={selectedDate} onChange={handleDateChange} />
        <Timeline date={selectedDate} />
      </div>
    </DashboardLayout>
  );
}
