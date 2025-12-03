import { BadRequestException, Injectable } from "@nestjs/common";
import { AppointmentStatus } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { BarberAvailabilityRecord } from "../barber-availability/repositories/barber-availability.repository";
import {
  AuthorizedBarberProfile,
  BarberAvailabilityService,
  RequestActor,
} from "../barber-availability/services/barber-availability.service";
import {
  DayEntry,
  DayViewResponse,
  SlotsResponse,
  WeekDayView,
  WeekViewResponse,
} from "../types/agenda.types";
import { minutesToTime, timeStringToMinutes } from "../utils/time.utils";

interface AppointmentRecord {
  id: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  serviceId: string;
  customerId: string;
}

interface AppointmentWindow extends AppointmentRecord {
  startMinutes: number;
  endMinutes: number;
}

@Injectable()
export class AgendaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly barberAvailabilityService: BarberAvailabilityService
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
    const appointments = await this.fetchAppointments(
      profile,
      startOfDay,
      endOfDay
    );
    const mappedAppointments = this.mapAppointments(appointments, startOfDay);
    const slots = this.calculateFreeSlots(availability, mappedAppointments);

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
    const appointments = await this.fetchAppointments(
      profile,
      startOfDay,
      endOfDay
    );
    const entries = this.buildDayEntries(
      availability,
      appointments,
      startOfDay
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

    const appointments = await this.fetchAppointments(
      profile,
      overallStart,
      overallEnd
    );
    const groupedAppointments = this.groupAppointmentsByDay(appointments);
    const availabilityMap =
      await this.barberAvailabilityService.getAvailabilityMap(profile.id);

    const days: WeekDayView[] = weekDays.map((day) => {
      const dayAppointments = groupedAppointments.get(day.dateKey) ?? [];
      const availability = availabilityMap.get(day.dayOfWeek) ?? null;
      const entries = this.buildDayEntries(
        availability,
        dayAppointments,
        day.startOfDay
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

  private async fetchAppointments(
    profile: AuthorizedBarberProfile,
    start: Date,
    end: Date
  ): Promise<AppointmentRecord[]> {
    const records = await this.prisma.appointment.findMany({
      where: {
        barberId: profile.userId,
        barbershopId: profile.barbershopId,
        startAt: { gte: start, lt: end },
        deletedAt: null,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        serviceId: true,
        customerId: true,
      },
      orderBy: { startAt: "asc" },
    });

    return records.map((record) => ({
      id: record.id,
      startAt: record.startAt,
      endAt: record.endAt,
      status: record.status,
      serviceId: record.serviceId,
      customerId: record.customerId,
    }));
  }

  private buildDayEntries(
    availability: BarberAvailabilityRecord | null,
    appointments: AppointmentRecord[],
    dayStart: Date
  ): DayEntry[] {
    const mappedAppointments = this.mapAppointments(appointments, dayStart);
    const entries: DayEntry[] = [];

    if (availability) {
      const freeSlots = this.calculateFreeSlots(
        availability,
        mappedAppointments
      );
      for (const slot of freeSlots) {
        entries.push({ type: "FREE_SLOT", time: slot });
      }

      if (availability.lunchStart && availability.lunchEnd) {
        entries.push({
          type: "BLOCK",
          time: availability.lunchStart,
          endTime: availability.lunchEnd,
          reason: "LUNCH",
        });
      }
    }

    for (const appointment of mappedAppointments) {
      entries.push({
        type: "APPOINTMENT",
        time: minutesToTime(appointment.startMinutes),
        endTime: minutesToTime(appointment.endMinutes),
        appointmentId: appointment.id,
        status: appointment.status,
        serviceId: appointment.serviceId,
        customerId: appointment.customerId,
      });
    }

    entries.sort((a, b) => this.entryMinutes(a) - this.entryMinutes(b));
    return entries;
  }

  private calculateFreeSlots(
    availability: BarberAvailabilityRecord,
    appointments: AppointmentWindow[]
  ): string[] {
    const startMinutes = timeStringToMinutes(availability.startTime);
    const endMinutes = timeStringToMinutes(availability.endTime);
    const interval = availability.slotInterval;
    const lunchStart = availability.lunchStart
      ? timeStringToMinutes(availability.lunchStart)
      : null;
    const lunchEnd = availability.lunchEnd
      ? timeStringToMinutes(availability.lunchEnd)
      : null;

    const freeSlots: string[] = [];

    for (
      let current = startMinutes;
      current + interval <= endMinutes;
      current += interval
    ) {
      const slotEnd = current + interval;
      const overlapsLunch =
        lunchStart !== null &&
        lunchEnd !== null &&
        current < lunchEnd &&
        slotEnd > lunchStart;

      if (overlapsLunch) {
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
    appointments: AppointmentRecord[],
    dayStart: Date
  ): AppointmentWindow[] {
    return appointments.map((appointment) => {
      const rawStart = this.diffInMinutes(appointment.startAt, dayStart);
      const rawEnd = this.diffInMinutes(appointment.endAt, dayStart);
      const startMinutes = Math.max(0, rawStart);
      const endMinutes = Math.max(startMinutes, rawEnd);

      return {
        ...appointment,
        startMinutes,
        endMinutes,
      };
    });
  }

  private groupAppointmentsByDay(appointments: AppointmentRecord[]) {
    const map = new Map<string, AppointmentRecord[]>();

    for (const appointment of appointments) {
      const key = this.formatDate(appointment.startAt);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(appointment);
    }

    return map;
  }

  private entryMinutes(entry: DayEntry): number {
    if (entry.type === "APPOINTMENT") {
      return timeStringToMinutes(entry.time);
    }

    return timeStringToMinutes(entry.time);
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

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
