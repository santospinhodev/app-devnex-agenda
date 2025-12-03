import { AppointmentStatus } from "@prisma/client";

export interface AvailableSlot {
  time: string;
}

export interface SlotsResponse {
  barberId: string;
  date: string;
  slots: AvailableSlot[];
}

export type DayEntry = FreeSlotEntry | AppointmentEntry | BlockEntry;

export interface FreeSlotEntry {
  type: "FREE_SLOT";
  time: string;
}

export interface AppointmentEntry {
  type: "APPOINTMENT";
  time: string;
  endTime: string;
  appointmentId: string;
  status: AppointmentStatus;
  serviceId: string;
  customerId: string;
}

export interface BlockEntry {
  type: "BLOCK";
  time: string;
  endTime: string;
  reason: "LUNCH";
}

export interface DayViewResponse {
  barberId: string;
  date: string;
  entries: DayEntry[];
}

export interface WeekDayView {
  date: string;
  entries: DayEntry[];
}

export interface WeekViewResponse {
  barberId: string;
  startDate: string;
  endDate: string;
  days: WeekDayView[];
}
