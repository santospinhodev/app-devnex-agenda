import { randomUUID } from "crypto";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { AppointmentStatus } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { NotificationsService } from "./notifications.service";
import { NotificationJobMetadata } from "./dto/send-whatsapp-template.dto";

const REMINDER_CRON_PATTERN =
  process.env.REMINDER_CRON_PATTERN &&
  process.env.REMINDER_CRON_PATTERN.trim().length > 0
    ? process.env.REMINDER_CRON_PATTERN
    : "*/5 * * * *";

const REMINDER_ACTION = "REMINDER_SENT";
const REMINDER_ENTITY = "AppointmentReminder";
const REMINDER_TYPE = "24h";
const LOOKBACK_MINUTES = 5;

export interface RemindersScanSummary {
  found: number;
  sent: number;
  skipped: number;
  errors: number;
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(REMINDER_CRON_PATTERN, { timeZone: "UTC" })
  async handleCron() {
    await this.scanAndSendReminders("cron");
  }

  async triggerManualRun(): Promise<RemindersScanSummary> {
    return this.scanAndSendReminders("manual");
  }

  private async scanAndSendReminders(
    source: "cron" | "manual",
  ): Promise<RemindersScanSummary> {
    if (!this.isEnabled()) {
      this.logger.debug(
        `Reminders scheduler disabled. Source=${source} skipping execution.`,
      );
      return { found: 0, sent: 0, skipped: 0, errors: 0 };
    }

    const windowHours = this.getWindowHours();
    const now = new Date();
    const target = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
    const windowStart = new Date(
      Math.max(now.getTime(), target.getTime() - LOOKBACK_MINUTES * 60000),
    );
    const windowEnd = target;

    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.CONFIRMED,
        startAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      select: {
        id: true,
        startAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        barbershop: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { startAt: "asc" },
    });

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const appointment of appointments) {
      if (!appointment.customer?.phone) {
        skipped += 1;
        continue;
      }

      const logPayload = this.buildLogPayload(appointment.id);
      const existingLog = await this.prisma.auditLog.findFirst({
        where: {
          action: REMINDER_ACTION,
          entity: REMINDER_ENTITY,
          entityId: appointment.id,
          changes: {
            equals: logPayload,
          },
        },
      });

      if (existingLog) {
        skipped += 1;
        continue;
      }

      const schedule = this.formatSchedule(appointment.startAt);
      const metadata = this.buildReminderMetadata(appointment.id, source);

      try {
        const delivered =
          await this.notificationsService.sendWhatsAppTemplateMessage({
            to: appointment.customer.phone,
            template: "APPOINTMENT_REMINDER_24H",
            variables: {
              customerName: appointment.customer.name ?? "Cliente",
              barbershopName: appointment.barbershop?.name ?? "Sua barbearia",
              date: schedule.date,
              time: schedule.time,
            },
            metadata,
          });

        if (!delivered) {
          skipped += 1;
          continue;
        }

        await this.prisma.auditLog.create({
          data: {
            action: REMINDER_ACTION,
            entity: REMINDER_ENTITY,
            entityId: appointment.id,
            changes: logPayload,
          },
        });

        sent += 1;
      } catch (error) {
        errors += 1;
        const message =
          error instanceof Error ? error.message : JSON.stringify(error);
        this.logger.error(
          `Failed to send reminder for appointment ${appointment.id}: ${message}`,
        );
      }
    }

    const summary = {
      found: appointments.length,
      sent,
      skipped,
      errors,
    };

    this.logger.log(
      `Reminder scan (${source}) => found=${summary.found}, sent=${summary.sent}, skipped=${summary.skipped}, errors=${summary.errors}`,
    );

    return summary;
  }

  private isEnabled() {
    const flag = this.configService.get<string>("REMINDERS_ENABLED");
    if (typeof flag === "undefined") {
      return true;
    }
    return flag.toString().toLowerCase() !== "false";
  }

  private getWindowHours() {
    const raw = this.configService.get<string>("REMINDER_WINDOW_HOURS");
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 24;
  }

  private formatSchedule(date: Date) {
    const iso = date.toISOString();
    return {
      date: iso.slice(0, 10),
      time: iso.slice(11, 16),
    };
  }

  private buildLogPayload(appointmentId: string) {
    return {
      appointmentId,
      type: REMINDER_TYPE,
      description: JSON.stringify({ appointmentId, type: REMINDER_TYPE }),
    };
  }

  private buildReminderMetadata(
    appointmentId: string,
    source: "cron" | "manual",
  ): NotificationJobMetadata {
    return {
      appointmentId,
      source: `reminder-${source}`,
      correlationId: `reminder-${source}:${appointmentId}:${randomUUID()}`,
    };
  }
}
