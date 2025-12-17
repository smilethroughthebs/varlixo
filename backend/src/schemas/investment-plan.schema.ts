/**
 * ==============================================
 * VARLIXO - INVESTMENT PLAN SCHEMA
 * ==============================================
 * Defines available investment plans offered by the platform.
 * Admins can create and manage these plans.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Plan status
export enum PlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMING_SOON = 'coming_soon',
  DISCONTINUED = 'discontinued',
}

// Risk level
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export type InvestmentPlanDocument = InvestmentPlan & Document;

@Schema({ timestamps: true })
export class InvestmentPlan {
  // Plan identification
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  shortDescription: string;

  // Plan status
  @Prop({ type: String, enum: PlanStatus, default: PlanStatus.ACTIVE })
  status: PlanStatus;

  // Investment parameters
  @Prop({ required: true, min: 0 })
  minInvestment: number;

  @Prop({ required: true, min: 0 })
  maxInvestment: number;

  @Prop({ default: 'USD' })
  currency: string;

  // Country availability (optional). Empty = globally available.
  @Prop({ type: [String], default: [] })
  availableCountries: string[];

  // Country-specific limits (optional)
  @Prop({ type: [{
    country: { type: String, required: true },
    minInvestment: { type: Number, required: true, min: 0 },
    maxInvestment: { type: Number, required: true, min: 0 },
  }], default: [] })
  countryLimits: Array<{
    country: string;
    minInvestment: number;
    maxInvestment: number;
  }>;

  @Prop({ default: false })
  marketLinked: boolean;

  @Prop()
  marketAssetId: string;

  @Prop()
  marketBaseDailyRate: number;

  @Prop({ default: 0 })
  marketAlpha: number;

  @Prop()
  marketMinDailyRate: number;

  @Prop()
  marketMaxDailyRate: number;

  // Returns configuration
  @Prop({ required: true, min: 0 })
  dailyReturnRate: number; // Percentage

  @Prop({ required: true, min: 0 })
  totalReturnRate: number; // Total percentage return at maturity

  // Duration
  @Prop({ required: true, min: 1 })
  durationDays: number;

  // Payout settings
  @Prop({ default: false })
  principalReturn: boolean; // Whether principal is returned at maturity

  @Prop({ default: 'daily' })
  payoutFrequency: string; // daily, weekly, at_maturity

  // Risk and category
  @Prop({ type: String, enum: RiskLevel, default: RiskLevel.MEDIUM })
  riskLevel: RiskLevel;

  @Prop()
  category: string; // stocks, crypto, forex, real_estate, etc.

  // Display settings
  @Prop()
  icon: string;

  @Prop()
  color: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isPopular: boolean;

  // Features list
  @Prop({ type: [String], default: [] })
  features: string[];

  // Limits
  @Prop()
  maxActiveInvestments: number; // Max concurrent investments per user

  @Prop()
  totalSlots: number; // Total available slots

  @Prop({ default: 0 })
  usedSlots: number; // Currently used slots

  // Referral bonus for this plan
  @Prop({ default: 5 })
  referralBonusPercent: number;

  // Statistics
  @Prop({ default: 0 })
  totalInvestors: number;

  @Prop({ default: 0 })
  totalInvested: number;

  @Prop({ default: 0 })
  totalPaidOut: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const InvestmentPlanSchema = SchemaFactory.createForClass(InvestmentPlan);

// Indexes
InvestmentPlanSchema.index({ slug: 1 });
InvestmentPlanSchema.index({ status: 1 });
InvestmentPlanSchema.index({ sortOrder: 1 });




