import { IsString, Length, Matches } from "class-validator";

const PHONE_PATTERN = /^\+?[0-9\s()-]{8,20}$/;

export class CreateCustomerProfileDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsString()
  @Matches(PHONE_PATTERN, {
    message: "phone must be a valid phone number",
  })
  phone!: string;
}
