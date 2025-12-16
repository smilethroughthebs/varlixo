import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import {
  SupportChatConversation,
  SupportChatConversationSchema,
} from '../schemas/support-chat-conversation.schema';
import {
  SupportChatMessage,
  SupportChatMessageSchema,
} from '../schemas/support-chat-message.schema';
import { SupportChatService } from './support-chat.service';
import { SupportChatGateway } from './support-chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportChatConversation.name, schema: SupportChatConversationSchema },
      { name: SupportChatMessage.name, schema: SupportChatMessageSchema },
    ]),
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
  ],
  providers: [SupportChatService, SupportChatGateway],
  exports: [SupportChatService],
})
export class SupportChatModule {}
