export type WhatsAppTemplate =
  | "APPOINTMENT_CONFIRMATION"
  | "APPOINTMENT_REMINDER_24H";

export interface NotificationJobMetadata {
  appointmentId?: string;
  correlationId?: string;
  source?: string;
}

export interface SendWhatsAppTemplateMessageDto {
  to: string;
  template: WhatsAppTemplate;
  variables: Record<string, string>;
  metadata?: NotificationJobMetadata;
}
