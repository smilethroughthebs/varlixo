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
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { Referral, ReferralSchema } from '../schemas/referral.schema';
import { EmailModule } from '../email/email.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvestmentPlan.name, schema: InvestmentPlanSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Referral.name, schema: ReferralSchema },
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
  controllers: [InvestmentController],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}



