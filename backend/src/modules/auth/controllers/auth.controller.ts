import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService, AuthResult } from "../services/auth.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { LoginUserDto } from "../dto/login-user.dto";
import { JwtRefreshGuard } from "../../../common/guards/jwt-refresh.guard";
import { Permission } from "../../../common/enums/permission.enum";

interface RefreshRequest extends Request {
  user: {
    userId: string;
    permissions: Permission[];
  };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() createUserDto: CreateUserDto): Promise<AuthResult> {
    return this.authService.signup(createUserDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto): Promise<AuthResult> {
    return this.authService.login(loginUserDto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: RefreshRequest): Promise<AuthResult> {
    return this.authService.refreshTokens(req.user.userId);
  }
}
