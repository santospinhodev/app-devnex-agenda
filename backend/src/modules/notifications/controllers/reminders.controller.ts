import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAccessGuard } from "../../../common/guards/jwt-access.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { Permission } from "../../../common/enums/permission.enum";
import { RemindersScanSummary, RemindersService } from "../reminders.service";

@Controller("notifications/reminders")
@UseGuards(JwtAccessGuard, PermissionsGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post("trigger-manual")
  @Permissions(Permission.ADMIN)
  triggerManual(): Promise<RemindersScanSummary> {
    return this.remindersService.triggerManualRun();
  }
}
