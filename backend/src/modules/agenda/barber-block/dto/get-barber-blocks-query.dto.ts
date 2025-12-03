import { IsNotEmpty, IsString, Matches } from "class-validator";

export class GetBarberBlocksQueryDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;
}
