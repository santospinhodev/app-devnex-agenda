import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../database/prisma.service";

const blockSelect = {
  id: true,
  barberProfileId: true,
  barbershopId: true,
  startTime: true,
  endTime: true,
  type: true,
  note: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BarberBlockSelect;

export type BarberBlockRecord = Prisma.BarberBlockGetPayload<{
  select: typeof blockSelect;
}>;

@Injectable()
export class BarberBlockRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  create(
    data: Prisma.BarberBlockCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<BarberBlockRecord> {
    const client = this.getClient(tx);
    return client.barberBlock.create({
      data,
      select: blockSelect,
    });
  }

  findByBarberProfileInRange(
    barberProfileId: string,
    start: Date,
    end: Date,
    tx?: Prisma.TransactionClient
  ): Promise<BarberBlockRecord[]> {
    const client = this.getClient(tx);
    return client.barberBlock.findMany({
      where: {
        barberProfileId,
        startTime: {
          lt: end,
        },
        endTime: {
          gt: start,
        },
      },
      select: blockSelect,
      orderBy: { startTime: "asc" },
    });
  }
}
