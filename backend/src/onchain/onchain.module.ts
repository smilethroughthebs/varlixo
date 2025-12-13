import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnchainService } from './onchain.service';
import { OnchainDeposit, OnchainDepositSchema } from '../schemas/onchain-deposit.schema';
import { OnchainIndexerState, OnchainIndexerStateSchema } from '../schemas/onchain-indexer-state.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { LinkedWallet, LinkedWalletSchema } from '../schemas/linked-wallet.schema';
import { CurrencyModule } from '../currency/currency.module';
import { MarketModule } from '../market/market.module';
import { OnchainController } from './onchain.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnchainDeposit.name, schema: OnchainDepositSchema },
      { name: OnchainIndexerState.name, schema: OnchainIndexerStateSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: LinkedWallet.name, schema: LinkedWalletSchema },
    ]),
    CurrencyModule,
    MarketModule,
  ],
  controllers: [OnchainController],
  providers: [OnchainService],
  exports: [OnchainService],
})
export class OnchainModule {}
