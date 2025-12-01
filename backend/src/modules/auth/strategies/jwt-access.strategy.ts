import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Permission } from "../../../common/enums/permission.enum";

interface TokenPayload {
  sub: string;
  permissions: string[];
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  validate(payload: TokenPayload): {
    userId: string;
    permissions: Permission[];
  } {
    return {
      userId: payload.sub,
      permissions: payload.permissions as Permission[],
    };
  }
}
