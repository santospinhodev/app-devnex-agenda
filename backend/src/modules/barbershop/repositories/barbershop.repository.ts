import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class BarbershopRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findByOwnerId(ownerId: string, tx?: Prisma.TransactionClient) {
    const client = this.getClient(tx);
    return client.barbershop.findFirst({
      where: { ownerId },
    });
  }

  createBarbershop(
    data: Prisma.BarbershopCreateInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = this.getClient(tx);
    return client.barbershop.create({
      data,
    });
  }

  findBarberProfileByUserId(userId: string, tx?: Prisma.TransactionClient) {
    const client = this.getClient(tx);
    return client.barberProfile.findUnique({
      where: { userId },
    });
  }

  createOrUpdateBarberProfile(
    userId: string,
    barbershopId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = this.getClient(tx);
    return client.barberProfile.upsert({
      where: { userId },
      update: {
        barbershopId,
      },
      create: {
        user: {
          connect: { id: userId },
        },
        barbershop: {
          connect: { id: barbershopId },
        },
      },
    });
  }
}
