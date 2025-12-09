/**
 * ==============================================
 * VARLIXO - CRON MODULE
 * ==============================================
 * Configures scheduled task dependencies.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronService } from './cron.service';
import { Investment, InvestmentSchema } from '../schemas/investment.schema';
import { InvestmentPlan, InvestmentPlanSchema } from '../schemas/investment-plan.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentSchema },
      { name: InvestmentPlan.name, schema: InvestmentPlanSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CurrencyModule,
  ],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}



