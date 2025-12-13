import { IsString, IsNumber, IsNotEmpty, Min, IsOptional, IsMongoId, IsDateString, IsBoolean } from 'class-validator';

export class StartRecurringPlanDto {
  @IsString()
  @IsNotEmpty({ message: 'Plan type is required' })
  planType: string;

  @IsNumber()
  @Min(1, { message: 'Monthly contribution must be at least 1' })
  monthlyContribution: number;
}

export class RequestRecurringWithdrawalDto {
  @IsMongoId()
  @IsNotEmpty({ message: 'Plan id is required' })
  planId: string;
}

export class AdminMarkRecurringPaidDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsDateString()
  datePaid?: string;
}

export class AdminMarkRecurringMissedDto {
  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean;
}

export class AdminUpdateRecurringPortfolioDto {
  @IsNumber()
  @Min(0)
  portfolioValue: number;
}

export class AdminApproveRecurringWithdrawalDto {
  @IsOptional()
  @IsBoolean()
  approve?: boolean;
}
