/**
 * ==============================================
 * VARLIXO - AUTHENTICATION SERVICE
 * ==============================================
 * Handles user authentication, registration, JWT tokens,
 * and two-factor authentication with email integration.
 */

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User, UserDocument, UserRole, UserStatus } from '../schemas/user.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import { Referral, ReferralDocument } from '../schemas/referral.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, ResetPasswordDto, ChangePasswordDto, SendOtpDto, VerifyEmailOtpDto, ResetPasswordWithOtpDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { generateReferralCode, generateToken, generateOTP, addDays } from '../common/utils/helpers';
import { EmailService } from '../email/email.service';
import { OtpService } from './otp.service';
import { OtpType } from '../schemas/otp.schema';

// JWT Payload interface
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  twoFactorAuthenticated?: boolean;
}

// Store for email 2FA codes (in production, use Redis)
const email2FACodes: Map<string, { code: string; expires: Date }> = new Map();

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private otpService: OtpService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto, ipAddress?: string) {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      referralCode,
      country,
      dateOfBirth,
      phone,
      occupation,
      annualIncomeRange,
      sourceOfFunds,
      investmentExperience,
      agreeTerms,
      marketingOptIn,
    } = registerDto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (!agreeTerms) {
      throw new BadRequestException('You must accept the terms');
    }

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      throw new BadRequestException('Invalid date of birth');
    }

    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    const isAtLeast18 = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
    if (!isAtLeast18) {
      throw new BadRequestException('You must be at least 18 years old');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code for new user
    let userReferralCode = generateReferralCode();
    while (await this.userModel.findOne({ referralCode: userReferralCode })) {
      userReferralCode = generateReferralCode();
    }

    // Handle referral
    let referredBy: Types.ObjectId | undefined;
    if (referralCode) {
      const referrer = await this.userModel.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Generate email verification token
    const emailVerificationToken = generateToken();

    try {
      // Create user
      const user = new this.userModel({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        country,
        countryCode: country,
        dateOfBirth: dob,
        phone,
        phoneE164: phone && phone.trim().startsWith('+') ? phone.trim() : undefined,
        occupation,
        annualIncomeRange,
        sourceOfFunds,
        investmentExperience,
        agreedToTerms: true,
        agreedToTermsAt: new Date(),
        marketingOptIn: !!marketingOptIn,
        referralCode: userReferralCode,
        referredBy,
        emailVerificationToken,
        emailVerificationExpires: addDays(new Date(), 1), // 24 hours
        status: UserStatus.PENDING,
      });

      await user.save();

      // Create wallet for user
      const wallet = new this.walletModel({
        userId: user._id,
        mainBalance: 0,
        pendingBalance: 0,
        lockedBalance: 0,
      });
      await wallet.save();

      // Create referral record if referred
      if (referredBy) {
        const referral = new this.referralModel({
          referrerId: referredBy,
          referredId: user._id,
          referralCode,
          ipAddress,
        });
        await referral.save();

        // Update referrer's total referrals count
        await this.userModel.findByIdAndUpdate(referredBy, {
          $inc: { totalReferrals: 1 },
        });
      }

      // Send verification email (fire and forget, but log errors)
      // User account is created regardless of email sending success
      this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        emailVerificationToken,
      ).catch((err) => {
        console.error('⚠️ Failed to send verification email to', user.email, ':', err);
      }).then((sent) => {
        if (sent) {
          console.log('✅ Verification email sent to', user.email);
        }
      });

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        userId: user._id,
        emailSent: true, // Email sending is asynchronous, so we optimistically return true
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // If it's a duplicate key error, user might exist
      if (error.code === 11000) {
        throw new ConflictException('Email or referral code already exists');
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * User login with optional 2FA
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password, twoFactorCode, emailOtp } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account status
    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Your account has been banned');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account is suspended');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Check if account is locked
    if (user.lockUntil && new Date() < user.lockUntil) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
      await this.userModel.findByIdAndUpdate(user._id, {
        failedLoginAttempts: newFailedAttempts,
        ...(newFailedAttempts >= 5 && {
          lockUntil: new Date(Date.now() + 30 * 60 * 1000), // Lock for 30 minutes
        }),
      });

      // Send security alert for multiple failed attempts
      if (newFailedAttempts === 3) {
        this.emailService.sendPasswordChangedEmail(user.email, user.firstName).catch((err) => {
          console.error('Failed to send security alert:', err);
        });
      }

      throw new UnauthorizedException('Invalid email or password');
    }

    const requiresApp2fa = Boolean(user.twoFactorEnabled && user.twoFactorSecret);

    // App-based 2FA (Authenticator)
    if (requiresApp2fa) {
      if (!twoFactorCode) {
        return {
          requiresTwoFactor: true,
          twoFactorMethod: 'app',
          message: 'Two-factor authentication code required',
        };
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1, // Allow 1 step tolerance
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    // Email login OTP should only be required when app-based 2FA is NOT enabled.
    if (!requiresApp2fa) {
      if (!emailOtp) {
        const otp = await this.otpService.generateOtp(
          user.email,
          OtpType.LOGIN,
          user._id.toString(),
          ipAddress,
        );

        await this.emailService.sendOtpEmail(user.email, user.firstName, otp.code, 'login');

        return {
          requiresEmailOtp: true,
          message: 'A 6-digit login code has been sent to your email. Please enter the code to continue.',
        };
      }

      await this.otpService.verifyOtp(user.email, emailOtp, OtpType.LOGIN);
    }

    // Reset failed login attempts and update last login
    await this.userModel.findByIdAndUpdate(user._id, {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
      lastLoginIp: ipAddress,
      lastActivity: new Date(),
      $push: {
        loginHistory: {
          $each: [`${new Date().toISOString()} | IP: ${ipAddress} | ${userAgent?.substring(0, 50)}`],
          $slice: -20, // Keep last 20 logins
        },
      },
    });

    // Generate tokens
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      twoFactorAuthenticated: user.twoFactorEnabled,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        kycStatus: user.kycStatus,
        avatar: user.avatar,
        theme: user.theme,
        preferredLanguage: user.preferredLanguage,
      },
    };
  }

  /**
   * Send email 2FA code
   */
  async sendEmail2FACode(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if user not found to prevent enumeration
      return { success: true, message: 'If your email is registered, you will receive a verification code.' };
    }

    // Generate 6-digit code
    const code = generateOTP(6);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code
    email2FACodes.set(user._id.toString(), { code, expires });

    // Send email
    const emailSent = await this.emailService.send2FACodeEmail(user.email, user.firstName, code);

    return {
      success: emailSent,
      message: emailSent 
        ? 'Verification code sent to your email.'
        : 'Failed to send verification code. Please try again.',
    };
  }

  /**
   * Verify email 2FA code
   */
  async verifyEmail2FACode(email: string, code: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return false;
    }

    const storedCode = email2FACodes.get(user._id.toString());
    if (!storedCode) {
      return false;
    }

    // Check expiry
    if (new Date() > storedCode.expires) {
      email2FACodes.delete(user._id.toString());
      return false;
    }

    // Verify code
    if (storedCode.code !== code) {
      return false;
    }

    // Delete used code
    email2FACodes.delete(user._id.toString());
    return true;
  }

  /**
   * Generate access token
   */
  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || user.status === UserStatus.BANNED) {
        throw new UnauthorizedException('Invalid token');
      }

      const newPayload: JwtPayload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = await this.generateAccessToken(newPayload);
      const newRefreshToken = await this.generateRefreshToken(newPayload);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.status = UserStatus.ACTIVE;
    await user.save();

    return { 
      success: true,
      message: 'Email verified successfully. You can now log in.' 
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return { success: true, message: 'If your email is registered, you will receive a verification link.' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new token
    const emailVerificationToken = generateToken();
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = addDays(new Date(), 1);
    await user.save();

    // Send email
    const emailSent = await this.emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      emailVerificationToken,
    );

    return {
      success: emailSent,
      message: emailSent 
        ? 'Verification email sent successfully.'
        : 'Failed to send verification email. Please try again.',
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    const response = { 
      success: true, 
      message: 'If your email is registered, you will receive a password reset link.' 
    };

    if (!user) {
      return response;
    }

    const resetToken = generateToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken,
    );

    return response;
  }

  /**
   * Reset password
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email, user.firstName);

    return { 
      success: true,
      message: 'Password reset successful. You can now log in with your new password.' 
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email, user.firstName);

    return { 
      success: true,
      message: 'Password changed successfully' 
    };
  }

  /**
   * Setup 2FA
   */
  async setup2FA(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${this.configService.get('twoFa.appName')} (${user.email})`,
      length: 20,
    });

    // Save secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan the QR code with your authenticator app and verify with a code',
    };
  }

  /**
   * Enable 2FA after verification
   */
  async enable2FA(userId: string, code: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('Please setup 2FA first');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(generateReferralCode(10));
    }

    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = backupCodes.map((code) =>
      bcrypt.hashSync(code, 10),
    );
    await user.save();

    return {
      success: true,
      message: 'Two-factor authentication enabled successfully',
      backupCodes, // Show these once to user
    };
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, code: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save();

    return { 
      success: true,
      message: 'Two-factor authentication disabled successfully' 
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password -twoFactorSecret -twoFactorBackupCodes -emailVerificationToken -passwordResetToken');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallet = await this.walletModel.findOne({ userId: user._id });

    return { 
      success: true,
      user,
      wallet: wallet
        ? {
            mainBalance: wallet.mainBalance,
            pendingBalance: wallet.pendingBalance,
            lockedBalance: wallet.lockedBalance,
            totalEarnings: wallet.totalEarnings,
            referralEarnings: wallet.referralEarnings,
          }
        : null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.firstName) {
      user.firstName = String(dto.firstName).trim();
    }

    if (dto.lastName) {
      user.lastName = String(dto.lastName).trim();
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone ? String(dto.phone).trim() : '';
    }

    if (dto.dateOfBirth !== undefined) {
      user.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined;
    }

    if (dto.country !== undefined) {
      user.country = dto.country ? String(dto.country).trim() : '';
    }

    if (dto.occupation !== undefined) {
      user.occupation = dto.occupation ? String(dto.occupation).trim() : '';
    }

    if (dto.annualIncomeRange !== undefined) {
      user.annualIncomeRange = dto.annualIncomeRange ? String(dto.annualIncomeRange).trim() : '';
    }

    if (dto.sourceOfFunds !== undefined) {
      user.sourceOfFunds = dto.sourceOfFunds ? String(dto.sourceOfFunds).trim() : '';
    }

    if (dto.investmentExperience !== undefined) {
      user.investmentExperience = dto.investmentExperience ? String(dto.investmentExperience).trim() : '';
    }

    if (dto.preferredLanguage) {
      user.preferredLanguage = String(dto.preferredLanguage).trim().toLowerCase();
    }

    if (dto.preferredCurrency) {
      user.preferredCurrency = String(dto.preferredCurrency).trim().toUpperCase();
    }

    if (dto.theme) {
      user.theme = String(dto.theme).trim().toLowerCase();
    }

    if (dto.emailNotifications !== undefined) {
      user.emailNotifications = Boolean(dto.emailNotifications);
    }
    if (dto.depositNotifications !== undefined) {
      user.depositNotifications = Boolean(dto.depositNotifications);
    }
    if (dto.withdrawalNotifications !== undefined) {
      user.withdrawalNotifications = Boolean(dto.withdrawalNotifications);
    }
    if (dto.investmentNotifications !== undefined) {
      user.investmentNotifications = Boolean(dto.investmentNotifications);
    }
    if (dto.securityAlerts !== undefined) {
      user.securityAlerts = Boolean(dto.securityAlerts);
    }

    await user.save();

    return this.getProfile(userId);
  }

  // ==========================================
  // OTP-BASED AUTHENTICATION METHODS
  // ==========================================

  /**
   * Send OTP for email verification
   */
  async sendVerificationOtp(sendOtpDto: SendOtpDto, ipAddress?: string) {
    const { email } = sendOtpDto;

    // Check if user exists
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return {
        success: true,
        message: 'If an account exists with that email, you will receive a verification code.',
      };
    }

    try {
      // Generate OTP
      const otp = await this.otpService.generateOtp(
        email,
        OtpType.EMAIL_VERIFICATION,
        user._id.toString(),
        ipAddress,
      );

      // Send email
      await this.emailService.sendOtpEmail(
        email,
        user.firstName,
        otp.code,
        'verification',
      );

      return {
        success: true,
        message: 'Verification code sent to your email. Code expires in 10 minutes.',
        otpId: otp._id, // Frontend can store this if needed
      };
    } catch (error) {
      console.error('Error sending verification OTP:', error);
      // Still return success to prevent enumeration
      return {
        success: true,
        message: 'If an account exists with that email, you will receive a verification code.',
      };
    }
  }

  /**
   * Verify email OTP during registration
   */
  async verifyEmailOtp(verifyOtpDto: VerifyEmailOtpDto): Promise<any> {
    const { email, code } = verifyOtpDto;

    try {
      // Verify OTP
      const verifiedOtp = await this.otpService.verifyOtp(
        email,
        code,
        OtpType.EMAIL_VERIFICATION,
      );

      // Find and update user
      const user = await this.userModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Mark email as verified
      user.emailVerified = true;
      user.status = UserStatus.ACTIVE;
      await user.save();

      // Generate tokens
      const payload: JwtPayload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        twoFactorAuthenticated: user.twoFactorEnabled,
      };

      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.generateRefreshToken(payload);

      return {
        success: true,
        message: 'Email verified successfully! You can now log in.',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to verify email');
    }
  }

  /**
   * Send OTP for password reset
   */
  async sendPasswordResetOtp(sendOtpDto: SendOtpDto, ipAddress?: string) {
    const { email } = sendOtpDto;

    // Check if user exists
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return {
        success: true,
        message: 'If an account exists with that email, you will receive a password reset code.',
      };
    }

    try {
      // Generate OTP
      const otp = await this.otpService.generateOtp(
        email,
        OtpType.PASSWORD_RESET,
        user._id.toString(),
        ipAddress,
      );

      // Send email
      await this.emailService.sendOtpEmail(
        email,
        user.firstName,
        otp.code,
        'reset',
      );

      return {
        success: true,
        message: 'Password reset code sent to your email. Code expires in 10 minutes.',
        otpId: otp._id,
      };
    } catch (error) {
      console.error('Error sending password reset OTP:', error);
      return {
        success: true,
        message: 'If an account exists with that email, you will receive a password reset code.',
      };
    }
  }

  /**
   * Reset password using OTP
   */
  async resetPasswordWithOtp(resetOtpDto: ResetPasswordWithOtpDto): Promise<any> {
    const { email, code, newPassword, confirmPassword } = resetOtpDto;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      // Verify OTP
      const verifiedOtp = await this.otpService.verifyOtp(
        email,
        code,
        OtpType.PASSWORD_RESET,
      );

      // Find user
      const user = await this.userModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      user.password = hashedPassword;
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      // Send confirmation email
      this.emailService.sendPasswordChangedEmail(user.email, user.firstName).catch(err => {
        console.error('Error sending password changed confirmation:', err);
      });

      return {
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to reset password');
    }
  }

  /**
   * Resend OTP
   */
  async resendOtp(sendOtpDto: SendOtpDto, ipAddress?: string) {
    const { email, type = 'verification' } = sendOtpDto;

    const otpType =
      type === 'reset'
        ? OtpType.PASSWORD_RESET
        : type === 'withdrawal'
          ? OtpType.WITHDRAWAL_CONFIRMATION
          : type === 'login'
            ? OtpType.LOGIN
            : OtpType.EMAIL_VERIFICATION;

    // Check if user exists
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return {
        success: true,
        message: `If an account exists with that email, you will receive a ${type} code.`,
      };
    }

    try {
      // Resend OTP (invalidate old, create new)
      const otp = await this.otpService.resendOtp(
        email,
        otpType,
        user._id.toString(),
        ipAddress,
      );

      await this.emailService.sendOtpEmail(email, user.firstName, otp.code, type as any);

      return {
        success: true,
        message: 'OTP resent successfully. Code expires in 10 minutes.',
      };
    } catch (error) {
      console.error(`Error resending ${type} OTP:`, error);
      return {
        success: true,
        message: `If an account exists with that email, you will receive a ${type} code.`,
      };
    }
  }
}
