import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BarbershopRepository } from "../repositories/barbershop.repository";
import { Permission } from "../../../common/enums/permission.enum";

export interface RequestActor {
  userId: string;
  permissions: Permission[];
}

export type BarbershopSummary = Awaited<
  ReturnType<BarbershopRepository["findByOwnerId"]>
>;

@Injectable()
export class BarbershopService {
  private static readonly DEFAULT_NAME = "Minha Barbearia";

  constructor(private readonly barbershopRepository: BarbershopRepository) {}

  async createDefaultBarbershopForAdmin(
    userId: string,
    tx?: Prisma.TransactionClient
  ) {
    const existing = await this.barbershopRepository.findByOwnerId(userId, tx);
    if (existing) {
      await this.barbershopRepository.createOrUpdateBarberProfile(
        userId,
        existing.id,
        { name: "Administrador" },
        tx
      );
      return existing;
    }

    const barbershop = await this.barbershopRepository.createBarbershop(
      {
        name: BarbershopService.DEFAULT_NAME,
        owner: {
          connect: { id: userId },
        },
      },
      tx
    );

    await this.barbershopRepository.createOrUpdateBarberProfile(
      userId,
      barbershop.id,
      { name: "Administrador" },
      tx
    );
    return barbershop;
  }

  getBarbershopForOwner(ownerId: string, tx?: Prisma.TransactionClient) {
    return this.barbershopRepository.findByOwnerId(ownerId, tx);
  }

  getBarbershopForActor(actor: RequestActor, tx?: Prisma.TransactionClient) {
    return this.barbershopRepository.findByAssociatedUserId(actor.userId, tx);
  }

  async updateBarbershopForOwner(
    ownerId: string,
    data: Prisma.BarbershopUpdateInput,
    tx?: Prisma.TransactionClient
  ) {
    const barbershop = await this.barbershopRepository.findByOwnerId(
      ownerId,
      tx
    );

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for this owner");
    }

    return this.barbershopRepository.updateBarbershop(barbershop.id, data, tx);
  }
}
