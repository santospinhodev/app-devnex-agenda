import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { SendWhatsAppDto } from "./dto/send-whatsapp.dto";
import {
  SendWhatsAppTemplateMessageDto,
  WhatsAppTemplate,
} from "./dto/send-whatsapp-template.dto";

interface TwilioMessageResponse {
  sid?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly accountSid: string | null;
  private readonly authToken: string | null;
  private readonly fromNumber: string | null;

  constructor(private readonly configService: ConfigService) {
    this.accountSid =
      this.configService.get<string>("TWILIO_ACCOUNT_SID") ?? null;
    this.authToken =
      this.configService.get<string>("TWILIO_AUTH_TOKEN") ?? null;
    this.fromNumber =
      this.configService.get<string>("TWILIO_WHATSAPP_FROM") ?? null;
  }

  async sendAppointmentConfirmation(dto: SendWhatsAppDto): Promise<void> {
    await this.sendWhatsAppTemplateMessage({
      to: dto.to,
      template: "APPOINTMENT_CONFIRMATION",
      variables: {
        customerName: dto.customerName,
        barbershopName: dto.barbershopName,
        date: dto.date,
        time: dto.time,
      },
    });
  }

  async sendWhatsAppTemplateMessage(
    dto: SendWhatsAppTemplateMessageDto,
  ): Promise<boolean> {
    const body = this.resolveTemplate(dto.template, dto.variables);
    if (!body) {
      this.logger.warn(
        `Unknown WhatsApp template received: ${dto.template}. Skipping dispatch.`,
      );
      return false;
    }

    return this.dispatchWhatsAppMessage({
      to: dto.to,
      body,
      context: `template:${dto.template}`,
    });
  }

  private async dispatchWhatsAppMessage(params: {
    to: string;
    body: string;
    context: string;
  }): Promise<boolean> {
    if (!this.hasValidCredentials()) {
      this.logger.warn(
        `Twilio credentials missing. Skipping WhatsApp ${params.context} message.`,
      );
      return false;
    }

    const payload = new URLSearchParams();
    payload.append("To", this.ensureWhatsAppPrefix(params.to));
    payload.append("From", this.fromNumber!);
    payload.append("Body", params.body);

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
        `WhatsApp ${params.context} sent via Twilio (sid: ${sid})`,
      );
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `Failed to send WhatsApp ${params.context} via Twilio: ${message}`,
      );
      throw error;
    }
  }

  private resolveTemplate(
    template: WhatsAppTemplate,
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
}
