import { BadRequestException, Injectable } from "@nestjs/common";
import { BlockType } from "@prisma/client";
import { AppointmentWithMeta } from "../../appointments/types/appointment.types";
import { AppointmentsService } from "../../appointments/services/appointments.service";
import { BarberAvailabilityRecord } from "../barber-availability/repositories/barber-availability.repository";
import {
  AuthorizedBarberProfile,
  BarberAvailabilityService,
  RequestActor,
} from "../barber-availability/services/barber-availability.service";
import { BarberBlockRecord } from "../barber-block/repositories/barber-block.repository";
import { BarberBlockService } from "../barber-block/services/barber-block.service";
import {
  DayViewResponse,
  SlotEntry,
  SlotsResponse,
  WeekDayView,
  WeekViewResponse,
} from "../types/agenda.types";
import { buildSlotAppointmentDetails } from "../utils/appointment.utils";
import { minutesToTime, timeStringToMinutes } from "../utils/time.utils";

interface AppointmentWindow {
  appointment: AppointmentWithMeta;
  startMinutes: number;
  endMinutes: number;
}

interface BlockWindow {
  id?: string;
  type: BlockType;
  note?: string | null;
  startMinutes: number;
  endMinutes: number;
  source: "BARBER_BLOCK" | "LUNCH";
}

@Injectable()
export class AgendaService {
  private static readonly MINUTES_PER_DAY = 24 * 60;
  private static readonly DEFAULT_TIMELINE_INTERVAL = 30;

  constructor(
    private readonly barberAvailabilityService: BarberAvailabilityService,
    private readonly barberBlockService: BarberBlockService,
    private readonly appointmentsService: AppointmentsService
  ) {}

  async getAvailableSlots(
    actor: RequestActor,
    barberId: string,
    dateStr: string
  ): Promise<SlotsResponse> {
    const referenceDate = this.parseDate(dateStr);
    const { profile } =
      await this.barberAvailabilityService.getAuthorizedBarberProfile(
        actor,
        barberId,
        "view"
      );

    const dayOfWeek = this.getDayOfWeek(referenceDate);
    const availability =
      await this.barberAvailabilityService.findAvailabilityForDay(
        profile.id,
        dayOfWeek
      );

    if (!availability) {
      return { barberId, date: dateStr, slots: [] };
    }

    const { startOfDay, endOfDay } = this.getDayRange(referenceDate);
    const appointments =
      await this.appointmentsService.getBarberAppointmentsInRange(
        profile,
        startOfDay,
        endOfDay
      );
    const mappedAppointments = this.mapAppointments(appointments, startOfDay);
    const blockRecords = await this.barberBlockService.findBlocksForRange(
      profile.id,
      startOfDay,
      endOfDay
    );
    const blockWindows = this.mapBlocksToWindows(blockRecords, startOfDay);
    const lunchWindow = this.createLunchBlockWindow(availability);
    if (lunchWindow) {
      blockWindows.push(lunchWindow);
    }

    const slots = this.calculateFreeSlots(
      availability,
      mappedAppointments,
      blockWindows
    );

    return {
      barberId,
      date: dateStr,
      slots: slots.map((time) => ({ time })),
    };
  }

  async getDayView(
    actor: RequestActor,
    barberId: string,
    dateStr: string
  ): Promise<DayViewResponse> {
    const referenceDate = this.parseDate(dateStr);
    const { profile } =
      await this.barberAvailabilityService.getAuthorizedBarberProfile(
        actor,
        barberId,
        "view"
      );

    const dayOfWeek = this.getDayOfWeek(referenceDate);
    const availability =
      await this.barberAvailabilityService.findAvailabilityForDay(
        profile.id,
        dayOfWeek
      );
    const { startOfDay, endOfDay } = this.getDayRange(referenceDate);
    const blockRecords = await this.barberBlockService.findBlocksForRange(
      profile.id,
      startOfDay,
      endOfDay
    );
    const blockWindows = this.mapBlocksToWindows(blockRecords, startOfDay);
    const lunchWindow = this.createLunchBlockWindow(availability);
    if (lunchWindow) {
      blockWindows.push(lunchWindow);
    }

    const appointments =
      await this.appointmentsService.getBarberAppointmentsInRange(
        profile,
        startOfDay,
        endOfDay
      );
    const mappedAppointments = this.mapAppointments(appointments, startOfDay);

    const entries = this.buildDayEntries(
      availability,
      blockWindows,
      mappedAppointments
    );

    return {
      barberId,
      date: dateStr,
      entries,
    };
  }

  async getWeekView(
    actor: RequestActor,
    barberId: string,
    startStr: string
  ): Promise<WeekViewResponse> {
    const startDate = this.parseDate(startStr);
    const { profile } =
      await this.barberAvailabilityService.getAuthorizedBarberProfile(
        actor,
        barberId,
        "view"
      );

    const weekDays = this.buildWeek(startDate);
    const overallStart = weekDays[0].startOfDay;
    const overallEnd = this.addDays(overallStart, 7);

    const availabilityMap =
      await this.barberAvailabilityService.getAvailabilityMap(profile.id);
    const weeklyBlocks = await this.barberBlockService.findBlocksForRange(
      profile.id,
      overallStart,
      overallEnd
    );
    const weeklyAppointments =
      await this.appointmentsService.getBarberAppointmentsInRange(
        profile,
        overallStart,
        overallEnd
      );

    const days: WeekDayView[] = weekDays.map((day) => {
      const dayEnd = this.addDays(day.startOfDay, 1);
      const availability = availabilityMap.get(day.dayOfWeek) ?? null;
      const dayBlocks = weeklyBlocks.filter(
        (block) => block.startTime < dayEnd && block.endTime > day.startOfDay
      );
      const blockWindows = this.mapBlocksToWindows(dayBlocks, day.startOfDay);
      const lunchWindow = this.createLunchBlockWindow(availability);
      if (lunchWindow) {
        blockWindows.push(lunchWindow);
      }

      const dayAppointments = weeklyAppointments.filter(
        (appointment) =>
          appointment.startAt < dayEnd && appointment.endAt > day.startOfDay
      );
      const mappedAppointments = this.mapAppointments(
        dayAppointments,
        day.startOfDay
      );

      const entries = this.buildDayEntries(
        availability,
        blockWindows,
        mappedAppointments
      );

      return {
        date: day.dateKey,
        entries,
      };
    });

    const endDate = this.formatDate(this.addDays(startDate, 6));

    return {
      barberId,
      startDate: startStr,
      endDate,
      days,
    };
  }

  private buildDayEntries(
    availability: BarberAvailabilityRecord | null,
    blockWindows: BlockWindow[],
    appointments: AppointmentWindow[]
  ): SlotEntry[] {
    const interval =
      availability?.slotInterval ?? AgendaService.DEFAULT_TIMELINE_INTERVAL;
    const entries: SlotEntry[] = [];
    const availabilityStart = availability
      ? timeStringToMinutes(availability.startTime)
      : null;
    const availabilityEnd = availability
      ? timeStringToMinutes(availability.endTime)
      : null;

    if (interval <= 0) {
      return entries;
    }

    for (
      let current = 0;
      current < AgendaService.MINUTES_PER_DAY;
      current += interval
    ) {
      const slotEnd = Math.min(
        AgendaService.MINUTES_PER_DAY,
        current + interval
      );
      const inAvailability =
        availabilityStart !== null &&
        availabilityEnd !== null &&
        current >= availabilityStart &&
        slotEnd <= availabilityEnd;

      if (!inAvailability) {
        entries.push({ time: minutesToTime(current), status: "UNAVAILABLE" });
        continue;
      }

      const overlappingAppointment = this.findAppointmentOverlap(
        appointments,
        current,
        slotEnd
      );
      if (overlappingAppointment) {
        entries.push({
          time: minutesToTime(current),
          status: "APPOINTMENT",
          appointment: buildSlotAppointmentDetails(
            overlappingAppointment.appointment
          ),
        });
        continue;
      }

      const overlappingBlock = this.findBlockOverlap(
        blockWindows,
        current,
        slotEnd
      );
      if (overlappingBlock) {
        entries.push({
          time: minutesToTime(current),
          status: "BLOCKED",
          block: {
            id: overlappingBlock.id,
            type: overlappingBlock.type,
            note: overlappingBlock.note ?? null,
            source: overlappingBlock.source,
          },
        });
      } else {
        entries.push({ time: minutesToTime(current), status: "FREE" });
      }
    }

    return entries;
  }

  private calculateFreeSlots(
    availability: BarberAvailabilityRecord,
    appointments: AppointmentWindow[],
    blockWindows: BlockWindow[]
  ): string[] {
    const startMinutes = timeStringToMinutes(availability.startTime);
    const endMinutes = timeStringToMinutes(availability.endTime);
    const interval = availability.slotInterval;

    const freeSlots: string[] = [];

    for (
      let current = startMinutes;
      current + interval <= endMinutes;
      current += interval
    ) {
      const slotEnd = current + interval;

      const overlapsBlock =
        this.findBlockOverlap(blockWindows, current, slotEnd) !== null;
      if (overlapsBlock) {
        continue;
      }

      const overlapsAppointment = appointments.some(
        (appointment) =>
          current < appointment.endMinutes && slotEnd > appointment.startMinutes
      );

      if (!overlapsAppointment) {
        freeSlots.push(minutesToTime(current));
      }
    }

    return freeSlots;
  }

  private mapAppointments(
    appointments: AppointmentWithMeta[],
    dayStart: Date
  ): AppointmentWindow[] {
    return appointments.map((appointment) => {
      const rawStart = this.diffInMinutes(appointment.startAt, dayStart);
      const rawEnd = this.diffInMinutes(appointment.endAt, dayStart);
      const startMinutes = Math.max(0, rawStart);
      const endMinutes = Math.max(startMinutes, rawEnd);

      return {
        appointment,
        startMinutes,
        endMinutes,
      };
    });
  }

  private mapBlocksToWindows(
    blocks: BarberBlockRecord[],
    dayStart: Date
  ): BlockWindow[] {
    const windows: BlockWindow[] = [];

    for (const block of blocks) {
      const startMinutes = this.clampMinutes(
        this.diffInMinutes(block.startTime, dayStart),
        0,
        AgendaService.MINUTES_PER_DAY
      );
      const endMinutes = this.clampMinutes(
        this.diffInMinutes(block.endTime, dayStart),
        0,
        AgendaService.MINUTES_PER_DAY
      );

      if (endMinutes <= startMinutes) {
        continue;
      }

      windows.push({
        id: block.id,
        type: block.type,
        note: block.note ?? null,
        startMinutes,
        endMinutes,
        source: "BARBER_BLOCK",
      });
    }

    return windows;
  }

  private createLunchBlockWindow(
    availability: BarberAvailabilityRecord | null
  ): BlockWindow | null {
    if (!availability || !availability.lunchStart || !availability.lunchEnd) {
      return null;
    }

    const startMinutes = timeStringToMinutes(availability.lunchStart);
    const endMinutes = timeStringToMinutes(availability.lunchEnd);

    if (endMinutes <= startMinutes) {
      return null;
    }

    return {
      type: BlockType.BREAK,
      startMinutes,
      endMinutes,
      source: "LUNCH",
    };
  }

  private findBlockOverlap(
    blocks: BlockWindow[],
    start: number,
    end: number
  ): BlockWindow | null {
    return (
      blocks.find(
        (block) => start < block.endMinutes && end > block.startMinutes
      ) ?? null
    );
  }

  private findAppointmentOverlap(
    appointments: AppointmentWindow[],
    start: number,
    end: number
  ): AppointmentWindow | null {
    return (
      appointments.find(
        (appointment) =>
          start < appointment.endMinutes && end > appointment.startMinutes
      ) ?? null
    );
  }

  private parseDate(dateStr: string): Date {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new BadRequestException("Invalid date format");
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date");
    }

    return date;
  }

  private getDayOfWeek(date: Date): number {
    return date.getUTCDay();
  }

  private getDayRange(date: Date) {
    const startOfDay = new Date(date.getTime());
    const endOfDay = this.addDays(startOfDay, 1);
    return { startOfDay, endOfDay };
  }

  private buildWeek(start: Date) {
    const days: Array<{
      dateKey: string;
      startOfDay: Date;
      dayOfWeek: number;
    }> = [];

    for (let i = 0; i < 7; i += 1) {
      const dayStart = this.addDays(start, i);
      days.push({
        dateKey: this.formatDate(dayStart),
        startOfDay: dayStart,
        dayOfWeek: this.getDayOfWeek(dayStart),
      });
    }

    return days;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private diffInMinutes(target: Date, base: Date): number {
    return Math.floor((target.getTime() - base.getTime()) / 60000);
  }

  private clampMinutes(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
