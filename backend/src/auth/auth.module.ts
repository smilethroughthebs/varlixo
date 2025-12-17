/**
 * ==============================================
 * VARLIXO - AUTHENTICATION MODULE
 * ==============================================
 * Configures authentication providers and dependencies.
 */

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { Referral, ReferralSchema } from '../schemas/referral.schema';
import { Otp, OtpSchema } from '../schemas/otp.schema';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
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
    forwardRef(() => EmailModule), // Use forwardRef to handle circular dependency
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService],
  exports: [AuthService, OtpService, JwtModule],
})
export class AuthModule {}
