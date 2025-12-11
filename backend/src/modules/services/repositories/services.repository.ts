import { Injectable } from "@nestjs/common";
import { Prisma, Service } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

interface FindManyParams {
  barbershopId: string;
  name?: string;
}

@Injectable()
export class ServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findManyByBarbershop(
    { barbershopId, name }: FindManyParams,
    tx?: Prisma.TransactionClient,
  ): Promise<Service[]> {
    const client = this.getClient(tx);
    return client.service.findMany({
      where: {
        barbershopId,
        deletedAt: null,
        ...(name
          ? {
              name: {
                contains: name,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: { createdAt: "asc" },
    });
  }

  findById(id: string, tx?: Prisma.TransactionClient): Promise<Service | null> {
    const client = this.getClient(tx);
    return client.service.findFirst({
      where: { id, deletedAt: null },
    });
  }

  create(
    data: Prisma.ServiceCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Service> {
    const client = this.getClient(tx);
    return client.service.create({ data });
  }

  update(
    id: string,
    data: Prisma.ServiceUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Service> {
    const client = this.getClient(tx);
    return client.service.update({ where: { id }, data });
  }
}
