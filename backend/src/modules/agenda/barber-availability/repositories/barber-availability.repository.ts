import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../database/prisma.service";

const availabilitySelect = {
  id: true,
  barberProfileId: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  lunchStart: true,
  lunchEnd: true,
  slotInterval: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BarberAvailabilitySelect;

export type BarberAvailabilityRecord = Prisma.BarberAvailabilityGetPayload<{
  select: typeof availabilitySelect;
}>;

@Injectable()
export class BarberAvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findManyByBarberProfile(
    barberProfileId: string,
    tx?: Prisma.TransactionClient
  ): Promise<BarberAvailabilityRecord[]> {
    const client = this.getClient(tx);
    return client.barberAvailability.findMany({
      where: { barberProfileId },
      select: availabilitySelect,
      orderBy: { dayOfWeek: "asc" },
    });
  }

  findByBarberProfileAndDay(
    barberProfileId: string,
    dayOfWeek: number,
    tx?: Prisma.TransactionClient
  ): Promise<BarberAvailabilityRecord | null> {
    const client = this.getClient(tx);
    return client.barberAvailability.findUnique({
      where: { barberProfileId_dayOfWeek: { barberProfileId, dayOfWeek } },
      select: availabilitySelect,
    });
  }

  deleteByBarberProfile(
    barberProfileId: string,
    tx?: Prisma.TransactionClient
  ): Promise<Prisma.BatchPayload> {
    const client = this.getClient(tx);
    return client.barberAvailability.deleteMany({
      where: { barberProfileId },
    });
  }

  createManyForBarber(
    barberProfileId: string,
    data: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      lunchStart?: string | null;
      lunchEnd?: string | null;
      slotInterval: number;
    }>,
    tx?: Prisma.TransactionClient
  ): Promise<Prisma.BatchPayload> {
    const client = this.getClient(tx);
    if (data.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return client.barberAvailability.createMany({
      data: data.map((entry) => ({
        barberProfileId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        lunchStart: entry.lunchStart ?? null,
        lunchEnd: entry.lunchEnd ?? null,
        slotInterval: entry.slotInterval,
      })),
    });
  }
}
