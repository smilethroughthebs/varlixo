/**
 * ==============================================
 * VARLIXO - KYC MODULE
 * ==============================================
 * Configures KYC-related dependencies.
 */

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { Kyc, KycSchema } from '../schemas/kyc.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Kyc.name, schema: KycSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MulterModule.register({
      dest: './uploads/kyc',
    }),
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
    forwardRef(() => EmailModule),
    NotificationsModule,
  ],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
