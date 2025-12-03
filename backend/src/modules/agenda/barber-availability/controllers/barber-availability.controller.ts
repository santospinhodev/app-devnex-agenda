import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAccessGuard } from "../../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../../common/guards/permissions.guard";
import { Permissions } from "../../../../common/decorators/permissions.decorator";
import { Permission } from "../../../../common/enums/permission.enum";
import {
  BarberAvailabilityService,
  RequestActor,
} from "../services/barber-availability.service";
import { UpsertBarberAvailabilityDto } from "../dto/upsert-barber-availability.dto";

interface AuthenticatedRequest extends Request {
  user: RequestActor;
}

@Controller("agenda/barber")
export class BarberAvailabilityController {
  constructor(
    private readonly barberAvailabilityService: BarberAvailabilityService
  ) {}

  @Get(":barberId/availability")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  getAvailability(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string
  ) {
    return this.barberAvailabilityService.getAvailability(req.user, barberId);
  }

  @Post(":barberId/availability")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER)
  upsertAvailability(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string,
    @Body() dto: UpsertBarberAvailabilityDto
  ) {
    return this.barberAvailabilityService.upsertAvailability(
      req.user,
      barberId,
      dto
    );
  }
}
