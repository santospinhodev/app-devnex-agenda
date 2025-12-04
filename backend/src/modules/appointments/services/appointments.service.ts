import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { Permission } from "../../../common/enums/permission.enum";
import {
  AuthorizedBarberProfile,
  BarberAvailabilityService,
  RequestActor,
} from "../../agenda/barber-availability/services/barber-availability.service";
import { timeStringToMinutes } from "../../agenda/utils/time.utils";
import { UsersRepository } from "../../users/repositories/users.repository";
import { UserWithRelations } from "../../users/types/user-with-relations.type";
import {
  CreateAppointmentCustomerDto,
  CreateAppointmentDto,
} from "../dto/create-appointment.dto";
import { RescheduleAppointmentDto } from "../dto/reschedule-appointment.dto";
import {
  AppointmentsRepository,
  AppointmentWithRelations,
} from "../repositories/appointments.repository";
import {
  AppointmentResponse,
  AppointmentWithMeta,
} from "../types/appointment.types";

interface NormalizedCustomerPayload {
  name: string;
  phone: string;
  email?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly barberAvailabilityService: BarberAvailabilityService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createAppointment(
    actor: RequestActor,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentResponse> {
    const { profile } =
      await this.barberAvailabilityService.getAuthorizedBarberProfile(
        actor,
        dto.barberId,
        "view",
      );

    if (!this.canManageAppointments(actor, profile)) {
      throw new ForbiddenException(
        "You cannot create appointments for this barber",
      );
    }

    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      select: {
        id: true,
        name: true,
        barbershopId: true,
        durationMin: true,
        price: true,
        deletedAt: true,
      },
    });

    if (!service || service.deletedAt) {
      throw new NotFoundException("Service not found");
    }

    if (service.barbershopId !== profile.barbershopId) {
      throw new ForbiddenException(
        "Service is not available for this barbershop",
      );
    }

    if (service.durationMin <= 0) {
      throw new BadRequestException("Service duration is invalid");
    }

    const appointmentWindow = this.resolveAppointmentWindow(
      dto.date,
      dto.time,
      service.durationMin,
    );

    await this.assertWithinAvailability(
      profile.id,
      appointmentWindow.dayOfWeek,
      appointmentWindow.startMinutes,
      appointmentWindow.endMinutes,
    );

    const notes = dto.notes?.trim() ?? null;

    const appointment = await this.prisma.$transaction(async (tx) => {
      await this.ensureNoBlockConflicts(
        profile.id,
        appointmentWindow.startAt,
        appointmentWindow.endAt,
        tx,
      );

      const customer = await this.resolveCustomer(
        profile.barbershopId,
        dto,
        tx,
      );

      const hasConflict =
        await this.appointmentsRepository.hasAppointmentConflict(
          profile.userId,
          appointmentWindow.startAt,
          appointmentWindow.endAt,
          tx,
        );

      if (hasConflict) {
        throw new BadRequestException("Selected time is no longer available");
      }

      const record = await this.appointmentsRepository.createAppointment(
        {
          barbershop: { connect: { id: profile.barbershopId } },
          barber: { connect: { id: profile.userId } },
          customer: { connect: { id: customer.id } },
          service: { connect: { id: service.id } },
          startAt: appointmentWindow.startAt,
          endAt: appointmentWindow.endAt,
          status: AppointmentStatus.CONFIRMED,
          price: service.price,
          notes,
        },
        tx,
      );

      return this.mapAppointment(record);
    });

    return this.serializeAppointment(appointment);
  }

  async cancelAppointment(
    actor: RequestActor,
    appointmentId: string,
  ): Promise<AppointmentResponse> {
    this.assertFrontDeskPermissions(actor);
    const { appointment } = await this.getAuthorizedAppointment(
      actor,
      appointmentId,
    );

    this.assertAppointmentIsActive(appointment, "cancel");

    const updated = await this.appointmentsRepository.updateAppointment(
      appointment.id,
      { status: AppointmentStatus.CANCELLED },
    );

    return this.serializeAppointment(this.mapAppointment(updated));
  }

  async rescheduleAppointment(
    actor: RequestActor,
    appointmentId: string,
    dto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponse> {
    this.assertFrontDeskPermissions(actor);
    const { appointment, profile } = await this.getAuthorizedAppointment(
      actor,
      appointmentId,
    );

    this.assertAppointmentIsActive(appointment, "reschedule");

    const appointmentWindow = this.resolveAppointmentWindow(
      dto.date,
      dto.time,
      appointment.service.durationMin,
    );

    await this.assertWithinAvailability(
      profile.id,
      appointmentWindow.dayOfWeek,
      appointmentWindow.startMinutes,
      appointmentWindow.endMinutes,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.ensureNoBlockConflicts(
        profile.id,
        appointmentWindow.startAt,
        appointmentWindow.endAt,
        tx,
      );

      const hasConflict =
        await this.appointmentsRepository.hasAppointmentConflict(
          profile.userId,
          appointmentWindow.startAt,
          appointmentWindow.endAt,
          tx,
          appointment.id,
        );

      if (hasConflict) {
        throw new BadRequestException("Selected time is no longer available");
      }

      const record = await this.appointmentsRepository.updateAppointment(
        appointment.id,
        {
          startAt: appointmentWindow.startAt,
          endAt: appointmentWindow.endAt,
        },
        tx,
      );

      return this.mapAppointment(record);
    });

    return this.serializeAppointment(updated);
  }

  async getBarberAppointmentsInRange(
    profile: AuthorizedBarberProfile,
    start: Date,
    end: Date,
  ): Promise<AppointmentWithMeta[]> {
    const records =
      await this.appointmentsRepository.findBarberAppointmentsBetween(
        profile.userId,
        profile.barbershopId,
        start,
        end,
      );
    return records.map((record) => this.mapAppointment(record));
  }

  private canManageAppointments(
    actor: RequestActor,
    profile: AuthorizedBarberProfile,
  ) {
    const permissions = new Set(actor.permissions);
    if (permissions.has(Permission.ADMIN)) {
      return true;
    }
    if (permissions.has(Permission.RECEPTIONIST)) {
      return true;
    }
    return (
      permissions.has(Permission.BARBER) && actor.userId === profile.userId
    );
  }

  private assertFrontDeskPermissions(actor: RequestActor) {
    const permissions = new Set(actor.permissions);
    if (
      permissions.has(Permission.ADMIN) ||
      permissions.has(Permission.RECEPTIONIST)
    ) {
      return;
    }

    throw new ForbiddenException(
      "Only admins or receptionists can manage appointments",
    );
  }

  private async getAuthorizedAppointment(
    actor: RequestActor,
    appointmentId: string,
  ) {
    const appointment =
      await this.appointmentsRepository.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    const barberProfileId = appointment.barber.barberProfile?.id;

    if (!barberProfileId) {
      throw new BadRequestException("Barber profile not found for appointment");
    }

    const { profile } =
      await this.barberAvailabilityService.getAuthorizedBarberProfile(
        actor,
        barberProfileId,
        "view",
      );

    return { appointment, profile };
  }

  private assertAppointmentIsActive(
    appointment: AppointmentWithRelations,
    action: "cancel" | "reschedule",
  ) {
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(
        `Cannot ${action} an appointment that is already cancelled`,
      );
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot ${action} an appointment that is already completed`,
      );
    }

    if (appointment.status === AppointmentStatus.NO_SHOW) {
      throw new BadRequestException(
        `Cannot ${action} an appointment marked as no-show`,
      );
    }
  }

  private resolveAppointmentWindow(
    dateStr: string,
    timeStr: string,
    durationMin: number,
  ) {
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
      throw new BadRequestException("Invalid date format");
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);

    const [hoursStr, minutesStr] = timeStr.split(":");
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    const startAt = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException("Invalid start time");
    }

    const endAt = new Date(startAt.getTime() + durationMin * 60000);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMin;

    return {
      startAt,
      endAt,
      startMinutes,
      endMinutes,
      dayOfWeek: startAt.getUTCDay(),
    };
  }

  private async assertWithinAvailability(
    barberProfileId: string,
    dayOfWeek: number,
    startMinutes: number,
    endMinutes: number,
  ) {
    const availability =
      await this.barberAvailabilityService.findAvailabilityForDay(
        barberProfileId,
        dayOfWeek,
      );

    if (!availability) {
      throw new BadRequestException("Barber does not work on the selected day");
    }

    const availabilityStart = timeStringToMinutes(availability.startTime);
    const availabilityEnd = timeStringToMinutes(availability.endTime);

    if (startMinutes < availabilityStart || endMinutes > availabilityEnd) {
      throw new BadRequestException("Selected time is outside working hours");
    }

    if (availability.lunchStart && availability.lunchEnd) {
      const lunchStart = timeStringToMinutes(availability.lunchStart);
      const lunchEnd = timeStringToMinutes(availability.lunchEnd);
      if (this.overlapsRange(startMinutes, endMinutes, lunchStart, lunchEnd)) {
        throw new BadRequestException("Selected time overlaps lunch break");
      }
    }
  }

  private overlapsRange(
    startA: number,
    endA: number,
    startB: number,
    endB: number,
  ) {
    return startA < endB && endA > startB;
  }

  private async ensureNoBlockConflicts(
    barberProfileId: string,
    startAt: Date,
    endAt: Date,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const conflict = await client.barberBlock.findFirst({
      where: {
        barberProfileId,
        startTime: { lt: endAt },
        endTime: { gt: startAt },
      },
    });

    if (conflict) {
      throw new BadRequestException("Selected time overlaps a blocked period");
    }
  }

  private async resolveCustomer(
    barbershopId: string,
    dto: CreateAppointmentDto,
    tx: Prisma.TransactionClient,
  ): Promise<UserWithRelations> {
    if (dto.customerId) {
      const customer = await this.usersRepository.findById(dto.customerId, tx);

      if (!customer) {
        throw new NotFoundException("Customer not found");
      }

      await this.ensureClientPermission(customer, tx);
      await this.ensureCustomerProfile(customer, barbershopId, undefined, tx);

      return customer;
    }

    if (!dto.customer) {
      throw new BadRequestException(
        "Provide either a customerId or customer details",
      );
    }

    const normalized = this.normalizeCustomerPayload(dto.customer);

    let user = normalized.email
      ? await this.usersRepository.findByEmail(normalized.email, tx)
      : null;

    if (!user && normalized.phone) {
      user = await this.usersRepository.findFirstByPhone(normalized.phone, tx);
    }

    if (user) {
      user = await this.usersRepository.updateUser(
        user.id,
        {
          name: normalized.name,
          phone: normalized.phone,
        },
        tx,
      );
    } else {
      user = await this.createCustomerUser(normalized, barbershopId, tx);
    }

    await this.ensureClientPermission(user, tx);
    await this.ensureCustomerProfile(user, barbershopId, normalized, tx);

    return user;
  }

  private normalizeCustomerPayload(
    payload: CreateAppointmentCustomerDto,
  ): NormalizedCustomerPayload {
    const name = payload?.name?.trim();
    const phoneDigits = payload?.phone?.replace(/\D/g, "");
    const email = payload?.email?.trim().toLowerCase();

    if (!name) {
      throw new BadRequestException("Customer name is required");
    }

    if (!phoneDigits) {
      throw new BadRequestException("Customer phone is required");
    }

    return {
      name,
      phone: phoneDigits,
      email: email && email.length > 0 ? email : undefined,
    };
  }

  private async createCustomerUser(
    payload: NormalizedCustomerPayload,
    barbershopId: string,
    tx: Prisma.TransactionClient,
  ) {
    const email =
      payload.email ?? this.generateCustomerEmail(payload.phone, barbershopId);

    return this.usersRepository.createUser(
      {
        email,
        name: payload.name,
        phone: payload.phone,
        isActive: true,
      },
      tx,
    );
  }

  private generateCustomerEmail(phone: string, barbershopId: string) {
    const shopFragment = barbershopId.slice(0, 8);
    const timestampFragment = Date.now().toString(36);
    return `customer-${phone}-${shopFragment}-${timestampFragment}@clientes.devnex`;
  }

  private async ensureClientPermission(
    user: UserWithRelations,
    tx: Prisma.TransactionClient,
  ) {
    const alreadyClient = user.permissions.some(
      (relation) => relation.permission.name === Permission.CLIENT,
    );

    if (alreadyClient) {
      return;
    }

    const permission = await this.usersRepository.upsertPermission(
      Permission.CLIENT,
      tx,
    );

    await this.usersRepository.attachPermissionToUser(
      user.id,
      permission.id,
      tx,
    );
  }

  private async ensureCustomerProfile(
    user: UserWithRelations,
    barbershopId: string,
    payload: NormalizedCustomerPayload | undefined,
    tx: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const profile = await client.customerProfile.findUnique({
      where: { id: user.id },
    });

    const profileName = payload?.name ?? user.name ?? undefined;
    const profilePhone = payload?.phone ?? user.phone;
    const resolvedName = profileName ?? "Cliente";

    if (!profilePhone) {
      throw new BadRequestException("Customer phone is required");
    }

    if (profile && profile.barbershopId !== barbershopId) {
      throw new ForbiddenException(
        "Customer already belongs to another barbershop",
      );
    }

    if (profile) {
      await client.customerProfile.update({
        where: { id: user.id },
        data: {
          name: resolvedName,
          phone: profilePhone,
        },
      });
      return;
    }

    await client.customerProfile.create({
      data: {
        id: user.id,
        barbershopId,
        name: resolvedName,
        phone: profilePhone,
      },
    });
  }

  private mapAppointment(
    record: AppointmentWithRelations,
  ): AppointmentWithMeta {
    return {
      id: record.id,
      startAt: record.startAt,
      endAt: record.endAt,
      status: record.status,
      notes: record.notes ?? null,
      service: {
        id: record.service.id,
        name: record.service.name,
        durationMin: record.service.durationMin,
        price: record.service.price.toString(),
      },
      customer: {
        id: record.customer.id,
        name: record.customer.name ?? null,
        phone: record.customer.phone ?? null,
      },
    };
  }

  private serializeAppointment(
    appointment: AppointmentWithMeta,
  ): AppointmentResponse {
    return {
      id: appointment.id,
      startAt: appointment.startAt.toISOString(),
      endAt: appointment.endAt.toISOString(),
      status: appointment.status,
      notes: appointment.notes,
      service: appointment.service,
      customer: appointment.customer,
    };
  }
}
