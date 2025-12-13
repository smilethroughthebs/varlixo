/**
 * ==============================================
 * VARLIXO - ADMIN MODULE
 * ==============================================
 * Configures admin-related dependencies.
 */

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { LinkedWallet, LinkedWalletSchema } from '../schemas/linked-wallet.schema';
import { Deposit, DepositSchema } from '../schemas/deposit.schema';
import { Withdrawal, WithdrawalSchema } from '../schemas/withdrawal.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { Investment, InvestmentSchema } from '../schemas/investment.schema';
import { AdminLog, AdminLogSchema } from '../schemas/admin-log.schema';
import { EmailModule } from '../email/email.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: LinkedWallet.name, schema: LinkedWalletSchema },
      { name: Deposit.name, schema: DepositSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: AdminLog.name, schema: AdminLogSchema },
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
    forwardRef(() => EmailModule),
    CurrencyModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}



