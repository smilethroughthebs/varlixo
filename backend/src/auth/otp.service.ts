/**
 * ==============================================
 * VARLIXO - OTP SERVICE
 * ==============================================
 * Handles OTP generation, validation, and cleanup.
 * Provides secure one-time password management.
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument, OtpType, OtpStatus } from '../schemas/otp.schema';
import { generateOTP } from '../common/utils/helpers';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  /**
   * Generate and send OTP
   * @param email - User's email
   * @param type - Type of OTP (verification, reset, etc)
   * @param userId - Optional user ID
   * @param ipAddress - User's IP address
   * @returns OTP record
   */
  async generateOtp(
    email: string,
    type: OtpType,
    userId?: string,
    ipAddress?: string,
  ): Promise<OtpDocument> {
    // Invalidate any previous pending OTPs for this email+type
    await this.otpModel.updateMany(
      { email: email.toLowerCase(), type, status: OtpStatus.PENDING },
      { status: OtpStatus.EXPIRED },
    );

    // Generate 6-digit OTP
    const code = generateOTP(6);

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create OTP record
    const otp = new this.otpModel({
      email: email.toLowerCase(),
      code,
      type,
      status: OtpStatus.PENDING,
      userId: userId || undefined,
      expiresAt,
      ipAddress,
    });

    return await otp.save();
  }

  /**
   * Verify OTP code
   * @param email - User's email
   * @param code - OTP code to verify
   * @param type - Type of OTP
   * @returns Verified OTP record
   */
  async verifyOtp(
    email: string,
    code: string,
    type: OtpType,
  ): Promise<OtpDocument> {
    const otp = await this.otpModel.findOne({
      email: email.toLowerCase(),
      code: code.trim(),
      type,
      status: OtpStatus.PENDING,
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if expired
    if (new Date() > otp.expiresAt) {
      await this.otpModel.findByIdAndUpdate(otp._id, {
        status: OtpStatus.EXPIRED,
      });
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Increment attempts
    otp.attempts += 1;

    // Reject if too many failed attempts
    if (otp.attempts > 5) {
      await this.otpModel.findByIdAndUpdate(otp._id, {
        status: OtpStatus.FAILED,
      });
      throw new BadRequestException(
        'Too many failed attempts. Please request a new OTP.',
      );
    }

    // Mark as verified
    otp.status = OtpStatus.VERIFIED;
    otp.verifiedAt = new Date();
    otp.isUsed = true;

    return await otp.save();
  }

  /**
   * Get OTP by ID (for internal use)
   */
  async getOtpById(otpId: string): Promise<OtpDocument> {
    const otp = await this.otpModel.findById(otpId);
    if (!otp) {
      throw new NotFoundException('OTP not found');
    }
    return otp;
  }

  /**
   * Check if email has a valid pending OTP
   */
  async hasPendingOtp(email: string, type: OtpType): Promise<boolean> {
    const otp = await this.otpModel.findOne({
      email: email.toLowerCase(),
      type,
      status: OtpStatus.PENDING,
      expiresAt: { $gt: new Date() },
    });
    return !!otp;
  }

  /**
   * Resend OTP (revoke old, create new)
   */
  async resendOtp(
    email: string,
    type: OtpType,
    userId?: string,
    ipAddress?: string,
  ): Promise<OtpDocument> {
    // Invalidate previous
    await this.otpModel.updateMany(
      { email: email.toLowerCase(), type, status: OtpStatus.PENDING },
      { status: OtpStatus.EXPIRED },
    );

    // Generate new
    return this.generateOtp(email, type, userId, ipAddress);
  }

  /**
   * Cleanup expired OTPs (can be called by cron)
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await this.otpModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }
}
