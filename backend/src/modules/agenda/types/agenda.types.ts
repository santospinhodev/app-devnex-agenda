import { AppointmentStatus, BlockType } from "@prisma/client";

export interface AvailableSlot {
  time: string;
}

export interface SlotsResponse {
  barberId: string;
  date: string;
  slots: AvailableSlot[];
}

export type SlotStatus = "FREE" | "BLOCKED" | "UNAVAILABLE" | "APPOINTMENT";

export interface SlotAppointmentDetails {
  id: string;
  status: AppointmentStatus;
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

export interface SlotEntry {
  time: string;
  status: SlotStatus;
  block?: {
    id?: string;
    type: BlockType;
    note?: string | null;
    source: "BARBER_BLOCK" | "LUNCH";
  };
  appointment?: SlotAppointmentDetails;
}

export interface FinalTimelineEntry {
  time: string;
  status: SlotStatus;
  type?: BlockType;
  source?: "BARBER_BLOCK" | "LUNCH";
  appointment?: SlotAppointmentDetails;
}

export interface FinalWeekDay {
  date: string;
  slots: FinalTimelineEntry[];
}

export interface DayViewResponse {
  barberId: string;
  date: string;
  entries: SlotEntry[];
}

export interface WeekDayView {
  date: string;
  entries: SlotEntry[];
}

export interface WeekViewResponse {
  barberId: string;
  startDate: string;
  endDate: string;
  days: WeekDayView[];
}
