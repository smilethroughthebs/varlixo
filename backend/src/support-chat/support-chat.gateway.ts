import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { SupportChatService } from './support-chat.service';
import { JwtPayload } from '../auth/auth.service';
import { UserRole } from '../schemas/user.schema';
import { SupportChatSenderKind } from '../schemas/support-chat-message.schema';

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

  constructor(
    private readonly chatService: SupportChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  private roomForUser(userId: string) {
    return `user:${userId}`;
  }

  async handleConnection(client: AuthedSocket) {
    const user = await this.requireAuth(client);
    client.join(this.roomForUser(user.sub));

    client.emit('support:connected', {
      userId: user.sub,
      role: user.role,
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

    const conversation = await this.chatService.getOrCreateOpenConversationForUser(user.sub);

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
    }));
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
