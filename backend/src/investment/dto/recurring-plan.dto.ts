import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class StartRecurringPlanDto {
  @IsString()
  @IsNotEmpty({ message: 'Plan type is required' })
  planType: string;

  @IsNumber()
  @Min(1, { message: 'Monthly contribution must be at least 1' })
  monthlyContribution: number;
}
