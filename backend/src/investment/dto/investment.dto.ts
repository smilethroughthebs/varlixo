/**
 * ==============================================
 * VARLIXO - INVESTMENT DTOs
 * ==============================================
 * Validation DTOs for investment operations.
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max,
  ValidateNested,
  IsArray,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

class CountryLimitDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @Min(0)
  minInvestment: number;

  @IsNumber()
  @Min(0)
  maxInvestment: number;
}

// Create investment DTO
export class CreateInvestmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Plan ID is required' })
  planId: string;

  @IsNumber()
  @Min(1, { message: 'Investment amount must be positive' })
  amount: number;

  @IsOptional()
  @IsBoolean()
  autoCompound?: boolean;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  twoFactorCode?: string;
}

// Investment calculator DTO
export class CalculateReturnsDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

// Admin: Create investment plan DTO
export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsNumber()
  @Min(0)
  minInvestment: number;

  @IsNumber()
  @Min(0)
  maxInvestment: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryLimitDto)
  countryLimits?: CountryLimitDto[];

  @IsOptional()
  @IsBoolean()
  marketLinked?: boolean;

  @IsOptional()
  @IsString()
  marketAssetId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketBaseDailyRate?: number;

  @IsOptional()
  @IsNumber()
  marketAlpha?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketMinDailyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketMaxDailyRate?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  dailyReturnRate: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  totalReturnRate: number;

  @IsNumber()
  @Min(1)
  durationDays: number;

  @IsOptional()
  @IsBoolean()
  principalReturn?: boolean;

  @IsOptional()
  @IsString()
  payoutFrequency?: string;

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsNumber()
  maxActiveInvestments?: number;

  @IsOptional()
  @IsNumber()
  totalSlots?: number;

  @IsOptional()
  @IsNumber()
  referralBonusPercent?: number;
}

// Update plan DTO
export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minInvestment?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxInvestment?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  dailyReturnRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  totalReturnRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsBoolean()
  principalReturn?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryLimitDto)
  countryLimits?: CountryLimitDto[];

  @IsOptional()
  @IsBoolean()
  marketLinked?: boolean;

  @IsOptional()
  @IsString()
  marketAssetId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketBaseDailyRate?: number;

  @IsOptional()
  @IsNumber()
  marketAlpha?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketMinDailyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketMaxDailyRate?: number;
}




