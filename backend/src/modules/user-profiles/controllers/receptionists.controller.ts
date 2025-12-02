import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import {
  ReceptionistsService,
  SanitizedReceptionistProfile,
} from "../services/receptionists.service";
import { CreateReceptionistDto } from "../dto/create-receptionist.dto";
import { UpdateReceptionistDto } from "../dto/update-receptionist.dto";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("users/receptionists")
@UseGuards(JwtAccessGuard, PermissionsGuard)
@Permissions(Permission.ADMIN)
export class ReceptionistsController {
  constructor(private readonly receptionistsService: ReceptionistsService) {}

  @Get()
  list(
    @Req() req: AuthenticatedRequest
  ): Promise<SanitizedReceptionistProfile[]> {
    return this.receptionistsService.listForOwner(req.user.userId);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReceptionistDto
  ): Promise<SanitizedReceptionistProfile> {
    return this.receptionistsService.createReceptionist(req.user.userId, dto);
  }

  @Patch(":id")
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateReceptionistDto
  ): Promise<SanitizedReceptionistProfile> {
    return this.receptionistsService.updateReceptionist(
      req.user.userId,
      id,
      dto
    );
  }
}
