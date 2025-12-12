import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BlockType } from "@prisma/client";
import { DateTime } from "luxon";
import { PrismaService } from "../../../database/prisma.service";
import { AppointmentWithMeta } from "../../appointments/types/appointment.types";
import { AppointmentsService } from "../../appointments/services/appointments.service";
import { DEFAULT_BARBERSHOP_TIMEZONE } from "../constants/timezone.constants";
import {
  AuthorizedBarberProfile,
  BarberAvailabilityService,
  RequestActor,
} from "../barber-availability/services/barber-availability.service";
import { BarberAvailabilityRecord } from "../barber-availability/repositories/barber-availability.repository";
import { BarberBlockRecord } from "../barber-block/repositories/barber-block.repository";
import { BarberBlockService } from "../barber-block/services/barber-block.service";
import { FinalTimelineEntry, FinalWeekDay } from "../types/agenda.types";
import { buildSlotAppointmentDetails } from "../utils/appointment.utils";
import { minutesToTime, timeStringToMinutes } from "../utils/time.utils";

interface TimelineContext {
  profile: AuthorizedBarberProfile;
  barbershop: {
    id: string;
    opensAt: string | null;
    closesAt: string | null;
  };
  availabilityMap: Map<number, BarberAvailabilityRecord>;
  timeZone: string;
}

interface BlockWindow {
  startMinutes: number;
  endMinutes: number;
  type: BlockType;
  source: "BARBER_BLOCK" | "LUNCH";
}

interface TimelineAppointmentWindow {
  startMinutes: number;
  endMinutes: number;
  record: AppointmentWithMeta;
}

@Injectable()
export class AgendaTimelineBuilderService {
  private static readonly MINUTES_PER_DAY = 24 * 60;
  private static readonly DEFAULT_INTERVAL = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly barberAvailabilityService: BarberAvailabilityService,
    private readonly barberBlockService: BarberBlockService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async buildFinalDayTimeline(
    actor: RequestActor,
    barberId: string,
    dateStr: string,
  ): Promise<FinalTimelineEntry[]> {
    const context = await this.buildContext(actor, barberId);
    const dayStart = this.getDayStart(dateStr, context.timeZone);
    const blockRecords = await this.barberBlockService.findBlocksForRange(
      context.profile.id,
      dayStart.toUTC().toJSDate(),
      dayStart.plus({ days: 1 }).toUTC().toJSDate(),
    );
    const appointments =
      await this.appointmentsService.getBarberAppointmentsInRange(
        context.profile,
        dayStart.toUTC().toJSDate(),
        dayStart.plus({ days: 1 }).toUTC().toJSDate(),
      );

    return this.composeDayTimeline(
      context,
      dayStart,
      blockRecords,
      appointments,
    );
  }

  async buildFinalWeekTimeline(
    actor: RequestActor,
    barberId: string,
    startStr: string,
  ): Promise<FinalWeekDay[]> {
    const context = await this.buildContext(actor, barberId);
    const weekStart = this.getDayStart(startStr, context.timeZone);
    const weekEnd = weekStart.plus({ days: 7 });

    const weekBlocks = await this.barberBlockService.findBlocksForRange(
      context.profile.id,
      weekStart.toUTC().toJSDate(),
      weekEnd.toUTC().toJSDate(),
    );
    const weekAppointments =
      await this.appointmentsService.getBarberAppointmentsInRange(
        context.profile,
        weekStart.toUTC().toJSDate(),
        weekEnd.toUTC().toJSDate(),
      );

    const days: FinalWeekDay[] = [];
    for (let i = 0; i < 7; i += 1) {
      const dayStart = weekStart.plus({ days: i });
      const dayBlocks = this.filterBlocksForDay(
        weekBlocks,
        dayStart,
        context.timeZone,
      );
      const dayAppointments = weekAppointments.filter((appointment) => {
        const start = DateTime.fromJSDate(appointment.startAt, {
          zone: "utc",
        }).setZone(context.timeZone);
        const end = DateTime.fromJSDate(appointment.endAt, {
          zone: "utc",
        }).setZone(context.timeZone);
        const nextDay = dayStart.plus({ days: 1 });
        return start < nextDay && end > dayStart;
      });
      days.push({
        date: dayStart.toISODate() ?? dayStart.toFormat("yyyy-LL-dd"),
        slots: this.composeDayTimeline(
          context,
          dayStart,
          dayBlocks,
          dayAppointments,
        ),
      });
    }

    return days;
  }

  private async buildContext(
    actor: RequestActor,
    barberId: string,
  ): Promise<TimelineContext> {
    const { profile } =
      await this.barberAvailabilityService.getAuthorizedBarberProfile(
        actor,
        barberId,
        "view",
      );

    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: profile.barbershopId },
      select: {
        id: true,
        opensAt: true,
        closesAt: true,
      },
    });

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for barber profile");
    }

    const availabilityMap =
      await this.barberAvailabilityService.getAvailabilityMap(profile.id);

    const inferredTimezone =
      (barbershop as unknown as { timezone?: string | null }).timezone ??
      DEFAULT_BARBERSHOP_TIMEZONE;

    return {
      profile,
      barbershop,
      availabilityMap,
      timeZone: inferredTimezone,
    };
  }

  private composeDayTimeline(
    context: TimelineContext,
    dayStart: DateTime,
    blockRecords: BarberBlockRecord[],
    appointments: AppointmentWithMeta[],
  ): FinalTimelineEntry[] {
    const dayOfWeek = this.resolveDayOfWeekIndex(dayStart);
    const availability = context.availabilityMap.get(dayOfWeek) ?? null;
    const blockWindows = this.createBlockWindows(
      blockRecords,
      dayStart,
      context.timeZone,
    );
    const appointmentWindows = this.createAppointmentWindows(
      appointments,
      dayStart,
      context.timeZone,
    );

    const lunchWindow = this.createLunchBlockWindow(availability);
    if (lunchWindow) {
      blockWindows.push(lunchWindow);
    }

    return this.generateTimelineEntries(
      context.barbershop,
      availability,
      blockWindows,
      appointmentWindows,
    );
  }

  private getDayStart(dateStr: string, timeZone: string): DateTime {
    const parsed = DateTime.fromISO(dateStr, { zone: timeZone });
    if (!parsed.isValid) {
      throw new BadRequestException("Invalid date format");
    }
    return parsed.startOf("day");
  }

  private resolveDayOfWeekIndex(dayStart: DateTime): number {
    // Luxon weekday: Monday=1 ... Sunday=7. Backend uses Sunday=0 ... Saturday=6.
    return dayStart.weekday % 7;
  }

  private filterBlocksForDay(
    blocks: BarberBlockRecord[],
    dayStart: DateTime,
    timeZone: string,
  ): BarberBlockRecord[] {
    const dayEnd = dayStart.plus({ days: 1 });
    return blocks.filter((block) => {
      const blockStart = DateTime.fromJSDate(block.startTime, {
        zone: "utc",
      }).setZone(timeZone);
      const blockEnd = DateTime.fromJSDate(block.endTime, {
        zone: "utc",
      }).setZone(timeZone);

      return blockStart < dayEnd && blockEnd > dayStart;
    });
  }

  private createBlockWindows(
    blocks: BarberBlockRecord[],
    dayStart: DateTime,
    timeZone: string,
  ): BlockWindow[] {
    const windows: BlockWindow[] = [];

    for (const block of blocks) {
      const blockStart = DateTime.fromJSDate(block.startTime, {
        zone: "utc",
      }).setZone(timeZone);
      const blockEnd = DateTime.fromJSDate(block.endTime, {
        zone: "utc",
      }).setZone(timeZone);

      const relativeStart = blockStart.diff(dayStart, "minutes").minutes;
      const relativeEnd = blockEnd.diff(dayStart, "minutes").minutes;
      const clampedStart = Math.max(
        0,
        Math.min(relativeStart, AgendaTimelineBuilderService.MINUTES_PER_DAY),
      );
      const clampedEnd = Math.max(
        0,
        Math.min(relativeEnd, AgendaTimelineBuilderService.MINUTES_PER_DAY),
      );

      if (clampedEnd <= clampedStart) {
        continue;
      }

      windows.push({
        startMinutes: clampedStart,
        endMinutes: clampedEnd,
        type: block.type,
        source: "BARBER_BLOCK",
      });
    }

    return windows.sort((a, b) => a.startMinutes - b.startMinutes);
  }

  private createAppointmentWindows(
    appointments: AppointmentWithMeta[],
    dayStart: DateTime,
    timeZone: string,
  ): TimelineAppointmentWindow[] {
    const windows: TimelineAppointmentWindow[] = [];

    for (const appointment of appointments) {
      const appointmentStart = DateTime.fromJSDate(appointment.startAt, {
        zone: "utc",
      }).setZone(timeZone);
      const appointmentEnd = DateTime.fromJSDate(appointment.endAt, {
        zone: "utc",
      }).setZone(timeZone);

      const relativeStart = appointmentStart.diff(dayStart, "minutes").minutes;
      const relativeEnd = appointmentEnd.diff(dayStart, "minutes").minutes;
      const clampedStart = Math.max(
        0,
        Math.min(relativeStart, AgendaTimelineBuilderService.MINUTES_PER_DAY),
      );
      const clampedEnd = Math.max(
        0,
        Math.min(relativeEnd, AgendaTimelineBuilderService.MINUTES_PER_DAY),
      );

      if (clampedEnd <= clampedStart) {
        continue;
      }

      windows.push({
        startMinutes: clampedStart,
        endMinutes: clampedEnd,
        record: appointment,
      });
    }

    return windows.sort((a, b) => a.startMinutes - b.startMinutes);
  }

  private createLunchBlockWindow(
    availability: BarberAvailabilityRecord | null,
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
      startMinutes,
      endMinutes,
      type: BlockType.BREAK,
      source: "LUNCH",
    };
  }

  private generateTimelineEntries(
    barbershop: TimelineContext["barbershop"],
    availability: BarberAvailabilityRecord | null,
    blockWindows: BlockWindow[],
    appointmentWindows: TimelineAppointmentWindow[],
  ): FinalTimelineEntry[] {
    const { startMinutes, endMinutes } = this.resolveBusinessWindow(
      barbershop,
      availability,
    );
    const interval =
      availability?.slotInterval ??
      AgendaTimelineBuilderService.DEFAULT_INTERVAL;
    const availabilityStart = availability
      ? timeStringToMinutes(availability.startTime)
      : null;
    const availabilityEnd = availability
      ? timeStringToMinutes(availability.endTime)
      : null;

    if (interval <= 0 || endMinutes <= startMinutes) {
      return [];
    }

    const entries: FinalTimelineEntry[] = [];
    for (
      let current = startMinutes;
      current + interval <= endMinutes;
      current += interval
    ) {
      const slotEnd = current + interval;
      const appointmentWindow = this.findAppointmentOverlap(
        appointmentWindows,
        current,
        slotEnd,
      );
      const overlappingBlock = this.findBlockOverlap(
        blockWindows,
        current,
        slotEnd,
      );
      const inAvailability =
        availabilityStart !== null &&
        availabilityEnd !== null &&
        current >= availabilityStart &&
        slotEnd <= availabilityEnd;

      if (appointmentWindow) {
        entries.push({
          time: minutesToTime(Math.floor(current)),
          status: "APPOINTMENT",
          appointment: buildSlotAppointmentDetails(appointmentWindow.record),
        });
        continue;
      }

      const entry = this.resolveEntry(
        current,
        overlappingBlock,
        inAvailability,
      );
      entries.push(entry);
    }

    return entries;
  }

  private resolveEntry(
    startMinutes: number,
    block: BlockWindow | null,
    inAvailability: boolean,
  ): FinalTimelineEntry {
    const base: FinalTimelineEntry = {
      time: minutesToTime(Math.floor(startMinutes)),
      status: "UNAVAILABLE",
    };

    if (block) {
      return {
        ...base,
        status: "BLOCKED",
        type: block.type,
        source: block.source,
      };
    }

    if (inAvailability) {
      return {
        ...base,
        status: "FREE",
      };
    }

    return base;
  }

  private resolveBusinessWindow(
    barbershop: TimelineContext["barbershop"],
    availability: BarberAvailabilityRecord | null,
  ) {
    const fallbackStart = availability
      ? timeStringToMinutes(availability.startTime)
      : 0;
    const fallbackEnd = availability
      ? timeStringToMinutes(availability.endTime)
      : AgendaTimelineBuilderService.MINUTES_PER_DAY;

    let startMinutes = barbershop.opensAt
      ? timeStringToMinutes(barbershop.opensAt)
      : fallbackStart;
    let endMinutes = barbershop.closesAt
      ? timeStringToMinutes(barbershop.closesAt)
      : fallbackEnd;

    startMinutes = this.clampMinutes(startMinutes);
    endMinutes = this.clampMinutes(endMinutes);

    if (endMinutes <= startMinutes) {
      startMinutes = 0;
      endMinutes = AgendaTimelineBuilderService.MINUTES_PER_DAY;
    }

    return { startMinutes, endMinutes };
  }

  private findBlockOverlap(
    blocks: BlockWindow[],
    slotStart: number,
    slotEnd: number,
  ): BlockWindow | null {
    return (
      blocks.find(
        (block) => slotStart < block.endMinutes && slotEnd > block.startMinutes,
      ) ?? null
    );
  }

  private findAppointmentOverlap(
    appointments: TimelineAppointmentWindow[],
    slotStart: number,
    slotEnd: number,
  ): TimelineAppointmentWindow | null {
    return (
      appointments.find(
        (appointment) =>
          slotStart < appointment.endMinutes &&
          slotEnd > appointment.startMinutes,
      ) ?? null
    );
  }

  private clampMinutes(value: number) {
    return Math.max(
      0,
      Math.min(value, AgendaTimelineBuilderService.MINUTES_PER_DAY),
    );
  }
}
