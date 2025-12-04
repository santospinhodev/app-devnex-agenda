import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { Type } from "class-transformer";

@ValidatorConstraint({ name: "AppointmentCustomerRequirement", async: false })
export class AppointmentCustomerRequirement implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const object = args.object as CreateAppointmentDto;
    return Boolean(object.customerId || object.customer);
  }

  defaultMessage() {
    return "Provide either customerId or customer details";
  }
}

export class CreateAppointmentCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  email?: string;
}

export class CreateAppointmentDto {
  @IsUUID()
  barberId!: string;

  @IsUUID()
  serviceId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  date!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  time!: string;

  @IsOptional()
  @IsUUID()
  @Validate(AppointmentCustomerRequirement)
  customerId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAppointmentCustomerDto)
  customer?: CreateAppointmentCustomerDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
