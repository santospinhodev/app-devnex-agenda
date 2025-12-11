import { IsOptional, IsString, Length } from "class-validator";

export class ListServicesQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;
}
