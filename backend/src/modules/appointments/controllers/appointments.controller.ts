import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
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
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import { RescheduleAppointmentDto } from "../dto/reschedule-appointment.dto";
import { FinishAppointmentDto } from "../dto/finish-appointment.dto";
import { UpdateAppointmentStatusDto } from "../dto/update-appointment-status.dto";
import { AppointmentsService } from "../services/appointments.service";
import { AppointmentResponse } from "../types/appointment.types";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("agendamentos")
@UseGuards(JwtAccessGuard, PermissionsGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  createAppointment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentResponse> {
    return this.appointmentsService.createAppointment(req.user, dto);
  }

  @Patch(":id")
  @Permissions(Permission.ADMIN, Permission.RECEPTIONIST)
  rescheduleAppointment(
    @Req() req: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponse> {
    return this.appointmentsService.rescheduleAppointment(req.user, id, dto);
  }

  @Patch(":id/cancelar")
  @Permissions(Permission.ADMIN, Permission.RECEPTIONIST)
  cancelAppointment(
    @Req() req: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<AppointmentResponse> {
    return this.appointmentsService.cancelAppointment(req.user, id);
  }

  @Patch(":id/finish")
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  finishAppointment(
    @Req() req: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: FinishAppointmentDto,
  ): Promise<AppointmentResponse> {
    return this.appointmentsService.finishAppointment(req.user, id, dto);
  }

  @Patch(":id/status")
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentResponse> {
    return this.appointmentsService.updateAppointmentStatus(req.user, id, dto);
  }
}
