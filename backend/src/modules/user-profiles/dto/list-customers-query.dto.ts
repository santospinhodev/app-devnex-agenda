import { IsOptional, IsString, Length } from "class-validator";

export class ListCustomersQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}
