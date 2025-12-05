import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { BarbershopModule } from "../barbershop/barbershop.module";
import { FinanceService } from "./services/finance.service";
import { FinanceController } from "./controllers/finance.controller";

@Module({
  imports: [PrismaModule, BarbershopModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
