import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
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
    @Body() dto: CreateAppointmentDto
  ): Promise<AppointmentResponse> {
    return this.appointmentsService.createAppointment(req.user, dto);
  }
}
