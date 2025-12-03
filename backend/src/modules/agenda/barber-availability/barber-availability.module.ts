import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../database/prisma.module";
import { BarbershopModule } from "../../barbershop/barbershop.module";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { BarberAvailabilityController } from "./controllers/barber-availability.controller";
import { BarberAvailabilityRepository } from "./repositories/barber-availability.repository";
import { BarberAvailabilityService } from "./services/barber-availability.service";

@Module({
  imports: [PrismaModule, BarbershopModule],
  controllers: [BarberAvailabilityController],
  providers: [
    BarberAvailabilityRepository,
    BarberAvailabilityService,
    JwtAccessGuard,
    PermissionsGuard,
  ],
  exports: [BarberAvailabilityService],
})
export class BarberAvailabilityModule {}
