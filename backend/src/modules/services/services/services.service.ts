import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Service } from "@prisma/client";
import {
  BarbershopService,
  RequestActor as BarbershopRequestActor,
} from "../../barbershop/services/barbershop.service";
import { Permission } from "../../../common/enums/permission.enum";
import { ServicesRepository } from "../repositories/services.repository";
import { CreateServiceDto } from "../dto/create-service.dto";
import { UpdateServiceDto } from "../dto/update-service.dto";
import { ListServicesQueryDto } from "../dto/list-services-query.dto";

export interface ServicesRequestActor {
  userId: string;
  permissions: Permission[];
}

export interface ServiceResponse {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: string;
  commissionPercentage: number | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ServicesService {
  constructor(
    private readonly barbershopService: BarbershopService,
    private readonly servicesRepository: ServicesRepository,
  ) {}

  async list(
    actor: ServicesRequestActor,
    query: ListServicesQueryDto,
  ): Promise<ServiceResponse[]> {
    this.ensureCanView(actor);
    const barbershop = await this.ensureBarbershop(actor);
    const records = await this.servicesRepository.findManyByBarbershop({
      barbershopId: barbershop.id,
      name: query.name,
    });

    return records.map((record) => this.sanitize(record));
  }

  async create(
    actor: ServicesRequestActor,
    dto: CreateServiceDto,
  ): Promise<ServiceResponse> {
    this.ensureCanManage(actor);
    const barbershop = await this.ensureBarbershop(actor);

    const price = this.parseMoney(dto.price);

    const service = await this.servicesRepository.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      durationMin: dto.durationMin,
      price,
      commissionPercentage: dto.commissionPercentage ?? null,
      barbershop: {
        connect: { id: barbershop.id },
      },
    });

    return this.sanitize(service);
  }

  async update(
    actor: ServicesRequestActor,
    serviceId: string,
    dto: UpdateServiceDto,
  ): Promise<ServiceResponse> {
    this.ensureCanManage(actor);
    const service = await this.ensureOwnedService(actor, serviceId);

    const data: Prisma.ServiceUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      data.description = dto.description.trim() || null;
    }

    if (dto.durationMin !== undefined) {
      data.durationMin = dto.durationMin;
    }

    if (dto.price !== undefined) {
      data.price = this.parseMoney(dto.price);
    }

    if (dto.commissionPercentage !== undefined) {
      data.commissionPercentage = dto.commissionPercentage;
    }

    const updated = await this.servicesRepository.update(service.id, data);
    return this.sanitize(updated);
  }

  async softDelete(
    actor: ServicesRequestActor,
    serviceId: string,
  ): Promise<void> {
    this.ensureCanManage(actor);
    const service = await this.ensureOwnedService(actor, serviceId);
    await this.servicesRepository.update(service.id, {
      deletedAt: new Date(),
    });
  }

  private async ensureOwnedService(actor: ServicesRequestActor, id: string) {
    const barbershop = await this.ensureBarbershop(actor);
    const service = await this.servicesRepository.findById(id);

    if (!service || service.barbershopId !== barbershop.id) {
      throw new NotFoundException("Service not found");
    }

    return service;
  }

  private ensureCanView(actor: ServicesRequestActor) {
    const allowed = new Set(actor.permissions);
    if (
      !(
        allowed.has(Permission.ADMIN) ||
        allowed.has(Permission.BARBER) ||
        allowed.has(Permission.RECEPTIONIST)
      )
    ) {
      throw new ForbiddenException("You do not have access to services");
    }
  }

  private ensureCanManage(actor: ServicesRequestActor) {
    const allowed = new Set(actor.permissions);
    if (!allowed.has(Permission.ADMIN)) {
      throw new ForbiddenException("Only admins can manage services");
    }
  }

  private async ensureBarbershop(actor: ServicesRequestActor) {
    const barbershop = await this.barbershopService.getBarbershopForActor(
      actor as BarbershopRequestActor,
    );

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for this user");
    }

    return barbershop;
  }

  private parseMoney(raw: string) {
    try {
      const value = new Prisma.Decimal(raw);
      if (value.lte(0)) {
        throw new BadRequestException("price must be greater than zero");
      }
      return value;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Invalid monetary value");
    }
  }

  private sanitize(service: Service): ServiceResponse {
    return {
      id: service.id,
      name: service.name,
      description: service.description ?? null,
      durationMin: service.durationMin,
      price: service.price.toString(),
      commissionPercentage: service.commissionPercentage ?? null,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }
}
