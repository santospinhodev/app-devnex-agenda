import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { SendWhatsAppDto } from "./dto/send-whatsapp.dto";

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
    if (!this.hasValidCredentials()) {
      this.logger.warn(
        "Twilio credentials missing. Skipping WhatsApp confirmation message.",
      );
      return;
    }

    const to = this.ensureWhatsAppPrefix(dto.to);
    const body = this.buildMessage(dto);

    const payload = new URLSearchParams();
    payload.append("To", to);
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
      this.logger.log(`WhatsApp confirmation sent via Twilio (sid: ${sid})`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `Failed to send WhatsApp confirmation via Twilio: ${message}`,
      );
      throw error;
    }
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

  private buildMessage(dto: SendWhatsAppDto) {
    return `Olá ${dto.customerName}! Sua reserva na ${dto.barbershopName} está confirmada para ${dto.date} às ${dto.time}. Obrigado!`;
  }

  private buildTwilioUrl() {
    return `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
  }
}
