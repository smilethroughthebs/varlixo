/**
 * ==============================================
 * VARLIXO - INVESTMENT SCHEMA
 * ==============================================
 * Tracks active and completed investments made by users.
 * Records profit accumulation and payout history.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Investment status
export enum InvestmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MATURED = 'matured',
}

export type InvestmentDocument = Investment & Document;

@Schema({ timestamps: true })
export class Investment {
  // References
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'InvestmentPlan', required: true })
  planId: Types.ObjectId;

  // Investment reference
  @Prop({ required: true, unique: true })
  investmentRef: string;

  // Plan details snapshot (in case plan changes)
  @Prop({ required: true })
  planName: string;

  @Prop({ required: true })
  dailyReturnRate: number;

  @Prop({ required: true })
  totalReturnRate: number;

  @Prop({ required: true })
  durationDays: number;

  @Prop({ default: false })
  principalReturn: boolean;

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

  @Prop()
  marketLastPrice: number;

  // Amount
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'USD' })
  currency: string;

  // Status
  @Prop({ type: String, enum: InvestmentStatus, default: InvestmentStatus.PENDING })
  status: InvestmentStatus;

  // Dates
  @Prop()
  activatedAt: Date;

  @Prop()
  maturityDate: Date;

  @Prop()
  completedAt: Date;

  // Profit tracking
  @Prop({ default: 0 })
  expectedTotalProfit: number;

  @Prop({ default: 0 })
  accumulatedProfit: number;

  @Prop({ default: 0 })
  paidOutProfit: number;

  @Prop({ default: 0 })
  pendingProfit: number;

  // Daily profit for calculations
  @Prop()
  dailyProfitAmount: number;

  // Progress
  @Prop({ default: 0 })
  daysCompleted: number;

  @Prop()
  lastProfitDate: Date;

  // Profit history
  @Prop({ type: [{ date: Date, amount: Number, status: String }], default: [] })
  profitHistory: Array<{ date: Date; amount: number; status: string }>;

  // Auto-compound settings
  @Prop({ default: false })
  autoCompound: boolean;

  @Prop({ default: 0 })
  compoundedAmount: number;

  // Early termination
  @Prop({ default: false })
  allowEarlyTermination: boolean;

  @Prop()
  earlyTerminationFee: number;

  // Referral tracking
  @Prop({ type: Types.ObjectId, ref: 'User' })
  referrerId: Types.ObjectId;

  @Prop({ default: 0 })
  referralBonusPaid: number;

  // Metadata
  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  // Notes
  @Prop()
  adminNote: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);

// Indexes
InvestmentSchema.index({ userId: 1, status: 1 });
InvestmentSchema.index({ investmentRef: 1 });
InvestmentSchema.index({ status: 1 });
InvestmentSchema.index({ maturityDate: 1 });
InvestmentSchema.index({ createdAt: -1 });




