import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CryptoDepositDocument = CryptoDeposit & Document;

export enum CryptoCurrency {
  BTC = 'BTC',
  ETH = 'ETH',
  USDT_TRC20 = 'USDT_TRC20',
}

export enum CryptoDepositStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class CryptoDeposit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: CryptoCurrency, required: true })
  currency: CryptoCurrency;

  @Prop({ required: true, min: 0 })
  amountCrypto: number;

  @Prop({ min: 0 })
  amountUsd?: number;

  @Prop({ required: true })
  address: string;

  @Prop()
  network?: string;

  @Prop()
  txHash?: string;

  @Prop()
  proofImage?: string;

  @Prop({ type: String, enum: CryptoDepositStatus, default: CryptoDepositStatus.PENDING })
  status: CryptoDepositStatus;

  @Prop()
  adminNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CryptoDepositSchema = SchemaFactory.createForClass(CryptoDeposit);

CryptoDepositSchema.index({ userId: 1, createdAt: -1 });
CryptoDepositSchema.index({ status: 1, createdAt: -1 });
