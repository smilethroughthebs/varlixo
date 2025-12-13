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
import { RecurringPlan, RecurringPlanSchema } from '../schemas/recurring-plan.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { CurrencyModule } from '../currency/currency.module';
import { EmailModule } from '../email/email.module';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentSchema },
      { name: InvestmentPlan.name, schema: InvestmentPlanSchema },
      { name: RecurringPlan.name, schema: RecurringPlanSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CurrencyModule,
    EmailModule,
    MarketModule,
  ],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}



