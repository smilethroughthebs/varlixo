import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { SupportChatService } from './support-chat.service';
import { JwtPayload } from '../auth/auth.service';
import { UserRole } from '../schemas/user.schema';
import { SupportChatSenderKind } from '../schemas/support-chat-message.schema';
import { EmailService } from '../email/email.service';
import { AppSettings, AppSettingsDocument } from '../schemas/app-settings.schema';

type AuthedSocket = Socket & {
  data: {
    user?: JwtPayload;
  };
};

@WebSocketGateway({
  namespace: '/support-chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class SupportChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SupportChatGateway.name);

  constructor(
    private readonly chatService: SupportChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectModel(AppSettings.name)
    private readonly appSettingsModel: Model<AppSettingsDocument>,
  ) {}

  private extractToken(socket: Socket): string | undefined {
    const authToken = (socket.handshake as any)?.auth?.token as string | undefined;
    if (authToken) return authToken;

    const header = socket.handshake.headers?.authorization;
    if (!header) return undefined;

    const [type, token] = header.split(' ');
    if (type === 'Bearer' && token) return token;

    return undefined;
  }

  private isAdmin(user?: JwtPayload) {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  }

  private async requireAuth(socket: AuthedSocket): Promise<JwtPayload> {
    if (socket.data.user) return socket.data.user;

    const token = this.extractToken(socket);
    if (!token) throw new WsException('Access token is required');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      socket.data.user = payload;
      return payload;
    } catch {
      throw new WsException('Invalid or expired token');
    }
  }

  private roomForConversation(conversationId: string) {
    return `conv:${conversationId}`;
  }

  private roomForAdmins() {
    return 'admins';
  }

  private roomForUser(userId: string) {
    return `user:${userId}`;
  }

  async handleConnection(client: AuthedSocket) {
    const user = await this.requireAuth(client);
    client.join(this.roomForUser(user.sub));

    if (this.isAdmin(user)) {
      client.join(this.roomForAdmins());
    }

    client.emit('support:connected', {
      userId: user.sub,
      role: user.role,
    });
  }

  private emitConversationUpdated(conversation: any) {
    this.server.to(this.roomForAdmins()).emit('support:conversation_updated', {
      id: conversation._id.toString(),
      user: conversation.userId
        ? {
            id: conversation.userId._id?.toString?.() ?? conversation.userId.toString(),
            firstName: conversation.userId.firstName,
            lastName: conversation.userId.lastName,
            email: conversation.userId.email,
          }
        : undefined,
      status: conversation.status,
      lastMessageAt: conversation.lastMessageAt,
      assignedAdminId: conversation.assignedAdminId?.toString?.(),
      assignedAt: conversation.assignedAt,
      firstUserMessageAt: conversation.firstUserMessageAt,
      lastUserMessageAt: conversation.lastUserMessageAt,
      firstAdminReplyAt: conversation.firstAdminReplyAt,
      lastAdminReplyAt: conversation.lastAdminReplyAt,
    });
  }

  @SubscribeMessage('support:client_start')
  async clientStart(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { message?: string },
  ) {
    const user = await this.requireAuth(client);
    if (this.isAdmin(user)) {
      throw new WsException('Admins cannot start a client chat');
    }

    const { conversation, created } =
      await this.chatService.getOrCreateOpenConversationForUserWithFlag(user.sub);

    const conversationId = conversation._id.toString();
    client.join(this.roomForConversation(conversationId));

    client.emit('support:conversation', {
      conversationId,
      status: conversation.status,
      lastMessageAt: conversation.lastMessageAt,
    });

    if (body?.message && body.message.trim()) {
      const message = await this.chatService.addMessage({
        conversationId,
        senderId: user.sub,
        senderKind: SupportChatSenderKind.USER,
        text: body.message,
      });

      this.server.to(this.roomForConversation(conversationId)).emit('support:message', {
        id: message._id.toString(),
        conversationId,
        senderId: user.sub,
        senderKind: message.senderKind,
        text: message.text,
        createdAt: message.createdAt,
      });
    }

    if (!conversation.adminNotified) {
      try {
        const appSettings = await this.appSettingsModel
          .findOne({ key: 'global' })
          .select('adminEmail emailNotifications')
          .exec();

        const emailNotificationsEnabled = appSettings?.emailNotifications !== false;
        if (!emailNotificationsEnabled) {
          await this.chatService.markAdminNotificationFailed(conversationId, 'Email notifications disabled');
        } else {
          const adminEmail =
            appSettings?.adminEmail ||
            this.configService.get<string>('email.adminEmail') ||
            'admin@varlixo.com';

          const firstMsg = body?.message?.trim();
          const subject = '🟢 New Live Chat Started - Varlixo';
          const adminBody = firstMsg
            ? `A user started a new live chat.

Conversation ID: ${conversationId}

User: ${user.email}

First message:
${firstMsg}`
            : `A user started a new live chat.

Conversation ID: ${conversationId}

User: ${user.email}`;

          const sent = await this.emailService.sendAdminCustomUserEmail(
            adminEmail,
            'Admin',
            subject,
            adminBody,
          );

          if (sent) {
            await this.chatService.markAdminNotified(conversationId);
            this.logger.log(`Live chat admin notification sent to ${adminEmail} for conversation ${conversationId}`);
          } else {
            await this.chatService.markAdminNotificationFailed(conversationId, 'Email send returned false');
            this.logger.warn(`Live chat admin notification failed (send returned false) for conversation ${conversationId}`);
          }
        }
      } catch (error: any) {
        await this.chatService.markAdminNotificationFailed(
          conversationId,
          error?.message || 'Unknown error',
        );
        this.logger.error(
          `Live chat admin notification exception for conversation ${conversationId}: ${error?.message || error}`,
        );
      }
    }

    const messages = await this.chatService.getMessages(conversationId, 50);
    client.emit(
      'support:messages',
      messages.map((m) => ({
        id: m._id.toString(),
        conversationId: m.conversationId.toString(),
        senderId: m.senderId.toString(),
        senderKind: m.senderKind,
        text: m.text,
        createdAt: m.createdAt,
      })),
    );

    return { conversationId };
  }

  @SubscribeMessage('support:message')
  async sendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: string; text: string },
  ) {
    const user = await this.requireAuth(client);

    const text = body?.text?.trim();
    if (!body?.conversationId || !text) {
      throw new WsException('conversationId and text are required');
    }

    const conversation = await this.chatService.getConversationById(body.conversationId);

    const isAdmin = this.isAdmin(user);
    if (!isAdmin) {
      if (conversation.userId.toString() !== user.sub) {
        throw new WsException('Forbidden');
      }
    } else {
      // If an admin replies to an unassigned conversation, claim it automatically.
      if (!conversation.assignedAdminId) {
        await this.chatService.assignConversation(body.conversationId, user.sub);
      }

      const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
      if (
        !isSuperAdmin &&
        conversation.assignedAdminId &&
        conversation.assignedAdminId.toString() !== user.sub
      ) {
        throw new WsException('Conversation is assigned to another admin');
      }
    }

    const message = await this.chatService.addMessage({
      conversationId: body.conversationId,
      senderId: user.sub,
      senderKind: isAdmin ? SupportChatSenderKind.ADMIN : SupportChatSenderKind.USER,
      text,
    });

    this.server.to(this.roomForConversation(body.conversationId)).emit('support:message', {
      id: message._id.toString(),
      conversationId: body.conversationId,
      senderId: user.sub,
      senderKind: message.senderKind,
      text: message.text,
      createdAt: message.createdAt,
    });

    const updated = await this.chatService.getConversationById(body.conversationId);
    this.emitConversationUpdated(updated);

    return { ok: true };
  }

  @SubscribeMessage('support:admin_list')
  async adminList(@ConnectedSocket() client: AuthedSocket) {
    const user = await this.requireAuth(client);
    if (!this.isAdmin(user)) throw new WsException('Forbidden');

    const conversations = await this.chatService.listOpenConversations(100);

    return conversations.map((c: any) => ({
      id: c._id.toString(),
      user: c.userId
        ? {
            id: c.userId._id?.toString?.() ?? c.userId.toString(),
            firstName: c.userId.firstName,
            lastName: c.userId.lastName,
            email: c.userId.email,
          }
        : undefined,
      status: c.status,
      lastMessageAt: c.lastMessageAt,
      assignedAdminId: c.assignedAdminId?.toString?.(),
      assignedAt: c.assignedAt,
      firstUserMessageAt: c.firstUserMessageAt,
      lastUserMessageAt: c.lastUserMessageAt,
      firstAdminReplyAt: c.firstAdminReplyAt,
      lastAdminReplyAt: c.lastAdminReplyAt,
    }));
  }

  @SubscribeMessage('support:admin_assign')
  async adminAssign(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: string },
  ) {
    const user = await this.requireAuth(client);
    if (!this.isAdmin(user)) throw new WsException('Forbidden');
    if (!body?.conversationId) throw new WsException('conversationId is required');

    const updated = await this.chatService.assignConversation(body.conversationId, user.sub);
    this.emitConversationUpdated(updated);

    return {
      ok: true,
      conversationId: body.conversationId,
      assignedAdminId: updated.assignedAdminId?.toString?.(),
    };
  }

  @SubscribeMessage('support:admin_unassign')
  async adminUnassign(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: string },
  ) {
    const user = await this.requireAuth(client);
    if (!this.isAdmin(user)) throw new WsException('Forbidden');
    if (!body?.conversationId) throw new WsException('conversationId is required');

    const conversation = await this.chatService.getConversationById(body.conversationId);
    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    if (!isSuperAdmin && conversation.assignedAdminId?.toString?.() !== user.sub) {
      throw new WsException('Only the assigned admin can unassign');
    }

    const updated = await this.chatService.unassignConversation(body.conversationId);
    this.emitConversationUpdated(updated);

    return { ok: true };
  }

  @SubscribeMessage('support:admin_join')
  async adminJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { conversationId: string },
  ) {
    const user = await this.requireAuth(client);
    if (!this.isAdmin(user)) throw new WsException('Forbidden');

    if (!body?.conversationId) throw new WsException('conversationId is required');

    await this.chatService.getConversationById(body.conversationId);

    client.join(this.roomForConversation(body.conversationId));

    const messages = await this.chatService.getMessages(body.conversationId, 100);
    client.emit(
      'support:messages',
      messages.map((m) => ({
        id: m._id.toString(),
        conversationId: m.conversationId.toString(),
        senderId: m.senderId.toString(),
        senderKind: m.senderKind,
        text: m.text,
        createdAt: m.createdAt,
      })),
    );

    return { ok: true };
  }
}
