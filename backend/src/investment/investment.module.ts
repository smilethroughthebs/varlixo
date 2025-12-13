/**
 * ==============================================
 * VARLIXO - INVESTMENT MODULE
 * ==============================================
 * Configures investment-related dependencies.
 */

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';
import { InvestmentPlan, InvestmentPlanSchema } from '../schemas/investment-plan.schema';
import { Investment, InvestmentSchema } from '../schemas/investment.schema';
import { RecurringPlan, RecurringPlanSchema } from '../schemas/recurring-plan.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { Referral, ReferralSchema } from '../schemas/referral.schema';
import { AdminLog, AdminLogSchema } from '../schemas/admin-log.schema';
import { EmailModule } from '../email/email.module';
import { CurrencyModule } from '../currency/currency.module';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvestmentPlan.name, schema: InvestmentPlanSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: RecurringPlan.name, schema: RecurringPlanSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Referral.name, schema: ReferralSchema },
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
    MarketModule,
  ],
  controllers: [InvestmentController],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}



