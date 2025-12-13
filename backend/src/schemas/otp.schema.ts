/**
 * ==============================================
 * VARLIXO - OTP VERIFICATION SCHEMA
 * ==============================================
 * Stores one-time passwords for email verification,
 * password reset, and other authentication flows.
 * Includes automatic expiration via TTL index.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OtpType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  WITHDRAWAL_CONFIRMATION = 'withdrawal_confirmation',
  LOGIN = 'login',
}

export enum OtpStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  code: string; // 6-digit OTP

  @Prop({ type: String, enum: OtpType, required: true })
  type: OtpType;

  @Prop({ type: String, enum: OtpStatus, default: OtpStatus.PENDING })
  status: OtpStatus;

  @Prop()
  userId: Types.ObjectId; // Optional, for logged-in users

  @Prop({ required: true })
  expiresAt: Date; // TTL index will auto-delete after this time

  @Prop({ default: 0 })
  attempts: number; // Number of failed verification attempts

  @Prop({ default: false })
  isUsed: boolean; // Whether OTP was successfully used

  @Prop()
  verifiedAt: Date; // When the OTP was successfully verified

  @Prop()
  ipAddress: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// TTL index: automatically delete documents 10 minutes after expiration
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding OTP by email + type
OtpSchema.index({ email: 1, type: 1, status: 1 });

// Index for finding OTP by code + type
OtpSchema.index({ code: 1, type: 1, status: 1 });
