import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { Permission } from "../../../common/enums/permission.enum";
import { PrismaService } from "../../../database/prisma.service";
import { UsersService } from "../../users/services/users.service";
import { UserProfilesRepository } from "../repositories/user-profiles.repository";
import { BarberProfileWithUser } from "../types/profile-with-user.types";
import {
  BarbershopService,
  RequestActor as BarbershopRequestActor,
} from "../../barbershop/services/barbershop.service";
import { CreateBarberProfileDto } from "../dto/create-barber-profile.dto";
import { UpdateBarberProfileDto } from "../dto/update-barber-profile.dto";

export interface RequestActor {
  userId: string;
  permissions: Permission[];
}

export interface SanitizedBarberProfile {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  commissionPercentage?: number | null;
  bio?: string | null;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    permissions: Permission[];
  };
  barbershop: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BarbersService {
  private static readonly PASSWORD_SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly barbershopService: BarbershopService,
    private readonly userProfilesRepository: UserProfilesRepository,
  ) {}

  async listForActor(actor: RequestActor): Promise<SanitizedBarberProfile[]> {
    if (
      !actor.permissions.some((permission) =>
        [Permission.ADMIN, Permission.RECEPTIONIST].includes(permission),
      )
    ) {
      throw new ForbiddenException(
        "You do not have permission to list barber profiles",
      );
    }

    const barbershop = await this.barbershopService.getBarbershopForActor(
      actor as BarbershopRequestActor,
    );

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for current user");
    }

    const profiles = await this.userProfilesRepository.findBarbersByBarbershop(
      barbershop.id,
    );

    return profiles.map((profile) => this.sanitize(profile));
  }

  async getById(
    actor: RequestActor,
    profileId: string,
  ): Promise<SanitizedBarberProfile> {
    const profile = await this.userProfilesRepository.findBarberById(profileId);

    if (!profile) {
      throw new NotFoundException("Barber profile not found");
    }

    const barbershop = await this.barbershopService.getBarbershopForActor(
      actor as BarbershopRequestActor,
    );

    if (!barbershop || !this.canAccessProfile(actor, barbershop.id, profile)) {
      throw new ForbiddenException("You cannot access this profile");
    }

    return this.sanitize(profile);
  }

  async createBarber(
    ownerId: string,
    dto: CreateBarberProfileDto,
  ): Promise<SanitizedBarberProfile> {
    const barbershop =
      await this.barbershopService.getBarbershopForOwner(ownerId);

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for current owner");
    }

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      BarbersService.PASSWORD_SALT_ROUNDS,
    );

    let createdProfile: BarberProfileWithUser | null = null;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await this.usersService.createUser(
        {
          email: dto.email,
          name: dto.name,
          phone: dto.phone,
          hashedPassword,
        },
        tx,
      );

      await this.usersService.assignPermissions(
        user.id,
        [Permission.BARBER],
        tx,
      );

      createdProfile = await this.userProfilesRepository.createBarberProfile(
        {
          user: {
            connect: { id: user.id },
          },
          barbershop: {
            connect: { id: barbershop.id },
          },
          name: dto.name,
          phone: dto.phone,
          avatarUrl: dto.avatarUrl,
          bio: dto.bio,
          commissionPercentage: dto.commissionPercentage,
          isActive: dto.isActive ?? true,
        },
        tx,
      );
    });

    if (!createdProfile) {
      throw new NotFoundException("Unable to create barber profile");
    }

    return this.sanitize(createdProfile);
  }

  async updateBarber(
    profileId: string,
    dto: UpdateBarberProfileDto,
    actor: RequestActor,
  ): Promise<SanitizedBarberProfile> {
    const profile = await this.userProfilesRepository.findBarberById(profileId);

    if (!profile) {
      throw new NotFoundException("Barber profile not found");
    }

    const actorBarbershop = await this.barbershopService.getBarbershopForActor(
      actor as BarbershopRequestActor,
    );

    if (!actorBarbershop || actorBarbershop.id !== profile.barbershopId) {
      throw new ForbiddenException("Barber does not belong to your barbershop");
    }

    const isSelf = profile.userId === actor.userId;

    if (!this.isAdmin(actor) && !isSelf) {
      throw new ForbiddenException(
        "You do not have permission to update this profile",
      );
    }

    if (dto.email && dto.email !== profile.user.email) {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing && existing.id !== profile.userId) {
        throw new ConflictException("Email already registered");
      }
    }

    if (dto.commissionPercentage !== undefined && !this.isAdmin(actor)) {
      throw new ForbiddenException(
        "You do not have permission to update commission percentage",
      );
    }

    if (dto.isActive !== undefined && !this.isAdmin(actor)) {
      throw new ForbiddenException(
        "You do not have permission to update active status",
      );
    }

    const userData: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) {
      userData.name = dto.name;
    }
    if (dto.phone !== undefined) {
      userData.phone = dto.phone;
    }
    if (dto.email !== undefined) {
      userData.email = dto.email;
    }
    if (dto.password !== undefined) {
      userData.hashedPassword = await bcrypt.hash(
        dto.password,
        BarbersService.PASSWORD_SALT_ROUNDS,
      );
    }
    if (dto.isActive !== undefined) {
      userData.isActive = dto.isActive;
    }

    const profileData: Prisma.BarberProfileUpdateInput = {};
    if (dto.name !== undefined) {
      profileData.name = dto.name;
    }
    if (dto.phone !== undefined) {
      profileData.phone = dto.phone;
    }
    if (dto.avatarUrl !== undefined) {
      profileData.avatarUrl = dto.avatarUrl;
    }
    if (dto.bio !== undefined) {
      profileData.bio = dto.bio;
    }
    if (dto.commissionPercentage !== undefined) {
      profileData.commissionPercentage = dto.commissionPercentage;
    }
    if (dto.isActive !== undefined) {
      profileData.isActive = dto.isActive;
    }

    let updatedProfile: BarberProfileWithUser | null = null;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (Object.keys(userData).length > 0) {
        await this.usersService.updateUser(profile.userId, userData, tx);
      }

      if (Object.keys(profileData).length > 0) {
        updatedProfile = await this.userProfilesRepository.updateBarberProfile(
          profileId,
          profileData,
          tx,
        );
      }
    });

    if (!updatedProfile) {
      const reloaded =
        await this.userProfilesRepository.findBarberById(profileId);
      if (!reloaded) {
        throw new NotFoundException("Barber profile not found after update");
      }
      updatedProfile = reloaded;
    }

    return this.sanitize(updatedProfile);
  }

  private isAdmin(actor: RequestActor): boolean {
    return actor.permissions.includes(Permission.ADMIN);
  }

  private canAccessProfile(
    actor: RequestActor,
    actorBarbershopId: string,
    profile: BarberProfileWithUser,
  ): boolean {
    if (this.isAdmin(actor)) {
      return profile.barbershopId === actorBarbershopId;
    }

    if (actor.permissions.includes(Permission.RECEPTIONIST)) {
      return profile.barbershopId === actorBarbershopId;
    }

    if (actor.permissions.includes(Permission.BARBER)) {
      return profile.barbershopId === actorBarbershopId;
    }

    return profile.userId === actor.userId;
  }

  private sanitize(profile: BarberProfileWithUser): SanitizedBarberProfile {
    return {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      commissionPercentage: profile.commissionPercentage,
      bio: profile.bio,
      isActive: profile.isActive,
      user: {
        id: profile.user.id,
        email: profile.user.email,
        name: profile.user.name,
        phone: profile.user.phone,
        permissions: profile.user.permissions.map(
          ({ permission }) => permission.name as Permission,
        ),
      },
      barbershop: {
        id: profile.barbershop.id,
        name: profile.barbershop.name,
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
