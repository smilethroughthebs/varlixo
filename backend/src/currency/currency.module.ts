/**
 * ==============================================
 * VARLIXO - CURRENCY MODULE
 * ==============================================
 * Module for multi-currency support
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { CountryRules, CountryRulesSchema } from '../schemas/country-rules.schema';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CountryRules.name, schema: CountryRulesSchema },
    ]),
    ConfigModule,
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
