import { OnchainService } from './onchain.service';
import { OnchainDepositStatus, OnchainChain } from '../schemas/onchain-deposit.schema';
import { TransactionType } from '../schemas/transaction.schema';

describe('OnchainService', () => {
  it('does not double-credit when a matching transaction already exists', async () => {
    const onchainDepositModel: any = {
      find: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          {
            _id: 'dep1',
            userId: 'user1',
            chain: OnchainChain.EVM,
            network: 'ethereum',
            asset: 'USDT',
            txHash: '0xabc',
            logIndex: 12,
            fromAddress: '0xfrom',
            toAddress: '0xto',
            amount: 10,
            confirmations: 20,
            status: OnchainDepositStatus.CONFIRMED,
            credited: false,
          },
        ]),
      }),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        _id: 'dep1',
        userId: 'user1',
        chain: OnchainChain.EVM,
        network: 'ethereum',
        asset: 'USDT',
        txHash: '0xabc',
        logIndex: 12,
        fromAddress: '0xfrom',
        toAddress: '0xto',
        amount: 10,
        confirmations: 20,
        status: OnchainDepositStatus.SETTLING,
        credited: false,
        save: jest.fn(),
      }),
      updateOne: jest.fn().mockResolvedValue({}),
    };

    const walletModel: any = {
      findOne: jest.fn().mockResolvedValue({ mainBalance: 100, save: jest.fn() }),
    };

    const transactionModel: any = {
      findOne: jest.fn().mockResolvedValue({ type: TransactionType.DEPOSIT, txHash: '0xabc' }),
      create: jest.fn(),
    };

    const linkedWalletModel: any = {
      findOne: jest.fn(),
    };

    const indexerStateModel: any = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    const configService: any = {
      get: jest.fn(),
    };

    const currencyService: any = {
      buildTransactionCurrencyFields: jest.fn().mockResolvedValue({ amount_usd: 10 }),
    };

    const marketService: any = {
      getCryptoPrice: jest.fn(),
    };

    const service = new OnchainService(
      onchainDepositModel,
      indexerStateModel,
      walletModel,
      transactionModel,
      linkedWalletModel,
      configService,
      currencyService,
      marketService,
    );

    await (service as any).creditConfirmedDeposits();

    expect(transactionModel.create).not.toHaveBeenCalled();
    expect(onchainDepositModel.updateOne).toHaveBeenCalledWith(
      { _id: 'dep1' },
      { $set: { credited: true, creditedAt: expect.any(Date), status: OnchainDepositStatus.SETTLED } },
    );
  });
});
