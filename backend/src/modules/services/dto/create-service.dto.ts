import { Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

export class CreateServiceDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 240)
  description?: string;

  @IsString()
  @Matches(MONEY_PATTERN, {
    message: "price must be a valid monetary value",
  })
  price!: string;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(480)
  durationMin!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercentage?: number;
}
