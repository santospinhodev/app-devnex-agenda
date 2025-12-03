import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { BlockType } from "@prisma/client";

export class CreateBarberBlockDto {
  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsEnum(BlockType)
  type!: BlockType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  note?: string;
}
