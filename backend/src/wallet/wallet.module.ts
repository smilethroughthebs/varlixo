/**
 * ==============================================
 * VARLIXO - WALLET MODULE
 * ==============================================
 * Configures wallet-related dependencies.
 */

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { LinkedWallet, LinkedWalletSchema } from '../schemas/linked-wallet.schema';
import { Deposit, DepositSchema } from '../schemas/deposit.schema';
import { Withdrawal, WithdrawalSchema } from '../schemas/withdrawal.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { EmailModule } from '../email/email.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
      { name: LinkedWallet.name, schema: LinkedWalletSchema },
      { name: Deposit.name, schema: DepositSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
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
    CurrencyModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
