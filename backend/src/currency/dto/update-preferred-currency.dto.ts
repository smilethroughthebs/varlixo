import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdatePreferredCurrencyDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  preferredCurrency?: string;
}
