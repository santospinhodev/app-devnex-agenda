import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { UsersModule } from "../users/users.module";
import { BarbershopModule } from "../barbershop/barbershop.module";
import { UserProfilesRepository } from "./repositories/user-profiles.repository";
import { BarbersService } from "./services/barbers.service";
import { ReceptionistsService } from "./services/receptionists.service";
import { CustomersService } from "./services/customers.service";
import { BarbersController } from "./controllers/barbers.controller";
import { ReceptionistsController } from "./controllers/receptionists.controller";
import { CustomersController } from "./controllers/customers.controller";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";

@Module({
  imports: [PrismaModule, UsersModule, BarbershopModule],
  controllers: [
    BarbersController,
    ReceptionistsController,
    CustomersController,
  ],
  providers: [
    UserProfilesRepository,
    BarbersService,
    ReceptionistsService,
    CustomersService,
    JwtAccessGuard,
    PermissionsGuard,
  ],
})
export class UserProfilesModule {}
