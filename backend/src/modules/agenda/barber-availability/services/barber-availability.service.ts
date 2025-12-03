import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Permission } from "../../../../common/enums/permission.enum";
import {
  BarbershopService,
  RequestActor as BarbershopRequestActor,
} from "../../../barbershop/services/barbershop.service";
import { PrismaService } from "../../../../database/prisma.service";
import {
  BarberAvailabilityRecord,
  BarberAvailabilityRepository,
} from "../repositories/barber-availability.repository";
import {
  DayAvailabilityDto,
  UpsertBarberAvailabilityDto,
} from "../dto/upsert-barber-availability.dto";
import { timeStringToMinutes } from "../../utils/time.utils";

export interface RequestActor {
  userId: string;
  permissions: Permission[];
}

export interface AuthorizedBarberProfile {
  id: string;
  userId: string;
  barbershopId: string;
  name: string;
}

export interface BarberAvailabilityEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  lunchStart: string | null;
  lunchEnd: string | null;
  slotInterval: number;
}

export interface BarberAvailabilityResponse {
  barberId: string;
  availability: BarberAvailabilityEntry[];
}

@Injectable()
export class BarberAvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: BarberAvailabilityRepository,
    private readonly barbershopService: BarbershopService
  ) {}

  async getAvailability(
    actor: RequestActor,
    barberId: string
  ): Promise<BarberAvailabilityResponse> {
    const { profile } = await this.getAuthorizedBarberProfile(
      actor,
      barberId,
      "view"
    );

    const records = await this.repository.findManyByBarberProfile(profile.id);
    return {
      barberId,
      availability: this.mapRecords(records),
    };
  }

  async upsertAvailability(
    actor: RequestActor,
    barberId: string,
    dto: UpsertBarberAvailabilityDto
  ): Promise<BarberAvailabilityResponse> {
    const { profile } = await this.getAuthorizedBarberProfile(
      actor,
      barberId,
      "manage"
    );

    const normalized = this.normalizeRules(dto.rules);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.repository.deleteByBarberProfile(profile.id, tx);
      await this.repository.createManyForBarber(profile.id, normalized, tx);
    });

    const records = await this.repository.findManyByBarberProfile(profile.id);

    return {
      barberId,
      availability: this.mapRecords(records),
    };
  }

  async getAuthorizedBarberProfile(
    actor: RequestActor,
    barberId: string,
    scope: "view" | "manage"
  ): Promise<{ profile: AuthorizedBarberProfile }> {
    const profile = await this.prisma.barberProfile.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        userId: true,
        barbershopId: true,
        name: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Barber profile not found");
    }

    const permissions = new Set(actor.permissions);
    const isSelf = profile.userId === actor.userId;

    if (scope === "manage") {
      if (permissions.has(Permission.BARBER) && isSelf) {
        return { profile };
      }

      if (permissions.has(Permission.ADMIN)) {
        const barbershop = await this.barbershopService.getBarbershopForActor(
          actor as BarbershopRequestActor
        );

        if (!barbershop || barbershop.id !== profile.barbershopId) {
          throw new ForbiddenException(
            "You cannot manage availability for this barber"
          );
        }

        return { profile };
      }

      throw new ForbiddenException(
        "You do not have permission to manage availability"
      );
    }

    if (permissions.has(Permission.BARBER) && isSelf) {
      return { profile };
    }

    if (
      permissions.has(Permission.ADMIN) ||
      permissions.has(Permission.RECEPTIONIST)
    ) {
      const barbershop = await this.barbershopService.getBarbershopForActor(
        actor as BarbershopRequestActor
      );

      if (!barbershop || barbershop.id !== profile.barbershopId) {
        throw new ForbiddenException("Barber not part of your barbershop");
      }

      return { profile };
    }

    throw new ForbiddenException(
      "You do not have permission to view this availability"
    );
  }

  async findAvailabilityForDay(
    barberProfileId: string,
    dayOfWeek: number
  ): Promise<BarberAvailabilityRecord | null> {
    return this.repository.findByBarberProfileAndDay(
      barberProfileId,
      dayOfWeek
    );
  }

  async getAvailabilityMap(barberProfileId: string) {
    const records =
      await this.repository.findManyByBarberProfile(barberProfileId);
    return new Map(records.map((record) => [record.dayOfWeek, record]));
  }

  private normalizeRules(rules: DayAvailabilityDto[]) {
    const seenDays = new Set<number>();

    const normalized = rules.map((rule) => {
      if (seenDays.has(rule.dayOfWeek)) {
        throw new BadRequestException(
          `Duplicate dayOfWeek provided: ${rule.dayOfWeek}`
        );
      }
      seenDays.add(rule.dayOfWeek);

      const startTime = rule.startTime.trim();
      const endTime = rule.endTime.trim();
      const lunchStartValue = rule.lunchStart?.trim();
      const lunchEndValue = rule.lunchEnd?.trim();

      const startMinutes = timeStringToMinutes(startTime);
      const endMinutes = timeStringToMinutes(endTime);

      if (endMinutes <= startMinutes) {
        throw new BadRequestException(
          `endTime must be after startTime for day ${rule.dayOfWeek}`
        );
      }

      if (rule.slotInterval <= 0) {
        throw new BadRequestException(
          `slotInterval must be positive for day ${rule.dayOfWeek}`
        );
      }

      if (rule.slotInterval > endMinutes - startMinutes) {
        throw new BadRequestException(
          `slotInterval cannot exceed total availability window for day ${rule.dayOfWeek}`
        );
      }

      const hasLunchStart = Boolean(lunchStartValue);
      const hasLunchEnd = Boolean(lunchEndValue);

      if (hasLunchStart !== hasLunchEnd) {
        throw new BadRequestException(
          `Lunch start and end must be provided together for day ${rule.dayOfWeek}`
        );
      }

      if (hasLunchStart && hasLunchEnd) {
        const lunchStartMinutes = timeStringToMinutes(lunchStartValue!);
        const lunchEndMinutes = timeStringToMinutes(lunchEndValue!);

        if (lunchEndMinutes <= lunchStartMinutes) {
          throw new BadRequestException(
            `Lunch end must be after lunch start for day ${rule.dayOfWeek}`
          );
        }

        if (lunchStartMinutes < startMinutes || lunchEndMinutes > endMinutes) {
          throw new BadRequestException(
            `Lunch window must be within availability period for day ${rule.dayOfWeek}`
          );
        }
      }

      return {
        dayOfWeek: rule.dayOfWeek,
        startTime,
        endTime,
        lunchStart: lunchStartValue ?? null,
        lunchEnd: lunchEndValue ?? null,
        slotInterval: rule.slotInterval,
      };
    });

    normalized.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    return normalized;
  }

  private mapRecords(
    records: BarberAvailabilityRecord[]
  ): BarberAvailabilityEntry[] {
    return records.map((record) => ({
      dayOfWeek: record.dayOfWeek,
      startTime: record.startTime,
      endTime: record.endTime,
      lunchStart: record.lunchStart ?? null,
      lunchEnd: record.lunchEnd ?? null,
      slotInterval: record.slotInterval,
    }));
  }
}
