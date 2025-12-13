/**
 * ==============================================
 * VARLIXO - USER SCHEMA
 * ==============================================
 * Defines the User document structure for MongoDB.
 * Includes authentication, profile, and security settings.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Enum for user roles
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// Enum for user account status
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

// Enum for KYC verification status
export enum KycStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Type definition for User document
export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  // Basic Information
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ trim: true })
  phone: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ trim: true })
  country: string;

  @Prop({ trim: true })
  occupation: string;

  @Prop({ trim: true })
  annualIncomeRange: string;

  @Prop({ trim: true })
  sourceOfFunds: string;

  @Prop({ trim: true })
  investmentExperience: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true })
  postalCode: string;

  // Account Settings
  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerificationToken: string;

  @Prop()
  emailVerificationExpires: Date;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetExpires: Date;

  // Two-Factor Authentication
  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop()
  twoFactorSecret: string;

  @Prop({ type: [String], default: [] })
  twoFactorBackupCodes: string[];

  // KYC Verification
  @Prop({ type: String, enum: KycStatus, default: KycStatus.NOT_SUBMITTED })
  kycStatus: KycStatus;

  @Prop()
  kycSubmittedAt: Date;

  @Prop()
  kycVerifiedAt: Date;

  @Prop()
  kycRejectionReason: string;

  // Referral System
  @Prop({ unique: true, sparse: true })
  referralCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referredBy: Types.ObjectId;

  @Prop({ default: 0 })
  referralEarnings: number;

  @Prop({ default: 0 })
  totalReferrals: number;

  // Profile
  @Prop()
  avatar: string;

  @Prop({ default: 'en' })
  preferredLanguage: string;

  @Prop({ default: 'USD' })
  preferredCurrency: string;

  @Prop({ default: 'dark' })
  theme: string;

  // Security
  @Prop()
  lastLogin: Date;

  @Prop()
  lastLoginIp: string;

  @Prop({ type: [String], default: [] })
  loginHistory: string[];

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop()
  lockUntil: Date;

  @Prop()
  lastActivity: Date;

  // Notification Preferences
  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: true })
  depositNotifications: boolean;

  @Prop({ default: true })
  withdrawalNotifications: boolean;

  @Prop({ default: true })
  investmentNotifications: boolean;

  @Prop({ default: true })
  securityAlerts: boolean;

  // Timestamps (auto-managed by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for efficient queries (removed duplicates - email and referralCode already have unique: true)
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
