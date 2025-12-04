import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/database/prisma.service";
import { RemindersService } from "../../src/modules/notifications/reminders.service";
import { NotificationsService } from "../../src/modules/notifications/notifications.service";
import { AppointmentStatus, Prisma } from "@prisma/client";

const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const prisma = app.get(PrismaService);
  const remindersService = app.get(RemindersService);
  const notificationsService = app.get(NotificationsService);

  const originalSender =
    notificationsService.sendWhatsAppTemplateMessage.bind(notificationsService);
  (
    notificationsService as unknown as {
      sendWhatsAppTemplateMessage: () => Promise<boolean>;
    }
  ).sendWhatsAppTemplateMessage = async () => true;

  const timestamp = Date.now();
  const emailSuffix = `reminder-${timestamp}`;

  let appointmentId: string | null = null;
  let serviceId: string | null = null;
  let barbershopId: string | null = null;
  let ownerId: string | null = null;
  let barberId: string | null = null;
  let customerId: string | null = null;

  try {
    const owner = await prisma.user.create({
      data: {
        email: `${emailSuffix}-owner@example.com`,
        name: "Scheduler Owner",
        phone: "+551100000001",
        hashedPassword: "placeholder",
      },
    });
    ownerId = owner.id;

    const barbershop = await prisma.barbershop.create({
      data: {
        ownerId: owner.id,
        name: "Scheduler Cuts",
        phone: "+551199999999",
      },
    });
    barbershopId = barbershop.id;

    const service = await prisma.service.create({
      data: {
        barbershopId: barbershop.id,
        name: "Reminder Haircut",
        durationMin: 30,
        price: new Prisma.Decimal(120),
      },
    });
    serviceId = service.id;

    const barber = await prisma.user.create({
      data: {
        email: `${emailSuffix}-barber@example.com`,
        name: "Scheduler Barber",
        phone: "+551188888888",
        hashedPassword: "placeholder",
      },
    });
    barberId = barber.id;

    const customer = await prisma.user.create({
      data: {
        email: `${emailSuffix}-customer@example.com`,
        name: "Scheduler Customer",
        phone: "+551177777777",
        hashedPassword: "placeholder",
      },
    });
    customerId = customer.id;

    const reminderHours = Number(process.env.REMINDER_WINDOW_HOURS ?? 24);
    const lookbackMinutes = 3;
    const startAt = new Date(
      Date.now() + reminderHours * 60 * 60 * 1000 - lookbackMinutes * 60000,
    );
    const endAt = new Date(startAt.getTime() + service.durationMin * 60000);

    const appointment = await prisma.appointment.create({
      data: {
        barbershopId: barbershop.id,
        customerId: customer.id,
        barberId: barber.id,
        serviceId: service.id,
        startAt,
        endAt,
        status: AppointmentStatus.CONFIRMED,
        price: service.price,
      },
    });
    appointmentId = appointment.id;

    await prisma.auditLog.deleteMany({
      where: {
        action: "REMINDER_SENT",
        entityId: appointment.id,
      },
    });

    const firstRun = await remindersService.triggerManualRun();
    if (firstRun.sent !== 1) {
      throw new Error(
        `Expected first reminders run to send 1 reminder, got sent=${firstRun.sent}`,
      );
    }

    const logRecord = await prisma.auditLog.findFirst({
      where: {
        action: "REMINDER_SENT",
        entityId: appointment.id,
      },
    });
    if (!logRecord) {
      throw new Error("Reminder ActivityLog entry not found after first run");
    }

    const secondRun = await remindersService.triggerManualRun();
    if (secondRun.sent !== 0 || secondRun.skipped < 1) {
      throw new Error(
        `Expected second run to skip reminder (sent=${secondRun.sent}, skipped=${secondRun.skipped})`,
      );
    }

    console.log(
      `${COLORS.green}PASS${COLORS.reset} Phase6.1 Reminders QA suite`,
    );
  } catch (error) {
    console.error(
      `${COLORS.red}FAIL${COLORS.reset} Phase6.1 Reminders QA suite`,
      (error as Error).message,
    );
    console.error((error as Error).stack);
    process.exitCode = 1;
  } finally {
    (notificationsService as any).sendWhatsAppTemplateMessage = originalSender;

    if (appointmentId) {
      await prisma.auditLog.deleteMany({
        where: { entityId: appointmentId, action: "REMINDER_SENT" },
      });
      await prisma.appointment.deleteMany({ where: { id: appointmentId } });
    }
    if (serviceId) {
      await prisma.service.deleteMany({ where: { id: serviceId } });
    }
    if (barbershopId) {
      await prisma.barbershop.deleteMany({ where: { id: barbershopId } });
    }
    const userIds = [ownerId, barberId, customerId].filter(Boolean) as string[];
    if (userIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

    await app.close();
  }
}

void main();
