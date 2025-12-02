import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import {
  barberProfileWithUser,
  BarberProfileWithUser,
  receptionistProfileWithUser,
  ReceptionistProfileWithUser,
  customerProfileWithBarbershop,
  CustomerProfileWithBarbershop,
} from "../types/profile-with-user.types";

@Injectable()
export class UserProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findBarbersByBarbershop(
    barbershopId: string,
    tx?: Prisma.TransactionClient
  ): Promise<BarberProfileWithUser[]> {
    const client = this.getClient(tx);
    return client.barberProfile.findMany({
      where: { barbershopId },
      include: barberProfileWithUser.include,
      orderBy: { createdAt: "asc" },
    });
  }

  findBarberById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<BarberProfileWithUser | null> {
    const client = this.getClient(tx);
    return client.barberProfile.findUnique({
      where: { id },
      include: barberProfileWithUser.include,
    });
  }

  createBarberProfile(
    data: Prisma.BarberProfileCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<BarberProfileWithUser> {
    const client = this.getClient(tx);
    return client.barberProfile.create({
      data,
      include: barberProfileWithUser.include,
    });
  }

  updateBarberProfile(
    id: string,
    data: Prisma.BarberProfileUpdateInput,
    tx?: Prisma.TransactionClient
  ): Promise<BarberProfileWithUser> {
    const client = this.getClient(tx);
    return client.barberProfile.update({
      where: { id },
      data,
      include: barberProfileWithUser.include,
    });
  }

  findReceptionistsByBarbershop(
    barbershopId: string,
    tx?: Prisma.TransactionClient
  ): Promise<ReceptionistProfileWithUser[]> {
    const client = this.getClient(tx);
    return client.receptionistProfile.findMany({
      where: { barbershopId },
      include: receptionistProfileWithUser.include,
      orderBy: { createdAt: "asc" },
    });
  }

  findReceptionistById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<ReceptionistProfileWithUser | null> {
    const client = this.getClient(tx);
    return client.receptionistProfile.findUnique({
      where: { id },
      include: receptionistProfileWithUser.include,
    });
  }

  createReceptionistProfile(
    data: Prisma.ReceptionistProfileCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<ReceptionistProfileWithUser> {
    const client = this.getClient(tx);
    return client.receptionistProfile.create({
      data,
      include: receptionistProfileWithUser.include,
    });
  }

  updateReceptionistProfile(
    id: string,
    data: Prisma.ReceptionistProfileUpdateInput,
    tx?: Prisma.TransactionClient
  ): Promise<ReceptionistProfileWithUser> {
    const client = this.getClient(tx);
    return client.receptionistProfile.update({
      where: { id },
      data,
      include: receptionistProfileWithUser.include,
    });
  }

  findCustomerById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<CustomerProfileWithBarbershop | null> {
    const client = this.getClient(tx);
    return client.customerProfile.findUnique({
      where: { id },
      include: customerProfileWithBarbershop.include,
    });
  }
}
