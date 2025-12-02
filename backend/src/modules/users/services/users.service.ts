import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UsersRepository } from "../repositories/users.repository";
import { Permission } from "../../../common/enums/permission.enum";
import { AuthUser } from "../interfaces/auth-user.interface";
import { UserWithRelations } from "../types/user-with-relations.type";

export interface CreateUserInput {
  email: string;
  name?: string;
  phone?: string;
  hashedPassword: string;
}

export interface CreateAdminUserInput extends CreateUserInput {}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    return this.usersRepository.findByEmail(email, tx);
  }

  findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    return this.usersRepository.findById(id, tx);
  }

  createAdminUser(
    data: CreateAdminUserInput,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    return this.createUser(data, tx);
  }

  createUser(
    data: CreateUserInput,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    return this.usersRepository.createUser(
      {
        email: data.email,
        name: data.name,
        phone: data.phone,
        hashedPassword: data.hashedPassword,
      },
      tx
    );
  }

  async assignDefaultPermissions(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    await this.assignPermissions(
      userId,
      [Permission.ADMIN, Permission.BARBER],
      tx
    );
  }

  async assignPermissions(
    userId: string,
    permissions: Permission[],
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    for (const permission of permissions) {
      const prismaPermission = await this.usersRepository.upsertPermission(
        permission,
        tx
      );
      await this.usersRepository.attachPermissionToUser(
        userId,
        prismaPermission.id,
        tx
      );
    }
  }

  updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    return this.usersRepository.updateUser(id, data, tx);
  }

  mapToAuthUser(user: UserWithRelations): AuthUser {
    const permissions = Array.from(
      new Set(
        user.permissions.map(({ permission }) => permission.name as Permission)
      )
    );

    const barbershopReference =
      user.barberProfile?.barbershop ??
      user.receptionistProfile?.barbershop ??
      user.ownedBarbershops?.[0] ??
      null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      permissions,
      barbershop: barbershopReference
        ? {
            id: barbershopReference.id,
            name: barbershopReference.name,
          }
        : null,
    };
  }
}
