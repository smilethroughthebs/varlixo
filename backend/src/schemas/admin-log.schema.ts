/**
 * ==============================================
 * VARLIXO - ADMIN LOG SCHEMA
 * ==============================================
 * Records all administrative actions for audit purposes.
 * Provides complete audit trail of admin activities.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Action types
export enum AdminActionType {
  // User management
  USER_VIEW = 'user_view',
  USER_UPDATE = 'user_update',
  USER_STATUS_CHANGE = 'user_status_change',
  USER_BALANCE_ADJUST = 'user_balance_adjust',
  USER_DELETE = 'user_delete',
  
  // KYC actions
  KYC_APPROVE = 'kyc_approve',
  KYC_REJECT = 'kyc_reject',
  KYC_REQUEST_RESUBMIT = 'kyc_request_resubmit',
  
  // Deposit actions
  DEPOSIT_APPROVE = 'deposit_approve',
  DEPOSIT_REJECT = 'deposit_reject',
  
  // Withdrawal actions
  WITHDRAWAL_APPROVE = 'withdrawal_approve',
  WITHDRAWAL_REJECT = 'withdrawal_reject',
  WITHDRAWAL_PROCESS = 'withdrawal_process',
  
  // Investment actions
  INVESTMENT_CANCEL = 'investment_cancel',
  INVESTMENT_MODIFY = 'investment_modify',
  INVESTMENT_PROCESS_PROFITS = 'investment_process_profits',

  // Recurring plan actions
  RECURRING_MARK_PAID = 'recurring_mark_paid',
  RECURRING_MARK_MISSED = 'recurring_mark_missed',
  RECURRING_UPDATE_PORTFOLIO = 'recurring_update_portfolio',
  RECURRING_APPROVE_WITHDRAWAL = 'recurring_approve_withdrawal',
  
  // Plan management
  PLAN_CREATE = 'plan_create',
  PLAN_UPDATE = 'plan_update',
  PLAN_DELETE = 'plan_delete',
  
  // System actions
  SYSTEM_SETTING_CHANGE = 'system_setting_change',
  ADMIN_LOGIN = 'admin_login',
  ADMIN_LOGOUT = 'admin_logout',
  
  // Other
  OTHER = 'other',
}

export type AdminLogDocument = AdminLog & Document;

@Schema({ timestamps: true })
export class AdminLog {
  // Admin who performed the action
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminId: Types.ObjectId;

  // Action details
  @Prop({ type: String, enum: AdminActionType, required: true })
  action: AdminActionType;

  @Prop({ required: true })
  description: string;

  // Target entity
  @Prop()
  targetType: string; // user, deposit, withdrawal, etc.

  @Prop({ type: Types.ObjectId })
  targetId: Types.ObjectId;

  // Changes made
  @Prop({ type: Object })
  previousValue: Record<string, any>;

  @Prop({ type: Object })
  newValue: Record<string, any>;

  // Request details
  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  requestUrl: string;

  @Prop()
  requestMethod: string;

  // Result
  @Prop({ default: true })
  success: boolean;

  @Prop()
  errorMessage: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const AdminLogSchema = SchemaFactory.createForClass(AdminLog);

// Indexes
AdminLogSchema.index({ adminId: 1, createdAt: -1 });
AdminLogSchema.index({ action: 1 });
AdminLogSchema.index({ targetType: 1, targetId: 1 });
AdminLogSchema.index({ createdAt: -1 });




