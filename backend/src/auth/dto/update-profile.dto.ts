import { IsDateString, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  annualIncomeRange?: string;

  @IsOptional()
  @IsString()
  sourceOfFunds?: string;

  @IsOptional()
  @IsString()
  investmentExperience?: string;

  @IsOptional()
  @IsString()
  @Length(2, 5)
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  preferredCurrency?: string;

  @IsOptional()
  @IsString()
  theme?: string;
}
