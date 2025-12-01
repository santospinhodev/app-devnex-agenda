import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import {
  UserWithRelations,
  userWithRelations,
} from "../types/user-with-relations.type";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    const client = this.getClient(tx);
    return client.user.findUnique({
      where: { email },
      include: this.includeRelations(),
    }) as unknown as Promise<UserWithRelations | null>;
  }

  findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    const client = this.getClient(tx);
    return client.user.findUnique({
      where: { id },
      include: this.includeRelations(),
    }) as unknown as Promise<UserWithRelations | null>;
  }

  createUser(
    data: Prisma.UserCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = this.getClient(tx);
    return client.user.create({
      data,
      include: this.includeRelations(),
    }) as unknown as Promise<UserWithRelations>;
  }

  upsertPermission(name: string, tx?: Prisma.TransactionClient) {
    const client = this.getClient(tx);
    return client.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  attachPermissionToUser(
    userId: string,
    permissionId: number,
    tx?: Prisma.TransactionClient
  ) {
    const client = this.getClient(tx);
    return client.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      update: {},
      create: {
        userId,
        permissionId,
      },
    });
  }

  private includeRelations(): Prisma.UserInclude {
    return userWithRelations.include;
  }
}
