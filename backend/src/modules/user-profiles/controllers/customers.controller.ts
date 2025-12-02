import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import {
  CustomersService,
  SanitizedCustomerProfile,
} from "../services/customers.service";

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

  @Get(":id")
  getById(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ): Promise<SanitizedCustomerProfile> {
    return this.customersService.getCustomerById(req.user, id);
  }
}
