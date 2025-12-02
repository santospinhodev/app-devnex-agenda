import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";

export class UpdateBarberProfileDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  readonly password?: string;

  @IsOptional()
  @IsString()
  readonly bio?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  readonly avatarUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly commissionPercentage?: number;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
