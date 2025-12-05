import { IsEnum } from "class-validator";

export enum FinishPaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  PIX = "PIX",
}

export class FinishAppointmentDto {
  @IsEnum(FinishPaymentMethod)
  paymentMethod!: FinishPaymentMethod;
}
