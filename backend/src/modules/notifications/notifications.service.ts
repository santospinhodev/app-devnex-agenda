import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { SendWhatsAppDto } from "./dto/send-whatsapp.dto";
import {
  NotificationJobMetadata,
  SendWhatsAppTemplateMessageDto,
} from "./dto/send-whatsapp-template.dto";
import {
  NOTIFICATIONS_JOB_SEND_WHATSAPP,
  NOTIFICATIONS_QUEUE,
} from "./notifications.constants";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue,
  ) {}

  async sendAppointmentConfirmation(
    dto: SendWhatsAppDto & { metadata?: NotificationJobMetadata },
  ): Promise<boolean> {
    return this.sendWhatsAppTemplateMessage({
      to: dto.to,
      template: "APPOINTMENT_CONFIRMATION",
      variables: {
        customerName: dto.customerName,
        barbershopName: dto.barbershopName,
        date: dto.date,
        time: dto.time,
      },
      metadata: dto.metadata,
    });
  }

  async sendWhatsAppTemplateMessage(
    dto: SendWhatsAppTemplateMessageDto,
  ): Promise<boolean> {
    try {
      const job = await this.notificationsQueue.add(
        NOTIFICATIONS_JOB_SEND_WHATSAPP,
        dto,
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
        },
      );

      this.logger.log(
        `Queued WhatsApp job ${job.id ?? "unknown"} template=${dto.template} appointment=${dto.metadata?.appointmentId ?? "n/a"}`,
      );
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `Failed to enqueue WhatsApp template job (${dto.template}): ${message}`,
      );
      throw error;
    }
  }
}
