import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAccessGuard } from "../../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../../common/guards/permissions.guard";
import { Permissions } from "../../../../common/decorators/permissions.decorator";
import { Permission } from "../../../../common/enums/permission.enum";
import {
  BarberBlockService,
  RequestActor,
} from "../services/barber-block.service";
import { CreateBarberBlockDto } from "../dto/create-barber-block.dto";
import { GetBarberBlocksQueryDto } from "../dto/get-barber-blocks-query.dto";

interface AuthenticatedRequest extends Request {
  user: RequestActor;
}

@Controller("agenda/barber")
export class BarberBlockController {
  private readonly logger = new Logger(BarberBlockController.name);

  constructor(private readonly barberBlockService: BarberBlockService) {}

  @Post(":barberId/blocks")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER)
  createBlock(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string,
    @Body() dto: CreateBarberBlockDto
  ) {
    this.logger.log(
      `Creating block for barber=${barberId} by user=${req.user.userId}`
    );
    return this.barberBlockService.createBlock(req.user, barberId, dto);
  }

  @Get(":barberId/blocks")
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  listBlocks(
    @Req() req: AuthenticatedRequest,
    @Param("barberId") barberId: string,
    @Query() query: GetBarberBlocksQueryDto
  ) {
    this.logger.log(
      `Fetching blocks for barber=${barberId} date=${query.date}`
    );
    return this.barberBlockService.getBlocksForDay(req.user, barberId, query);
  }
}
