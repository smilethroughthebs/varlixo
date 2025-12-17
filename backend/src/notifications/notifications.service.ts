import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationPriority,
  NotificationType,
} from '../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  async create(params: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    actionUrl?: string;
    actionText?: string;
    relatedEntity?: string;
    relatedId?: string;
  }) {
    const doc = await this.notificationModel.create({
      userId: this.toObjectId(params.userId),
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority ?? NotificationPriority.MEDIUM,
      actionUrl: params.actionUrl,
      actionText: params.actionText,
      relatedEntity: params.relatedEntity,
      relatedId: params.relatedId ? this.toObjectId(params.relatedId) : undefined,
      isRead: false,
    });

    return doc;
  }

  async list(userId: string, opts?: { unreadOnly?: boolean; limit?: number; skip?: number }) {
    const unreadOnly = Boolean(opts?.unreadOnly);
    const limit = Math.min(Math.max(Number(opts?.limit ?? 50), 1), 200);
    const skip = Math.max(Number(opts?.skip ?? 0), 0);

    const query: any = { userId: this.toObjectId(userId) };
    if (unreadOnly) query.isRead = false;

    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return notifications;
  }

  async unreadCount(userId: string) {
    return this.notificationModel
      .countDocuments({ userId: this.toObjectId(userId), isRead: false })
      .exec();
  }

  async markRead(userId: string, id: string) {
    const updated = await this.notificationModel
      .findOneAndUpdate(
        { _id: this.toObjectId(id), userId: this.toObjectId(userId) },
        { $set: { isRead: true, readAt: new Date() } },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }

  async markAllRead(userId: string) {
    await this.notificationModel
      .updateMany(
        { userId: this.toObjectId(userId), isRead: false },
        { $set: { isRead: true, readAt: new Date() } },
      )
      .exec();

    return { ok: true };
  }

  async delete(userId: string, id: string) {
    const res = await this.notificationModel
      .deleteOne({ _id: this.toObjectId(id), userId: this.toObjectId(userId) })
      .exec();

    if (!res.deletedCount) throw new NotFoundException('Notification not found');
    return { ok: true };
  }

  async clearAll(userId: string) {
    await this.notificationModel.deleteMany({ userId: this.toObjectId(userId) }).exec();
    return { ok: true };
  }
}
