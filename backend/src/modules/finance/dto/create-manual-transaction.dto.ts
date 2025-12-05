import { CashFlowType, PaymentMethod } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

export class CreateManualTransactionDto {
  @IsEnum(CashFlowType)
  type!: CashFlowType;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  @Matches(MONEY_PATTERN, {
    message: "amount must be a valid monetary value",
  })
  amount!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  description!: string;
}
