import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module";
import { UsersRepository } from "./repositories/users.repository";
import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
