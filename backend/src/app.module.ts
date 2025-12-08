/**
 * ==============================================
 * VARLIXO - ROOT APPLICATION MODULE
 * ==============================================
 * Main module that imports and configures all feature modules.
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { WalletModule } from './wallet/wallet.module';
import { KycModule } from './kyc/kyc.module';
import { InvestmentModule } from './investment/investment.module';
import { AdminModule } from './admin/admin.module';
import { ReferralModule } from './referral/referral.module';
import { CronModule } from './cron/cron.module';
import { MarketModule } from './market/market.module';
import { DatabaseModule } from './database/database.module';
import { CurrencyModule } from './currency/currency.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { CryptoDepositModule } from './crypto-deposit/crypto-deposit.module';

// Middleware
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        retryWrites: true,
        w: 'majority',
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ([{
        ttl: configService.get<number>('rateLimit.ttl') * 1000,
        limit: configService.get<number>('rateLimit.max'),
      }]),
    }),

    // Scheduled Tasks (Cron Jobs)
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    EmailModule,
    WalletModule,
    KycModule,
    InvestmentModule,
    AdminModule,
    ReferralModule,
    CronModule,
    MarketModule,
    DatabaseModule,
    CurrencyModule,
    TestimonialModule,
    CryptoDepositModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to all routes
    consumer
      .apply(SecurityMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}
