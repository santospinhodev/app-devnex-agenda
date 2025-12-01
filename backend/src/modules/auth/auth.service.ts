import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UsersService, UserWithPermissions } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";

interface TokenPayload {
  sub: string;
  permissions: string[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.hashedPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.hashedPassword
    );
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: UserWithPermissions): AuthTokens {
    const payload: TokenPayload = {
      sub: user.id,
      permissions: user.permissions.map(
        (relation: UserWithPermissions["permissions"][number]) =>
          relation.permission.name
      ),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRES_IN", "15m"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "7d"),
    });

    return { accessToken, refreshToken };
  }
}
