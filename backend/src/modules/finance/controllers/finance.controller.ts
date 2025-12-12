import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import { FinanceService } from "../services/finance.service";
import { GetDailyCashQueryDto } from "../dto/get-daily-cash-query.dto";
import { CreateManualTransactionDto } from "../dto/create-manual-transaction.dto";
import { GetMonthlyCashQueryDto } from "../dto/get-monthly-cash-query.dto";
import { GetBarberBalanceQueryDto } from "../dto/get-barber-balance-query.dto";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("finance")
@UseGuards(JwtAccessGuard, PermissionsGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("daily")
  @Permissions(Permission.ADMIN, Permission.RECEPTIONIST)
  getDailyCashSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetDailyCashQueryDto,
  ) {
    return this.financeService.getDailyCashSummary(req.user, query.date);
  }

  @Get("monthly")
  @Permissions(Permission.ADMIN)
  getMonthlyCashSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetMonthlyCashQueryDto,
  ) {
    return this.financeService.getMonthlyCashSummary(req.user, query.month);
  }

  @Post("transaction")
  @Permissions(Permission.ADMIN, Permission.RECEPTIONIST)
  createManualTransaction(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateManualTransactionDto,
  ) {
    return this.financeService.createManualTransaction(req.user, body);
  }

  @Get("balance")
  @Permissions(Permission.BARBER)
  getBarberBalance(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetBarberBalanceQueryDto,
  ) {
    return this.financeService.getBarberBalance(req.user, query.month);
  }
}
