import { IsOptional, Matches } from "class-validator";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export class GetMonthlyCashQueryDto {
  @IsOptional()
  @Matches(MONTH_PATTERN, {
    message: "month must follow the YYYY-MM format",
  })
  month?: string;
}
