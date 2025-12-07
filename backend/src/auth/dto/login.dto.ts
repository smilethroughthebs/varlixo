/**
 * ==============================================
 * VARLIXO - LOGIN DTOs
 * ==============================================
 * Validation DTOs for user authentication.
 */

import { IsEmail, IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsString()
  @Length(6, 6, { message: '2FA code must be 6 digits' })
  twoFactorCode?: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  token: string;
}

export class Enable2FADto {
  @IsString()
  @IsNotEmpty({ message: '2FA code is required' })
  @Length(6, 6, { message: '2FA code must be 6 digits' })
  code: string;
}

export class Verify2FADto {
  @IsString()
  @IsNotEmpty({ message: '2FA code is required' })
  @Length(6, 6, { message: '2FA code must be 6 digits' })
  code: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;
}

export class VerifyEmailOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  code: string;
}

export class SendOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsOptional()
  type?: 'verification' | 'reset' | 'withdrawal';
}

export class ResetPasswordWithOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;
}
