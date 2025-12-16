import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SupportChatConversation,
  SupportChatConversationDocument,
  SupportChatConversationStatus,
} from '../schemas/support-chat-conversation.schema';
import {
  SupportChatMessage,
  SupportChatMessageDocument,
  SupportChatSenderKind,
} from '../schemas/support-chat-message.schema';

@Injectable()
export class SupportChatService {
  constructor(
    @InjectModel(SupportChatConversation.name)
    private readonly conversationModel: Model<SupportChatConversationDocument>,
    @InjectModel(SupportChatMessage.name)
    private readonly messageModel: Model<SupportChatMessageDocument>,
  ) {}

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  async getOrCreateOpenConversationForUser(userId: string) {
    const userObjectId = this.toObjectId(userId);

    const existing = await this.conversationModel
      .findOne({ userId: userObjectId, status: SupportChatConversationStatus.OPEN })
      .sort({ lastMessageAt: -1 })
      .exec();

    if (existing) return existing;

    return this.conversationModel.create({
      userId: userObjectId,
      status: SupportChatConversationStatus.OPEN,
      lastMessageAt: new Date(),
    });
  }

  async getOrCreateOpenConversationForUserWithFlag(userId: string): Promise<{
    conversation: SupportChatConversationDocument;
    created: boolean;
  }> {
    const userObjectId = this.toObjectId(userId);

    const existing = await this.conversationModel
      .findOne({ userId: userObjectId, status: SupportChatConversationStatus.OPEN })
      .sort({ lastMessageAt: -1 })
      .exec();

    if (existing) {
      return { conversation: existing, created: false };
    }

    const conversation = await this.conversationModel.create({
      userId: userObjectId,
      status: SupportChatConversationStatus.OPEN,
      lastMessageAt: new Date(),
    });

    return { conversation, created: true };
  }

  async getConversationById(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(this.toObjectId(conversationId))
      .exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async addMessage(params: {
    conversationId: string;
    senderId: string;
    senderKind: SupportChatSenderKind;
    text: string;
  }) {
    const message = await this.messageModel.create({
      conversationId: this.toObjectId(params.conversationId),
      senderId: this.toObjectId(params.senderId),
      senderKind: params.senderKind,
      text: params.text.trim(),
    });

    await this.conversationModel
      .updateOne(
        { _id: this.toObjectId(params.conversationId) },
        { $set: { lastMessageAt: new Date() } },
      )
      .exec();

    return message;
  }

  async listOpenConversations(limit = 50) {
    const conversations = await this.conversationModel
      .find({ status: SupportChatConversationStatus.OPEN })
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .exec();

    return conversations;
  }

  async getMessages(conversationId: string, limit = 50) {
    const messages = await this.messageModel
      .find({ conversationId: this.toObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();

    return messages;
  }
}
