import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { BarbershopRepository } from "./repositories/barbershop.repository";
import { BarbershopService } from "./services/barbershop.service";

@Module({
  imports: [PrismaModule],
  providers: [BarbershopRepository, BarbershopService],
  exports: [BarbershopService],
})
export class BarbershopModule {}
