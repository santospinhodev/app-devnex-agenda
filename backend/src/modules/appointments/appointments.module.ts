import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { BarberAvailabilityModule } from "../agenda/barber-availability/barber-availability.module";
import { UsersModule } from "../users/users.module";
import { AppointmentsController } from "./controllers/appointments.controller";
import { AppointmentsService } from "./services/appointments.service";
import { AppointmentsRepository } from "./repositories/appointments.repository";
import { NotificationsModule } from "../notifications/notifications.module";
import { FinanceModule } from "../finance/finance.module";

@Module({
  imports: [
    PrismaModule,
    BarberAvailabilityModule,
    UsersModule,
    NotificationsModule,
    FinanceModule,
  ],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentsRepository,
    JwtAccessGuard,
    PermissionsGuard,
  ],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
