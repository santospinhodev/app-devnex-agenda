import {
  Body,
  Controller,
  Get,
  Param,
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
import {
  CustomersService,
  SanitizedCustomerProfile,
} from "../services/customers.service";
import { ListCustomersQueryDto } from "../dto/list-customers-query.dto";
import { CreateCustomerProfileDto } from "../dto/create-customer-profile.dto";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("users/customers")
@UseGuards(JwtAccessGuard, PermissionsGuard)
@Permissions(Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListCustomersQueryDto,
  ): Promise<SanitizedCustomerProfile[]> {
    return this.customersService.listCustomers(req.user, query);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCustomerProfileDto,
  ): Promise<SanitizedCustomerProfile> {
    return this.customersService.createCustomer(req.user, dto);
  }

  @Get(":id")
  getById(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<SanitizedCustomerProfile> {
    return this.customersService.getCustomerById(req.user, id);
  }
}
