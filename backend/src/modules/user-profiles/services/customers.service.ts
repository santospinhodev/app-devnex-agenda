import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BarbershopService,
  RequestActor as BarbershopRequestActor,
} from "../../barbershop/services/barbershop.service";
import { UserProfilesRepository } from "../repositories/user-profiles.repository";
import { CustomerProfileWithBarbershop } from "../types/profile-with-user.types";
import { Permission } from "../../../common/enums/permission.enum";
import { ListCustomersQueryDto } from "../dto/list-customers-query.dto";
import { CreateCustomerProfileDto } from "../dto/create-customer-profile.dto";

export interface RequestActor {
  userId: string;
  permissions: Permission[];
}

export interface SanitizedCustomerProfile {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string | null;
  barbershop: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CustomersService {
  constructor(
    private readonly barbershopService: BarbershopService,
    private readonly userProfilesRepository: UserProfilesRepository,
  ) {}

  async listCustomers(
    actor: RequestActor,
    query: ListCustomersQueryDto,
  ): Promise<SanitizedCustomerProfile[]> {
    this.ensureCanAccess(actor);
    const barbershop = await this.getBarbershop(actor);
    const customers =
      await this.userProfilesRepository.findCustomersByBarbershop(
        barbershop.id,
        query.search,
      );
    return customers.map((profile) => this.sanitize(profile));
  }

  async createCustomer(
    actor: RequestActor,
    dto: CreateCustomerProfileDto,
  ): Promise<SanitizedCustomerProfile> {
    this.ensureCanAccess(actor);
    const barbershop = await this.getBarbershop(actor);
    const profile = await this.userProfilesRepository.createCustomerProfile({
      name: dto.name.trim(),
      phone: dto.phone.trim(),
      barbershop: {
        connect: { id: barbershop.id },
      },
    });
    return this.sanitize(profile);
  }

  async getCustomerById(
    actor: RequestActor,
    profileId: string,
  ): Promise<SanitizedCustomerProfile> {
    this.ensureCanAccess(actor);
    const barbershop = await this.getBarbershop(actor);

    const profile =
      await this.userProfilesRepository.findCustomerById(profileId);

    if (!profile) {
      throw new NotFoundException("Customer profile not found");
    }

    if (profile.barbershopId !== barbershop.id) {
      throw new ForbiddenException(
        "Customer does not belong to this barbershop",
      );
    }

    return this.sanitize(profile);
  }

  private ensureCanAccess(actor: RequestActor) {
    if (
      !actor.permissions.some((permission) =>
        [Permission.ADMIN, Permission.BARBER, Permission.RECEPTIONIST].includes(
          permission,
        ),
      )
    ) {
      throw new ForbiddenException(
        "You do not have permission to manage customer profiles",
      );
    }
  }

  private async getBarbershop(actor: RequestActor) {
    const barbershop = await this.barbershopService.getBarbershopForActor(
      actor as BarbershopRequestActor,
    );

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for current user");
    }

    return barbershop;
  }

  private sanitize(
    profile: CustomerProfileWithBarbershop,
  ): SanitizedCustomerProfile {
    return {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      barbershop: {
        id: profile.barbershop.id,
        name: profile.barbershop.name,
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
