/**
 * ==============================================
 * VARLIXO - AUTHENTICATION CONTROLLER
 * ==============================================
 * REST API endpoints for authentication operations.
 */

import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  Enable2FADto,
  ChangePasswordDto,
  SendOtpDto,
  VerifyEmailOtpDto,
  ResetPasswordWithOtpDto,
} from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { getClientIp } from '../common/utils/helpers';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const ipAddress = getClientIp(req);
    return this.authService.register(registerDto, ipAddress);
  }

  /**
   * User login
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  /**
   * Send email 2FA code
   * POST /auth/2fa/send-email-code
   */
  @Public()
  @Post('2fa/send-email-code')
  @HttpCode(HttpStatus.OK)
  async sendEmail2FACode(@Body('email') email: string) {
    return this.authService.sendEmail2FACode(email);
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  /**
   * Verify email address
   * POST /auth/verify-email
   */
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  /**
   * Resend verification email
   * POST /auth/resend-verification
   */
  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Change password (authenticated)
   * POST /auth/change-password
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  /**
   * Setup 2FA - get QR code
   * POST /auth/2fa/setup
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  async setup2FA(@CurrentUser('sub') userId: string) {
    return this.authService.setup2FA(userId);
  }

  /**
   * Enable 2FA - verify and activate
   * POST /auth/2fa/enable
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  async enable2FA(
    @CurrentUser('sub') userId: string,
    @Body() enable2FADto: Enable2FADto,
  ) {
    return this.authService.enable2FA(userId, enable2FADto.code);
  }

  /**
   * Disable 2FA
   * POST /auth/2fa/disable
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disable2FA(
    @CurrentUser('sub') userId: string,
    @Body() disable2FADto: Enable2FADto,
  ) {
    return this.authService.disable2FA(userId, disable2FADto.code);
  }

  /**
   * Logout - client should remove tokens
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { 
      success: true,
      message: 'Logged out successfully' 
    };
  }

  // ==========================================
  // OTP-BASED AUTHENTICATION ENDPOINTS
  // ==========================================

  /**
   * Send email verification OTP
   * POST /auth/otp/send-verification
   */
  @Public()
  @Post('otp/send-verification')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @HttpCode(HttpStatus.OK)
  async sendVerificationOtp(@Body() sendOtpDto: SendOtpDto, @Req() req: Request) {
    const ipAddress = getClientIp(req);
    return this.authService.sendVerificationOtp(sendOtpDto, ipAddress);
  }

  /**
   * Verify email OTP (after registration)
   * POST /auth/otp/verify-email
   */
  @Public()
  @Post('otp/verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmailOtp(@Body() verifyOtpDto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(verifyOtpDto);
  }

  /**
   * Send password reset OTP
   * POST /auth/otp/send-reset
   */
  @Public()
  @Post('otp/send-reset')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @HttpCode(HttpStatus.OK)
  async sendPasswordResetOtp(@Body() sendOtpDto: SendOtpDto, @Req() req: Request) {
    const ipAddress = getClientIp(req);
    return this.authService.sendPasswordResetOtp(sendOtpDto, ipAddress);
  }

  /**
   * Reset password with OTP
   * POST /auth/otp/reset-password
   */
  @Public()
  @Post('otp/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithOtp(@Body() resetOtpDto: ResetPasswordWithOtpDto) {
    return this.authService.resetPasswordWithOtp(resetOtpDto);
  }

  /**
   * Resend OTP
   * POST /auth/otp/resend
   */
  @Public()
  @Post('otp/resend')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() sendOtpDto: SendOtpDto, @Req() req: Request) {
    const ipAddress = getClientIp(req);
    return this.authService.resendOtp(sendOtpDto, ipAddress);
  }
}
