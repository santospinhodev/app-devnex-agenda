import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { BarbershopModule } from "../barbershop/barbershop.module";
import { ServicesController } from "./controllers/services.controller";
import { ServicesService } from "./services/services.service";
import { ServicesRepository } from "./repositories/services.repository";

@Module({
  imports: [PrismaModule, BarbershopModule],
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository],
  exports: [ServicesService],
})
export class ServicesModule {}
