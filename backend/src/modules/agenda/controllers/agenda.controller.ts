import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import { AgendaService } from "../services/agenda.service";
import { AgendaTimelineBuilderService } from "../services/agenda-timeline-builder.service";
import { RequestActor } from "../barber-availability/services/barber-availability.service";
import { GetSlotsQueryDto } from "../dto/get-slots-query.dto";
import { GetDayQueryDto } from "../dto/get-day-query.dto";
import { GetWeekQueryDto } from "../dto/get-week-query.dto";
import { FinalDayQueryDto } from "../dto/final-day-query.dto";
import { FinalWeekQueryDto } from "../dto/final-week-query.dto";

interface AuthenticatedRequest extends Request {
  user: RequestActor;
}

@Controller("agenda/barber")
export class AgendaController {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly timelineBuilder: AgendaTimelineBuilderService
  ) {}

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

  @Get(":barberId/final/day")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  getFinalDay(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string,
    @Query() query: FinalDayQueryDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const generatedAt = new Date().toISOString();
    res.setHeader("X-Generated-At", generatedAt);
    return this.timelineBuilder.buildFinalDayTimeline(
      req.user,
      barberId,
      query.date
    );
  }

  @Get(":barberId/final/week")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  getFinalWeek(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string,
    @Query() query: FinalWeekQueryDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const generatedAt = new Date().toISOString();
    res.setHeader("X-Generated-At", generatedAt);
    return this.timelineBuilder.buildFinalWeekTimeline(
      req.user,
      barberId,
      query.start
    );
  }
}
