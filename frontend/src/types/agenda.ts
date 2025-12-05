export type TimelineSlotStatus =
  | "FREE"
  | "BLOCKED"
  | "UNAVAILABLE"
  | "APPOINTMENT";

export interface TimelineAppointmentDetails {
  id: string;
  status: string;
  startAt: string;
  endAt: string;
  notes: string | null;
  service: {
    id: string;
    name: string;
    durationMin: number;
    price: string;
  };
  customer: {
    id: string;
    name: string | null;
    phone: string | null;
  };
}

export interface FinalTimelineEntry {
  time: string;
  status: TimelineSlotStatus;
  type?: string | null;
  source?: "BARBER_BLOCK" | "LUNCH";
  appointment?: TimelineAppointmentDetails;
}
