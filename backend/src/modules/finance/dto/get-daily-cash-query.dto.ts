import { IsDateString, IsOptional } from "class-validator";

export class GetDailyCashQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}
