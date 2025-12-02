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

export class CreateBarberProfileDto {
  @IsString()
  readonly name!: string;

  @IsEmail()
  readonly email!: string;

  @IsString()
  @MinLength(8)
  readonly password!: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

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
  @IsBoolean()
  readonly isActive?: boolean;
}
