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
import { BarbershopService } from "../../barbershop/services/barbershop.service";
import { UserProfilesRepository } from "../repositories/user-profiles.repository";
import { ReceptionistProfileWithUser } from "../types/profile-with-user.types";
import { CreateReceptionistDto } from "../dto/create-receptionist.dto";
import { UpdateReceptionistDto } from "../dto/update-receptionist.dto";

export interface SanitizedReceptionistProfile {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
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
export class ReceptionistsService {
  private static readonly PASSWORD_SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly barbershopService: BarbershopService,
    private readonly userProfilesRepository: UserProfilesRepository
  ) {}

  async listForOwner(ownerId: string): Promise<SanitizedReceptionistProfile[]> {
    const barbershop =
      await this.barbershopService.getBarbershopForOwner(ownerId);

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for current owner");
    }

    const receptionists =
      await this.userProfilesRepository.findReceptionistsByBarbershop(
        barbershop.id
      );

    return receptionists.map((profile) => this.sanitize(profile));
  }

  async createReceptionist(
    ownerId: string,
    dto: CreateReceptionistDto
  ): Promise<SanitizedReceptionistProfile> {
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
      ReceptionistsService.PASSWORD_SALT_ROUNDS
    );

    let profile: ReceptionistProfileWithUser | null = null;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await this.usersService.createUser(
        {
          email: dto.email,
          name: dto.name,
          phone: dto.phone,
          hashedPassword,
        },
        tx
      );

      await this.usersService.assignPermissions(
        user.id,
        [Permission.RECEPTIONIST],
        tx
      );

      profile = await this.userProfilesRepository.createReceptionistProfile(
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
          isActive: dto.isActive ?? true,
        },
        tx
      );
    });

    if (!profile) {
      throw new NotFoundException("Unable to create receptionist profile");
    }

    return this.sanitize(profile);
  }

  async updateReceptionist(
    ownerId: string,
    profileId: string,
    dto: UpdateReceptionistDto
  ): Promise<SanitizedReceptionistProfile> {
    const barbershop =
      await this.barbershopService.getBarbershopForOwner(ownerId);

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found for current owner");
    }

    const profile =
      await this.userProfilesRepository.findReceptionistById(profileId);

    if (!profile || profile.barbershopId !== barbershop.id) {
      throw new ForbiddenException(
        "Receptionist not associated with your barbershop"
      );
    }

    if (dto.email && dto.email !== profile.user.email) {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing && existing.id !== profile.userId) {
        throw new ConflictException("Email already registered");
      }
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
        ReceptionistsService.PASSWORD_SALT_ROUNDS
      );
    }

    const profileData: Prisma.ReceptionistProfileUpdateInput = {};
    if (dto.name !== undefined) {
      profileData.name = dto.name;
    }
    if (dto.phone !== undefined) {
      profileData.phone = dto.phone;
    }
    if (dto.avatarUrl !== undefined) {
      profileData.avatarUrl = dto.avatarUrl;
    }
    if (dto.isActive !== undefined) {
      profileData.isActive = dto.isActive;
    }

    let updatedProfile: ReceptionistProfileWithUser | null = null;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (Object.keys(userData).length > 0) {
        await this.usersService.updateUser(profile.userId, userData, tx);
      }

      if (Object.keys(profileData).length > 0) {
        updatedProfile =
          await this.userProfilesRepository.updateReceptionistProfile(
            profileId,
            profileData,
            tx
          );
      }
    });

    if (!updatedProfile) {
      const reloaded =
        await this.userProfilesRepository.findReceptionistById(profileId);
      if (!reloaded) {
        throw new NotFoundException(
          "Receptionist profile not found after update"
        );
      }
      updatedProfile = reloaded;
    }

    return this.sanitize(updatedProfile);
  }

  private sanitize(
    profile: ReceptionistProfileWithUser
  ): SanitizedReceptionistProfile {
    return {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      isActive: profile.isActive,
      user: {
        id: profile.user.id,
        email: profile.user.email,
        name: profile.user.name,
        phone: profile.user.phone,
        permissions: profile.user.permissions.map(
          ({ permission }) => permission.name as Permission
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
