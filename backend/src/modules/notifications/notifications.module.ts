import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { NotificationsService } from "./notifications.service";
import { RemindersService } from "./reminders.service";
import { RemindersController } from "./controllers/reminders.controller";
import { NotificationsProcessor } from "./notifications.processor";
import { NOTIFICATIONS_QUEUE } from "./notifications.constants";

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),
  ],
  controllers: [RemindersController],
  providers: [NotificationsService, RemindersService, NotificationsProcessor],
  exports: [NotificationsService, RemindersService],
})
export class NotificationsModule {}
