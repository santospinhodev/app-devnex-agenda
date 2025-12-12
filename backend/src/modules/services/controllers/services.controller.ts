import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { ServicesService } from "../services/services.service";
import { CreateServiceDto } from "../dto/create-service.dto";
import { UpdateServiceDto } from "../dto/update-service.dto";
import { ListServicesQueryDto } from "../dto/list-services-query.dto";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("services")
@UseGuards(JwtAccessGuard, PermissionsGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
  list(@Req() req: AuthenticatedRequest, @Query() query: ListServicesQueryDto) {
    return this.servicesService.list(req.user, query);
  }

  @Post()
  @Permissions(Permission.ADMIN)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(req.user, dto);
  }

  @Patch(":id")
  @Permissions(Permission.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(req.user, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @Permissions(Permission.ADMIN)
  remove(
    @Req() req: AuthenticatedRequest,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return this.servicesService.softDelete(req.user, id);
  }
}
