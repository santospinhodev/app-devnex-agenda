import { Injectable } from "@nestjs/common";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

const appointmentWithRelations =
  Prisma.validator<Prisma.AppointmentDefaultArgs>()({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          durationMin: true,
          price: true,
        },
      },
      barber: {
        select: {
          id: true,
          barberProfile: {
            select: {
              id: true,
              barbershopId: true,
            },
          },
        },
      },
    },
  });

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<
  typeof appointmentWithRelations
>;

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findBarberAppointmentsBetween(
    barberUserId: string,
    barbershopId: string,
    start: Date,
    end: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<AppointmentWithRelations[]> {
    const client = this.getClient(tx);
    return client.appointment.findMany({
      where: {
        barberId: barberUserId,
        barbershopId,
        startAt: { gte: start, lt: end },
        deletedAt: null,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
      orderBy: { startAt: "asc" },
      include: appointmentWithRelations.include,
    });
  }

  hasAppointmentConflict(
    barberUserId: string,
    start: Date,
    end: Date,
    tx?: Prisma.TransactionClient,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const client = this.getClient(tx);
    return client.appointment
      .count({
        where: {
          barberId: barberUserId,
          deletedAt: null,
          status: {
            notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
          },
          startAt: { lt: end },
          endAt: { gt: start },
          ...(excludeAppointmentId
            ? { id: { not: excludeAppointmentId } }
            : {}),
        },
      })
      .then((count) => count > 0);
  }

  createAppointment(
    data: Prisma.AppointmentCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = this.getClient(tx);
    return client.appointment.create({
      data,
      include: appointmentWithRelations.include,
    });
  }

  findById(id: string, tx?: Prisma.TransactionClient) {
    const client = this.getClient(tx);
    return client.appointment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: appointmentWithRelations.include,
    });
  }

  updateAppointment(
    id: string,
    data: Prisma.AppointmentUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = this.getClient(tx);
    return client.appointment.update({
      where: { id },
      data,
      include: appointmentWithRelations.include,
    });
  }
}
