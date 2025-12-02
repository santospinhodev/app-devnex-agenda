import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from "class-validator";

export class CreateReceptionistDto {
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
  @IsUrl({ require_tld: false })
  readonly avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
