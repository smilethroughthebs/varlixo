import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SupportChatConversationStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export type SupportChatConversationDocument = SupportChatConversation & Document;

@Schema({ timestamps: true })
export class SupportChatConversation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: SupportChatConversationStatus, default: SupportChatConversationStatus.OPEN, index: true })
  status: SupportChatConversationStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedAdminId: Types.ObjectId;

  @Prop({ type: Date })
  assignedAt?: Date;

  @Prop({ type: Date })
  firstUserMessageAt?: Date;

  @Prop({ type: Date })
  lastUserMessageAt?: Date;

  @Prop({ type: Date })
  firstAdminReplyAt?: Date;

  @Prop({ type: Date })
  lastAdminReplyAt?: Date;

  @Prop({ type: Date, default: Date.now, index: true })
  lastMessageAt: Date;

  @Prop({ default: false })
  adminNotified: boolean;

  @Prop({ type: Date })
  adminNotifiedAt?: Date;

  @Prop({ type: Date })
  adminNotificationLastAttemptAt?: Date;

  @Prop({ type: String })
  adminNotificationLastError?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const SupportChatConversationSchema = SchemaFactory.createForClass(SupportChatConversation);

SupportChatConversationSchema.index({ status: 1, lastMessageAt: -1 });
SupportChatConversationSchema.index({ userId: 1, status: 1, lastMessageAt: -1 });
