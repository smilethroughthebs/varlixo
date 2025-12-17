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
      .populate('userId', 'firstName lastName email')
      .exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async addMessage(params: {
    conversationId: string;
    senderId: string;
    senderKind: SupportChatSenderKind;
    text?: string;
    imageUrl?: string;
    messageType?: 'text' | 'image';
  }) {
    const now = new Date();

    const rawText = (params.text ?? '').trim();
    const imageUrl = (params.imageUrl ?? '').trim();
    const messageType = params.messageType ?? (imageUrl ? 'image' : 'text');

    if (messageType === 'text' && !rawText) {
      throw new NotFoundException('Message text is required');
    }
    if (messageType === 'image' && !imageUrl) {
      throw new NotFoundException('imageUrl is required');
    }

    const message = await this.messageModel.create({
      conversationId: this.toObjectId(params.conversationId),
      senderId: this.toObjectId(params.senderId),
      senderKind: params.senderKind,
      messageType,
      text: rawText || undefined,
      imageUrl: imageUrl || undefined,
    });

    await this.conversationModel
      .updateOne(
        { _id: this.toObjectId(params.conversationId) },
        params.senderKind === SupportChatSenderKind.USER
          ? {
              $set: {
                lastMessageAt: now,
                lastUserMessageAt: now,
              },
              $setOnInsert: {
                firstUserMessageAt: now,
              },
            }
          : {
              $set: {
                lastMessageAt: now,
                lastAdminReplyAt: now,
              },
              $setOnInsert: {
                firstAdminReplyAt: now,
              },
            },
      )
      .exec();

    // Ensure first* fields are set the first time they occur.
    // $setOnInsert only applies on upsert; we aren't using upsert above.
    // So we do a small follow-up set-if-null update.
    if (params.senderKind === SupportChatSenderKind.USER) {
      await this.conversationModel
        .updateOne(
          { _id: this.toObjectId(params.conversationId), firstUserMessageAt: { $exists: false } },
          { $set: { firstUserMessageAt: now } },
        )
        .exec();
    } else {
      await this.conversationModel
        .updateOne(
          { _id: this.toObjectId(params.conversationId), firstAdminReplyAt: { $exists: false } },
          { $set: { firstAdminReplyAt: now } },
        )
        .exec();
    }

    return message;
  }

  async assignConversation(conversationId: string, adminId: string) {
    const adminObjectId = this.toObjectId(adminId);

    const updated = await this.conversationModel
      .findOneAndUpdate(
        {
          _id: this.toObjectId(conversationId),
          $or: [{ assignedAdminId: { $exists: false } }, { assignedAdminId: adminObjectId }],
        },
        {
          $set: {
            assignedAdminId: adminObjectId,
            assignedAt: new Date(),
          },
        },
        { new: true },
      )
      .populate('userId', 'firstName lastName email')
      .exec();

    // If update didn't match, someone else has it.
    if (!updated) {
      return this.getConversationById(conversationId);
    }

    return updated;
  }

  async unassignConversation(conversationId: string) {
    await this.getConversationById(conversationId);

    await this.conversationModel
      .updateOne(
        { _id: this.toObjectId(conversationId) },
        {
          $unset: {
            assignedAdminId: 1,
            assignedAt: 1,
          },
        },
      )
      .exec();

    return this.getConversationById(conversationId);
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

  async markAdminNotified(conversationId: string) {
    await this.conversationModel
      .updateOne(
        { _id: this.toObjectId(conversationId) },
        {
          $set: {
            adminNotified: true,
            adminNotifiedAt: new Date(),
            adminNotificationLastAttemptAt: new Date(),
            adminNotificationLastError: undefined,
          },
        },
      )
      .exec();
  }

  async markAdminNotificationFailed(conversationId: string, errorMessage: string) {
    await this.conversationModel
      .updateOne(
        { _id: this.toObjectId(conversationId) },
        {
          $set: {
            adminNotificationLastAttemptAt: new Date(),
            adminNotificationLastError: String(errorMessage || '').slice(0, 500),
          },
        },
      )
      .exec();
  }
}
