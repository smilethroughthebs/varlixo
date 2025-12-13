import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LinkedWalletDocument = LinkedWallet & Document;

export enum LinkedWalletChain {
  EVM = 'evm',
  SOLANA = 'solana',
}

@Schema({ timestamps: true })
export class LinkedWallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: LinkedWalletChain, required: true, index: true })
  chain: LinkedWalletChain;

  @Prop({ type: String, required: true, trim: true, index: true })
  address: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop()
  verifiedAt: Date;

  @Prop({ trim: true })
  label: string;

  @Prop()
  pendingNonce: string;

  @Prop()
  pendingMessage: string;

  @Prop()
  lastLinkedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const LinkedWalletSchema = SchemaFactory.createForClass(LinkedWallet);

LinkedWalletSchema.index({ userId: 1, chain: 1, address: 1 }, { unique: true });
