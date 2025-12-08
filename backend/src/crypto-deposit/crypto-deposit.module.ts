import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoDepositController } from './crypto-deposit.controller';
import { CryptoDepositService } from './crypto-deposit.service';
import { CryptoDeposit, CryptoDepositSchema } from '../schemas/crypto-deposit.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CryptoDeposit.name, schema: CryptoDepositSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    EmailModule,
  ],
  controllers: [CryptoDepositController],
  providers: [CryptoDepositService],
  exports: [CryptoDepositService],
})
export class CryptoDepositModule {}
