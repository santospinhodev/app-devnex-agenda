import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Request } from "express";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import {
  BarbershopService,
  BarbershopSummary,
} from "../services/barbershop.service";
import { UpdateBarbershopDto } from "../dto/update-barbershop.dto";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("barbershop")
@UseGuards(JwtAccessGuard, PermissionsGuard)
export class BarbershopController {
  constructor(private readonly barbershopService: BarbershopService) {}

  @Get("me")
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  async getMyBarbershop(
    @Req() req: AuthenticatedRequest
  ): Promise<BarbershopSummary> {
    const barbershop = await this.barbershopService.getBarbershopForActor(
      req.user
    );

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for current user");
    }

    return barbershop;
  }

  @Patch("me")
  @Permissions(Permission.ADMIN)
  async updateMyBarbershop(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateBarbershopDto
  ): Promise<BarbershopSummary> {
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }
    if (dto.address !== undefined) {
      updateData.address = dto.address;
    }
    if (dto.neighborhood !== undefined) {
      updateData.neighborhood = dto.neighborhood;
    }
    if (dto.city !== undefined) {
      updateData.city = dto.city;
    }
    if (dto.state !== undefined) {
      updateData.state = dto.state;
    }
    if (dto.zipCode !== undefined) {
      updateData.zipCode = dto.zipCode;
    }
    if (dto.photoUrl !== undefined) {
      updateData.photoUrl = dto.photoUrl;
    }
    if (dto.opensAt !== undefined) {
      updateData.opensAt = dto.opensAt;
    }
    if (dto.closesAt !== undefined) {
      updateData.closesAt = dto.closesAt;
    }
    if (dto.daysOpen !== undefined) {
      updateData.daysOpen = dto.daysOpen;
    }

    return this.barbershopService.updateBarbershopForOwner(
      req.user.userId,
      updateData as Prisma.BarbershopUpdateInput
    );
  }
}
