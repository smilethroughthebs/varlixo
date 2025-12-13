import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OnchainDepositDocument = OnchainDeposit & Document;

export enum OnchainChain {
  EVM = 'evm',
  SOLANA = 'solana',
}

export enum OnchainDepositStatus {
  DETECTED = 'detected',
  CONFIRMED = 'confirmed',
  SETTLING = 'crediting',
  SETTLED = 'credited',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class OnchainDeposit {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ type: String, enum: OnchainChain, required: true, index: true })
  chain: OnchainChain;

  @Prop({ required: true, index: true })
  network: string;

  @Prop({ required: true, index: true })
  asset: string;

  @Prop({ index: true })
  txHash?: string;

  @Prop({ index: true })
  signature?: string;

  @Prop()
  logIndex?: number;

  @Prop()
  fromAddress?: string;

  @Prop()
  toAddress?: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  amountUsd?: number;

  @Prop({ default: 0 })
  confirmations: number;

  @Prop({ default: 0 })
  requiredConfirmations: number;

  @Prop({ type: String, enum: OnchainDepositStatus, default: OnchainDepositStatus.DETECTED, index: true })
  status: OnchainDepositStatus;

  @Prop({ default: false, index: true })
  credited: boolean;

  @Prop()
  creditedAt?: Date;

  @Prop()
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OnchainDepositSchema = SchemaFactory.createForClass(OnchainDeposit);

OnchainDepositSchema.index({ chain: 1, network: 1, txHash: 1, logIndex: 1 }, { unique: true, sparse: true });
OnchainDepositSchema.index({ chain: 1, network: 1, signature: 1, asset: 1, toAddress: 1 }, { unique: true, sparse: true });
