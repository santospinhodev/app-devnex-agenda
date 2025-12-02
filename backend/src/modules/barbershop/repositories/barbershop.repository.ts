import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

const barbershopSelection = {
  id: true,
  ownerId: true,
  name: true,
  phone: true,
  address: true,
  neighborhood: true,
  city: true,
  state: true,
  zipCode: true,
  photoUrl: true,
  opensAt: true,
  closesAt: true,
  daysOpen: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.BarbershopSelect;

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
      select: barbershopSelection,
    });
  }

  createBarbershop(
    data: Prisma.BarbershopCreateInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = this.getClient(tx);
    return client.barbershop.create({
      data,
      select: barbershopSelection,
    });
  }

  findById(id: string, tx?: Prisma.TransactionClient) {
    const client = this.getClient(tx);
    return client.barbershop.findUnique({
      where: { id },
      select: barbershopSelection,
    });
  }

  findByAssociatedUserId(userId: string, tx?: Prisma.TransactionClient) {
    const client = this.getClient(tx);
    return client.barbershop.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { barbers: { some: { userId } } },
          { receptionists: { some: { userId } } },
        ],
      },
      select: barbershopSelection,
    });
  }

  updateBarbershop(
    id: string,
    data: Prisma.BarbershopUpdateInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = this.getClient(tx);
    return client.barbershop.update({
      where: { id },
      data,
      select: barbershopSelection,
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
    defaults: {
      name: string;
      phone?: string | null;
      avatarUrl?: string | null;
    },
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
        name: defaults.name,
        phone: defaults.phone ?? null,
        avatarUrl: defaults.avatarUrl ?? null,
        isActive: true,
      },
    });
  }
}
