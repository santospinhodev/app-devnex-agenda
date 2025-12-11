"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { DateNavigator } from "@/src/components/agenda/DateNavigator";
import { Timeline } from "@/src/components/agenda/Timeline";
import { BarberSelector } from "@/src/components/agenda/BarberSelector";
import { useAuth } from "@/src/contexts/AuthContext";
import { apiClient } from "@/src/services/apiClient";
import { SanitizedBarberProfile } from "@/src/types/barbers";
import { FinalTimelineEntry } from "@/src/types/agenda";
import { NewAppointmentModal } from "@/src/components/agenda/NewAppointmentModal";
import { Toast } from "@/src/components/ui/Toast";

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
  const { user } = useAuth();

  const paramsSnapshot = searchParams.toString();
  const applyRouteParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(paramsSnapshot);
      mutator(params);
      const queryString = params.toString();
      const url = queryString ? `/dashboard?${queryString}` : "/dashboard";
      router.replace(url, { scroll: false });
    },
    [router, paramsSnapshot]
  );

  const currentDateFromUrl = useMemo(
    () => parseDateParam(searchParams.get("date")),
    [searchParams]
  );
  const barberFromUrl = searchParams.get("barber");

  const canSwitchBarber = useMemo(
    () =>
      Boolean(
        user?.permissions?.some((permission) =>
          ["ADMIN", "RECEPTIONIST"].includes(permission)
        )
      ),
    [user]
  );

  const [selectedDate, setSelectedDate] = useState<Date>(currentDateFromUrl);
  const [barberOptions, setBarberOptions] = useState<SanitizedBarberProfile[]>(
    []
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [barbersLoading, setBarbersLoading] = useState(false);
  const [barbersError, setBarbersError] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<FinalTimelineEntry | null>(
    null
  );
  const [timelineRefreshKey, setTimelineRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(currentDateFromUrl);
  }, [currentDateFromUrl]);

  useEffect(() => {
    if (!searchParams.get("date")) {
      applyRouteParams((params) =>
        params.set("date", formatDateParam(currentDateFromUrl))
      );
    }
  }, [applyRouteParams, currentDateFromUrl, searchParams]);

  const loadBarbers = useCallback(async () => {
    if (!canSwitchBarber) {
      setBarberOptions([]);
      return;
    }

    setBarbersLoading(true);
    setBarbersError(null);
    try {
      const response =
        await apiClient.get<SanitizedBarberProfile[]>("/users/barbers");
      setBarberOptions(response.data);
    } catch (error) {
      setBarbersError("Não foi possível carregar os barbeiros.");
    } finally {
      setBarbersLoading(false);
    }
  }, [canSwitchBarber]);

  useEffect(() => {
    loadBarbers();
  }, [loadBarbers]);

  useEffect(() => {
    if (canSwitchBarber) {
      const optionExists = (id: string | null): boolean =>
        Boolean(id && barberOptions.some((option) => option.id === id));

      if (barberFromUrl && optionExists(barberFromUrl)) {
        if (selectedBarberId !== barberFromUrl) {
          setSelectedBarberId(barberFromUrl);
        }
        return;
      }

      if (barberOptions.length > 0 && !optionExists(selectedBarberId)) {
        const fallbackId = barberOptions[0].id;
        setSelectedBarberId(fallbackId);
        if (barberFromUrl !== fallbackId) {
          applyRouteParams((params) => params.set("barber", fallbackId));
        }
      }
      return;
    }

    const ownProfileId = user?.barberProfile?.id ?? null;
    if (ownProfileId !== selectedBarberId) {
      setSelectedBarberId(ownProfileId);
    }
    if (barberFromUrl) {
      applyRouteParams((params) => {
        params.delete("barber");
        if (!params.has("date")) {
          params.set("date", formatDateParam(selectedDate));
        }
      });
    }
  }, [
    applyRouteParams,
    barberFromUrl,
    barberOptions,
    canSwitchBarber,
    selectedBarberId,
    selectedDate,
    user,
  ]);

  const handleDateChange = (nextDate: Date) => {
    const normalized = normalizeDate(nextDate);
    if (normalized.getTime() === selectedDate.getTime()) {
      return;
    }

    setSelectedDate(normalized);
    applyRouteParams((params) =>
      params.set("date", formatDateParam(normalized))
    );
  };

  const handleBarberChange = (nextBarberId: string) => {
    if (selectedBarberId === nextBarberId) {
      return;
    }
    setSelectedBarberId(nextBarberId);
    setBookingSlot(null);
    applyRouteParams((params) => params.set("barber", nextBarberId));
  };

  const handleSelectFreeSlot = (slot: FinalTimelineEntry) => {
    setBookingSlot(slot);
  };

  const handleModalClose = () => {
    setBookingSlot(null);
  };

  const handleAppointmentSuccess = () => {
    setBookingSlot(null);
    setTimelineRefreshKey((prev) => prev + 1);
    setToastMessage("Agendamento criado com sucesso!");
  };

  const handleToastDismiss = () => setToastMessage(null);

  useEffect(() => {
    setBookingSlot(null);
  }, [selectedBarberId]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-4">
          <DateNavigator value={selectedDate} onChange={handleDateChange} />
          {canSwitchBarber && (
            <BarberSelector
              options={barberOptions}
              value={selectedBarberId}
              onChange={handleBarberChange}
              isLoading={barbersLoading}
              error={barbersError}
              onRetry={loadBarbers}
            />
          )}
        </div>
        <Timeline
          date={selectedDate}
          barberId={selectedBarberId}
          onSelectFreeSlot={handleSelectFreeSlot}
          refreshKey={timelineRefreshKey}
        />
      </div>
      {selectedBarberId && (
        <NewAppointmentModal
          open={Boolean(bookingSlot)}
          slot={bookingSlot}
          date={selectedDate}
          barberId={selectedBarberId}
          onClose={handleModalClose}
          onSuccess={handleAppointmentSuccess}
        />
      )}
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={handleToastDismiss} />
      )}
    </DashboardLayout>
  );
}
