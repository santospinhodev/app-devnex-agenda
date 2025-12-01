import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { UsersService } from "../../users/services/users.service";
import { UserWithRelations } from "../../users/types/user-with-relations.type";
import { BarbershopService } from "../../barbershop/services/barbershop.service";
import { AuthUser } from "../../users/interfaces/auth-user.interface";
import { CreateUserDto } from "../dto/create-user.dto";
import { LoginUserDto } from "../dto/login-user.dto";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: AuthUser;
}

@Injectable()
export class AuthService {
  private static readonly PASSWORD_SALT_ROUNDS = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly barbershopService: BarbershopService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<AuthResult> {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email
    );
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      AuthService.PASSWORD_SALT_ROUNDS
    );

    let userId: string | null = null;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await this.usersService.createAdminUser(
        {
          email: createUserDto.email,
          name: createUserDto.name,
          phone: createUserDto.phone,
          hashedPassword,
        },
        tx
      );

      await this.usersService.assignDefaultPermissions(user.id, tx);
      await this.barbershopService.createDefaultBarbershopForAdmin(user.id, tx);
      userId = user.id;
    });

    if (!userId) {
      throw new UnauthorizedException("Unable to create user");
    }

    const freshUser = await this.usersService.findById(userId);
    if (!freshUser) {
      throw new UnauthorizedException("Unable to load user after signup");
    }

    return this.buildAuthResult(freshUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(loginUserDto.email);
    if (!user || !user.hashedPassword || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(
      loginUserDto.password,
      user.hashedPassword
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildAuthResult(user);
  }

  async refreshTokens(userId: string): Promise<AuthResult> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return this.buildAuthResult(user);
  }

  private async buildAuthResult(user: UserWithRelations): Promise<AuthResult> {
    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.usersService.mapToAuthUser(user),
    };
  }

  private async generateTokens(user: UserWithRelations): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      permissions: user.permissions.map(({ permission }) => permission.name),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>("JWT_SECRET"),
        expiresIn: this.configService.get<string>(
          "JWT_ACCESS_EXPIRES_IN",
          "15m"
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>(
          "JWT_REFRESH_EXPIRES_IN",
          "7d"
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
