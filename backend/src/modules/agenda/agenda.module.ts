import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { BarberAvailabilityModule } from "./barber-availability/barber-availability.module";
import { AgendaController } from "./controllers/agenda.controller";
import { AgendaService } from "./services/agenda.service";

@Module({
  imports: [PrismaModule, BarberAvailabilityModule],
  controllers: [AgendaController],
  providers: [AgendaService, JwtAccessGuard, PermissionsGuard],
})
export class AgendaModule {}
