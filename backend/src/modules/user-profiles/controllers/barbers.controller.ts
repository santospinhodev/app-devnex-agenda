import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import {
  BarbersService,
  SanitizedBarberProfile,
} from "../services/barbers.service";
import { CreateBarberProfileDto } from "../dto/create-barber-profile.dto";
import { UpdateBarberProfileDto } from "../dto/update-barber-profile.dto";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("users/barbers")
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  @Get()
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.RECEPTIONIST)
  list(@Req() req: AuthenticatedRequest): Promise<SanitizedBarberProfile[]> {
    return this.barbersService.listForActor(req.user);
  }

  @Get(":id")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  getById(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ): Promise<SanitizedBarberProfile> {
    return this.barbersService.getById(req.user, id);
  }

  @Post()
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateBarberProfileDto
  ): Promise<SanitizedBarberProfile> {
    return this.barbersService.createBarber(req.user.userId, dto);
  }

  @Patch(":id")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER)
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateBarberProfileDto
  ): Promise<SanitizedBarberProfile> {
    return this.barbersService.updateBarber(id, dto, req.user);
  }
}
