import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UsersRepository } from "../repositories/users.repository";
import { Permission } from "../../../common/enums/permission.enum";
import { AuthUser } from "../interfaces/auth-user.interface";
import { UserWithRelations } from "../types/user-with-relations.type";

export interface CreateAdminUserInput {
  email: string;
  name?: string;
  phone?: string;
  hashedPassword: string;
}

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
    const permissionsToAssign = [Permission.ADMIN, Permission.BARBER];

    for (const permission of permissionsToAssign) {
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

  mapToAuthUser(user: UserWithRelations): AuthUser {
    const permissions = Array.from(
      new Set(
        user.permissions.map(({ permission }) => permission.name as Permission)
      )
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      permissions,
      barbershop:
        (user.barberProfile?.barbershop ?? user.customerProfile?.barbershop)
          ? {
              id: (user.barberProfile?.barbershop ??
                user.customerProfile?.barbershop)!.id,
              name: (user.barberProfile?.barbershop ??
                user.customerProfile?.barbershop)!.name,
            }
          : null,
    };
  }
}
