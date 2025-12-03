import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { BarberAvailabilityModule } from "./barber-availability/barber-availability.module";
import { BarberBlockModule } from "./barber-block/barber-block.module";
import { AgendaController } from "./controllers/agenda.controller";
import { AgendaService } from "./services/agenda.service";
import { AgendaTimelineBuilderService } from "./services/agenda-timeline-builder.service";

@Module({
  imports: [PrismaModule, BarberAvailabilityModule, BarberBlockModule],
  controllers: [AgendaController],
  providers: [
    AgendaService,
    AgendaTimelineBuilderService,
    JwtAccessGuard,
    PermissionsGuard,
  ],
})
export class AgendaModule {}
