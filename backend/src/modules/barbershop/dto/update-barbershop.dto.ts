import { IsArray, IsOptional, IsString, IsUrl, Matches } from "class-validator";

export class UpdateBarbershopDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsString()
  readonly neighborhood?: string;

  @IsOptional()
  @IsString()
  readonly city?: string;

  @IsOptional()
  @IsString()
  readonly state?: string;

  @IsOptional()
  @IsString()
  readonly zipCode?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  readonly photoUrl?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  readonly opensAt?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  readonly closesAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly daysOpen?: string[];
}
