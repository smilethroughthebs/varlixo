/**
 * ==============================================
 * VARLIXO - RECEIPT SCHEMA
 * ==============================================
 * Stores generated receipts for transactions.
 * Provides official documentation for completed transactions.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TransactionType, PaymentMethod } from './transaction.schema';

// Receipt status
export enum ReceiptStatus {
  GENERATED = 'generated',
  DOWNLOADED = 'downloaded',
  EMAILED = 'emailed',
  EXPIRED = 'expired',
}

// Type definition for Receipt document
export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt {
  // Reference to transaction
  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true, unique: true })
  transactionId: Types.ObjectId;

  // Reference to user
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // Receipt details
  @Prop({ required: true, unique: true })
  receiptNumber: string;

  @Prop({ type: String, enum: ReceiptStatus, default: ReceiptStatus.GENERATED })
  status: ReceiptStatus;

  @Prop({ required: true })
  issuedAt: Date;

  @Prop({ required: true })
  issuedBy: string; // Admin who issued or "System" for auto-generated

  @Prop({ required: true })
  transactionType: TransactionType;

  @Prop({ required: true })
  paymentMethod: PaymentMethod;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  fee: number;

  @Prop({ required: true })
  netAmount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  transactionRef: string;

  // Additional details
  @Prop()
  fromAddress?: string;

  @Prop()
  toAddress?: string;

  @Prop()
  txHash?: string;

  @Prop()
  bankName?: string;

  @Prop()
  accountNumber?: string;

  @Prop()
  accountName?: string;

  @Prop()
  adminNote?: string;

  // Metadata
  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

// Indexes for efficient queries
ReceiptSchema.index({ userId: 1 });
ReceiptSchema.index({ transactionId: 1 });
ReceiptSchema.index({ receiptNumber: 1 });
ReceiptSchema.index({ createdAt: -1 });
