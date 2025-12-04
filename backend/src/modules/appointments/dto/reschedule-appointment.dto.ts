import { IsNotEmpty, IsString, Matches } from "class-validator";

export class RescheduleAppointmentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  date!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  time!: string;
}
