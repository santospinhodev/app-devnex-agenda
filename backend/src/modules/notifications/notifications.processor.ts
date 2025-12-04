import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { Job } from "bullmq";
import { SendWhatsAppTemplateMessageDto } from "./dto/send-whatsapp-template.dto";
import {
  NOTIFICATIONS_JOB_SEND_WHATSAPP,
  NOTIFICATIONS_QUEUE,
} from "./notifications.constants";

interface TwilioMessageResponse {
  sid?: string;
}

@Injectable()
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private readonly accountSid: string | null;
  private readonly authToken: string | null;
  private readonly fromNumber: string | null;

  constructor(private readonly configService: ConfigService) {
    super();
    this.accountSid =
      this.configService.get<string>("TWILIO_ACCOUNT_SID") ?? null;
    this.authToken =
      this.configService.get<string>("TWILIO_AUTH_TOKEN") ?? null;
    this.fromNumber =
      this.configService.get<string>("TWILIO_WHATSAPP_FROM") ?? null;
  }

  @OnWorkerEvent("active")
  handleActive(job: Job) {
    this.logger.debug(
      `Processing notifications job id=${job.id} name=${job.name} attemptsMade=${job.attemptsMade}`,
    );
  }

  @OnWorkerEvent("completed")
  handleCompleted(job: Job, result: unknown) {
    this.logger.debug(
      `Completed notifications job id=${job.id} name=${job.name} result=${JSON.stringify(result)}`,
    );
  }

  @OnWorkerEvent("failed")
  handleFailed(job: Job, error: Error) {
    this.logger.error(
      `Notifications job failed id=${job.id} name=${job.name} attemptsMade=${job.attemptsMade}: ${error.message}`,
    );
  }

  async process(job: Job<SendWhatsAppTemplateMessageDto>): Promise<boolean> {
    if (!this.hasValidCredentials()) {
      const metadata = this.formatMetadata(job.data.metadata);
      this.logger.warn(
        `Twilio credentials missing. Skipping WhatsApp job id=${job.id} template=${job.data.template} ${metadata}`,
      );
      throw new Error("Twilio credentials not configured");
    }

    const body = this.resolveTemplate(job.data.template, job.data.variables);
    if (!body) {
      this.logger.warn(
        `Unknown WhatsApp template received for job id=${job.id}: ${job.data.template}`,
      );
      return false;
    }

    if (job.name !== NOTIFICATIONS_JOB_SEND_WHATSAPP) {
      this.logger.warn(
        `Unknown notifications job received id=${job.id} name=${job.name}`,
      );
      return false;
    }

    return this.dispatchWhatsAppMessage(job, body);
  }

  private async dispatchWhatsAppMessage(
    job: Job<SendWhatsAppTemplateMessageDto>,
    body: string,
  ) {
    const payload = new URLSearchParams();
    payload.append("To", this.ensureWhatsAppPrefix(job.data.to));
    payload.append("From", this.fromNumber!);
    payload.append("Body", body);

    try {
      const response = await axios.post<TwilioMessageResponse>(
        this.buildTwilioUrl(),
        payload,
        {
          auth: {
            username: this.accountSid!,
            password: this.authToken!,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const sid = response.data?.sid ?? "unknown";
      this.logger.log(
        `WhatsApp template dispatched via Twilio sid=${sid} job=${job.id} template=${job.data.template} ${this.formatMetadata(job.data.metadata)}`,
      );
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `Failed to dispatch WhatsApp template job=${job.id} template=${job.data.template}: ${message}`,
      );
      throw error;
    }
  }

  private resolveTemplate(
    template: SendWhatsAppTemplateMessageDto["template"],
    variables: Record<string, string>,
  ) {
    const customerName = variables.customerName ?? "Cliente";
    const barbershopName = variables.barbershopName ?? "sua barbearia";
    const date = variables.date ?? "data";
    const time = variables.time ?? "horário";

    if (template === "APPOINTMENT_CONFIRMATION") {
      return `Olá ${customerName}! Sua reserva na ${barbershopName} está confirmada para ${date} às ${time}. Obrigado!`;
    }

    if (template === "APPOINTMENT_REMINDER_24H") {
      return `Olá ${customerName}! Este é um lembrete da ${barbershopName}. Seu horário está marcado para ${date} às ${time}. Responda se precisar reagendar.`;
    }

    return null;
  }

  private hasValidCredentials() {
    return Boolean(this.accountSid && this.authToken && this.fromNumber);
  }

  private ensureWhatsAppPrefix(target: string) {
    const trimmed = target.trim();
    if (trimmed.startsWith("whatsapp:")) {
      return trimmed;
    }

    if (trimmed.startsWith("+")) {
      return `whatsapp:${trimmed}`;
    }

    return `whatsapp:+${trimmed}`;
  }

  private buildTwilioUrl() {
    return `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
  }

  private formatMetadata(metadata: SendWhatsAppTemplateMessageDto["metadata"]) {
    if (!metadata) {
      return "metadata=none";
    }

    return `metadata=${JSON.stringify(metadata)}`;
  }
}
