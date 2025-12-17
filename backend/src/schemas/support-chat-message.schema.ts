import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SupportChatSenderKind {
  USER = 'user',
  ADMIN = 'admin',
}

export enum SupportChatMessageType {
  TEXT = 'text',
  IMAGE = 'image',
}

export type SupportChatMessageDocument = SupportChatMessage & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class SupportChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'SupportChatConversation', required: true, index: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, enum: SupportChatSenderKind, required: true, index: true })
  senderKind: SupportChatSenderKind;

  @Prop({ type: String, enum: SupportChatMessageType, default: SupportChatMessageType.TEXT, index: true })
  messageType: SupportChatMessageType;

  @Prop({ trim: true })
  text?: string;

  @Prop({ trim: true })
  imageUrl?: string;

  createdAt: Date;
}

export const SupportChatMessageSchema = SchemaFactory.createForClass(SupportChatMessage);

SupportChatMessageSchema.index({ conversationId: 1, createdAt: 1 });
