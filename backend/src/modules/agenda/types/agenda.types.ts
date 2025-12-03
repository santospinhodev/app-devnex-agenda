import { BlockType } from "@prisma/client";

export interface AvailableSlot {
  time: string;
}

export interface SlotsResponse {
  barberId: string;
  date: string;
  slots: AvailableSlot[];
}

export type SlotStatus = "FREE" | "BLOCKED" | "UNAVAILABLE";

export interface SlotEntry {
  time: string;
  status: SlotStatus;
  block?: {
    id?: string;
    type: BlockType;
    note?: string | null;
    source: "BARBER_BLOCK" | "LUNCH";
  };
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
