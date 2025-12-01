import { Injectable } from "@nestjs/common";
import { Permission as PrismaPermission, User } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { Permission } from "../../common/enums/permission.enum";

export type UserWithPermissions = User & {
  permissions: Array<{
    permission: PrismaPermission;
  }>;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserWithPermissions | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  hasPermission(user: UserWithPermissions, required: Permission): boolean {
    return user.permissions.some(
      (relation: UserWithPermissions["permissions"][number]) =>
        relation.permission.name === required
    );
  }
}
