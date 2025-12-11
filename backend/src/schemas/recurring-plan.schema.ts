import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum RecurringPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  MISSED = 'missed',
  MATURED = 'matured',
}

export type RecurringPlanDocument = RecurringPlan & Document;

@Schema({ timestamps: true })
export class RecurringPlan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  planType: string;

  @Prop({ required: true, min: 0 })
  monthlyContribution: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  nextPaymentDate: Date;

  @Prop({ required: true })
  maturityDate: Date;

  @Prop({ default: 0 })
  monthsCompleted: number;

  @Prop({ required: true })
  monthsRequired: number;

  @Prop({ default: 0 })
  totalContributed: number;

  @Prop({ default: 0 })
  portfolioValue: number;

  @Prop({
    type: [
      {
        monthNumber: Number,
        amount: Number,
        datePaid: Date,
        status: String,
      },
    ],
    default: [],
  })
  paymentHistory: Array<{
    monthNumber: number;
    amount: number;
    datePaid: Date;
    status: string;
  }>;

  @Prop({ type: String, enum: RecurringPlanStatus, default: RecurringPlanStatus.ACTIVE })
  status: RecurringPlanStatus;

  @Prop({ default: false })
  withdrawalRequested: boolean;

  @Prop({ default: false })
  withdrawalApproved: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const RecurringPlanSchema = SchemaFactory.createForClass(RecurringPlan);

RecurringPlanSchema.index({ userId: 1, status: 1 });
RecurringPlanSchema.index({ planType: 1, userId: 1 });
