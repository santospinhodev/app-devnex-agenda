import { IsNotEmpty, IsString, Matches } from "class-validator";

export class FinalWeekQueryDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  start!: string;
}
