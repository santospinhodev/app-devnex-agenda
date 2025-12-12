import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Request } from "express";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { Permission } from "../../common/enums/permission.enum";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./services/users.service";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("users")
@UseGuards(JwtAccessGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(":id")
  async updateUser(
    @Req() req: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    this.ensureCanUpdate(req.user, id);

    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      const trimmed = dto.name?.trim();
      data.name = trimmed && trimmed.length > 0 ? trimmed : null;
    }

    if (dto.email !== undefined) {
      data.email = dto.email.trim();
    }

    if (dto.phone !== undefined) {
      const digits = dto.phone ? dto.phone.replace(/\D/g, "") : "";
      data.phone = digits.length > 0 ? digits : null;
    }

    const updated = await this.usersService.updateUser(id, data);
    return this.usersService.mapToAuthUser(updated);
  }

  private ensureCanUpdate(
    actor: AuthenticatedRequest["user"],
    targetUserId: string,
  ) {
    if (actor.userId === targetUserId) {
      return;
    }

    if (actor.permissions.includes(Permission.ADMIN)) {
      return;
    }

    throw new ForbiddenException(
      "Você não possui permissão para atualizar este usuário.",
    );
  }
}
