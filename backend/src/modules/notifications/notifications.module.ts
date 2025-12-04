import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationsService } from "./notifications.service";
import { RemindersService } from "./reminders.service";
import { RemindersController } from "./controllers/reminders.controller";

@Module({
  imports: [ConfigModule],
  controllers: [RemindersController],
  providers: [NotificationsService, RemindersService],
  exports: [NotificationsService, RemindersService],
})
export class NotificationsModule {}
