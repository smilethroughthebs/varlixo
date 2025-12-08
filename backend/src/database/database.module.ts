/**
 * ==============================================
 * VARLIXO - DATABASE MODULE
 * ==============================================
 * Handles database connection and seeding.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from '../schemas/user.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}






