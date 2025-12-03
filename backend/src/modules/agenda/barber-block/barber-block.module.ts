import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../database/prisma.module";
import { BarbershopModule } from "../../barbershop/barbershop.module";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { BarberBlockController } from "./controllers/barber-block.controller";
import { BarberBlockRepository } from "./repositories/barber-block.repository";
import { BarberBlockService } from "./services/barber-block.service";

@Module({
  imports: [PrismaModule, BarbershopModule],
  controllers: [BarberBlockController],
  providers: [
    BarberBlockRepository,
    BarberBlockService,
    JwtAccessGuard,
    PermissionsGuard,
  ],
  exports: [BarberBlockService],
})
export class BarberBlockModule {}
