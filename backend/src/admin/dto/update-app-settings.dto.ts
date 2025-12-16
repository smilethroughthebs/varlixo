import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAppSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsEmail()
  adminEmail?: string;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  twoFactorRequired?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minDeposit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minWithdrawal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  withdrawalFee?: number;
}
