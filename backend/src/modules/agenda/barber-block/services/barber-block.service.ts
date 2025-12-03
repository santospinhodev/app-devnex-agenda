import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../../database/prisma.service";
import { Permission } from "../../../../common/enums/permission.enum";
import { BarbershopService } from "../../../barbershop/services/barbershop.service";
import {
  BarberBlockRepository,
  BarberBlockRecord,
} from "../repositories/barber-block.repository";
import { CreateBarberBlockDto } from "../dto/create-barber-block.dto";
import { GetBarberBlocksQueryDto } from "../dto/get-barber-blocks-query.dto";

export interface RequestActor {
  userId: string;
  permissions: Permission[];
}

export interface BarberBlocksResponse {
  barberId: string;
  date: string;
  blocks: BarberBlockRecord[];
}

@Injectable()
export class BarberBlockService {
  private static readonly LOGGER = new Logger(BarberBlockService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: BarberBlockRepository,
    private readonly barbershopService: BarbershopService
  ) {}

  async createBlock(
    actor: RequestActor,
    barberId: string,
    dto: CreateBarberBlockDto
  ): Promise<BarberBlockRecord> {
    const profile = await this.resolveAuthorizedProfile(
      actor,
      barberId,
      "manage"
    );
    const { startTime, endTime } = this.normalizeRange(
      dto.startTime,
      dto.endTime
    );

    const record = await this.repository.create({
      barber: { connect: { id: profile.id } },
      barbershop: { connect: { id: profile.barbershopId } },
      startTime,
      endTime,
      type: dto.type,
      note: dto.note ?? null,
    });

    BarberBlockService.LOGGER.log(
      `Block created for barber=${barberId} by user=${actor.userId} type=${dto.type}`
    );

    return record;
  }

  async getBlocksForDay(
    actor: RequestActor,
    barberId: string,
    query: GetBarberBlocksQueryDto
  ): Promise<BarberBlocksResponse> {
    const profile = await this.resolveAuthorizedProfile(
      actor,
      barberId,
      "view"
    );
    const { startOfDay, endOfDay } = this.getDayRange(query.date);
    const blocks = await this.repository.findByBarberProfileInRange(
      profile.id,
      startOfDay,
      endOfDay
    );

    BarberBlockService.LOGGER.log(
      `Blocks fetched for barber=${barberId} by user=${actor.userId} date=${query.date}`
    );

    return {
      barberId,
      date: query.date,
      blocks,
    };
  }

  findBlocksForRange(
    barberProfileId: string,
    start: Date,
    end: Date
  ): Promise<BarberBlockRecord[]> {
    return this.repository.findByBarberProfileInRange(
      barberProfileId,
      start,
      end
    );
  }

  private async resolveAuthorizedProfile(
    actor: RequestActor,
    barberId: string,
    scope: "view" | "manage"
  ) {
    const profile = await this.prisma.barberProfile.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        userId: true,
        barbershopId: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Barber profile not found");
    }

    const permissions = new Set(actor.permissions);
    const isSelf = profile.userId === actor.userId;

    if (scope === "manage") {
      if (permissions.has(Permission.BARBER) && isSelf) {
        return profile;
      }

      if (permissions.has(Permission.ADMIN)) {
        await this.ensureSameBarbershop(actor, profile.barbershopId);
        return profile;
      }

      throw new ForbiddenException("You cannot manage blocks for this barber");
    }

    if (permissions.has(Permission.BARBER) && isSelf) {
      return profile;
    }

    if (
      permissions.has(Permission.ADMIN) ||
      permissions.has(Permission.RECEPTIONIST)
    ) {
      await this.ensureSameBarbershop(actor, profile.barbershopId);
      return profile;
    }

    throw new ForbiddenException("You cannot view blocks for this barber");
  }

  private async ensureSameBarbershop(
    actor: RequestActor,
    targetBarbershopId: string
  ) {
    const barbershop =
      await this.barbershopService.getBarbershopForActor(actor);
    if (!barbershop || barbershop.id !== targetBarbershopId) {
      throw new ForbiddenException("Barber does not belong to your barbershop");
    }
  }

  private normalizeRange(startStr: string, endStr: string) {
    const startTime = new Date(startStr);
    const endTime = new Date(endStr);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestException("Invalid start or end time");
    }

    if (endTime <= startTime) {
      throw new BadRequestException("endTime must be after startTime");
    }

    return { startTime, endTime };
  }

  private getDayRange(dateStr: string) {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new BadRequestException("Invalid date format");
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    const endOfDay = new Date(startOfDay.getTime());
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    return { startOfDay, endOfDay };
  }
}
