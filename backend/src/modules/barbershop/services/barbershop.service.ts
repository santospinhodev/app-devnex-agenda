import { Injectable } from "@nestjs/common";
import { Barbershop } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { BarbershopRepository } from "../repositories/barbershop.repository";

@Injectable()
export class BarbershopService {
  private static readonly DEFAULT_NAME = "Minha Barbearia";

  constructor(private readonly barbershopRepository: BarbershopRepository) {}

  async createDefaultBarbershopForAdmin(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<Barbershop> {
    const existing = await this.barbershopRepository.findByOwnerId(userId, tx);
    if (existing) {
      await this.barbershopRepository.createOrUpdateBarberProfile(
        userId,
        existing.id,
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
      tx
    );
    return barbershop;
  }
}
