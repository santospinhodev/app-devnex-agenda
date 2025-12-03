import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import { AgendaService } from "../services/agenda.service";
import { RequestActor } from "../barber-availability/services/barber-availability.service";
import { GetSlotsQueryDto } from "../dto/get-slots-query.dto";
import { GetDayQueryDto } from "../dto/get-day-query.dto";
import { GetWeekQueryDto } from "../dto/get-week-query.dto";

interface AuthenticatedRequest extends Request {
  user: RequestActor;
}

@Controller("agenda/barber")
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get(":barberId/slots")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  getSlots(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string,
    @Query() query: GetSlotsQueryDto
  ) {
    return this.agendaService.getAvailableSlots(req.user, barberId, query.date);
  }

  @Get(":barberId/day")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  getDayView(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string,
    @Query() query: GetDayQueryDto
  ) {
    return this.agendaService.getDayView(req.user, barberId, query.date);
  }

  @Get(":barberId/week")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  getWeekView(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string,
    @Query() query: GetWeekQueryDto
  ) {
    return this.agendaService.getWeekView(req.user, barberId, query.start);
  }
}
