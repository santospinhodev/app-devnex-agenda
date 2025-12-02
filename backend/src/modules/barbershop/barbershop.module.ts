import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { BarbershopRepository } from "./repositories/barbershop.repository";
import { BarbershopService } from "./services/barbershop.service";
import { BarbershopController } from "./controllers/barbershop.controller";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";

@Module({
  imports: [PrismaModule],
  controllers: [BarbershopController],
  providers: [
    BarbershopRepository,
    BarbershopService,
    JwtAccessGuard,
    PermissionsGuard,
  ],
  exports: [BarbershopService],
})
export class BarbershopModule {}
