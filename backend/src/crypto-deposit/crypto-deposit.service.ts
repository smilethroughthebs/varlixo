import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CryptoDeposit, CryptoDepositDocument, CryptoCurrency, CryptoDepositStatus } from '../schemas/crypto-deposit.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from '../schemas/transaction.schema';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { generateReference } from '../common/utils/helpers';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class CryptoDepositService {
  constructor(
    @InjectModel(CryptoDeposit.name) private cryptoDepositModel: Model<CryptoDepositDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  private getAddressForCurrency(currency: CryptoCurrency): { address: string; network: string; minConfirmations: number } {
    switch (currency) {
      case CryptoCurrency.BTC:
        return {
          address: this.configService.get<string>('WALLET_BTC') || 'bc1qupec85trsdtlctyc5ulxkfqav0zrxsmj0459cp',
          network: 'Bitcoin',
          minConfirmations: 3,
        };
      case CryptoCurrency.ETH:
        return {
          address: this.configService.get<string>('WALLET_ETH') || '0xf533162a05833043C2bEAa633e019e4D968D14B8',
          network: 'Ethereum (ERC20)',
          minConfirmations: 12,
        };
      case CryptoCurrency.USDT_TRC20:
      default:
        return {
          address: this.configService.get<string>('WALLET_USDT') || 'TZJnNEXp8XRALRSw4TdtPqoNLHWz4wH8sY',
          network: 'TRON (TRC20)',
          minConfirmations: 10,
        };
    }
  }

  async createDeposit(userId: string, currency: CryptoCurrency, amountCrypto: number, amountUsd?: number) {
    if (!amountCrypto || amountCrypto <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { address, network, minConfirmations } = this.getAddressForCurrency(currency);

    const deposit = await this.cryptoDepositModel.create({
      userId: new Types.ObjectId(userId),
      currency,
      amountCrypto,
      amountUsd,
      address,
      network,
      status: CryptoDepositStatus.PENDING,
    });

    // Optional: notify admin of new crypto deposit request
    try {
      await this.emailService.notifyAdminNewDeposit(
        user.email,
        `${user.firstName} ${user.lastName}`,
        amountUsd || amountCrypto,
        'USD',
        currency,
        generateReference('CRYPTO'),
      );
    } catch (e) {
      // email failure should not block API
    }

    return {
      success: true,
      deposit,
      instructions: {
        currency,
        address,
        network,
        minConfirmations,
      },
    };
  }

  async getUserDeposits(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const [deposits, total] = await Promise.all([
      this.cryptoDepositModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.cryptoDepositModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return createPaginatedResponse(deposits, total, page, limit);
  }

  async adminListDeposits(paginationDto: PaginationDto, status?: CryptoDepositStatus) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [deposits, total] = await Promise.all([
      this.cryptoDepositModel
        .find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.cryptoDepositModel.countDocuments(query),
    ]);

    return createPaginatedResponse(deposits, total, page, limit);
  }

  async adminUpdateStatus(adminId: string, depositId: string, status: CryptoDepositStatus, txHash?: string, amountUsd?: number) {
    const deposit = await this.cryptoDepositModel.findById(depositId);
    if (!deposit) {
      throw new NotFoundException('Crypto deposit not found');
    }

    if (deposit.status !== CryptoDepositStatus.PENDING) {
      throw new BadRequestException('Deposit already processed');
    }

    deposit.status = status;
    if (txHash) deposit.txHash = txHash;
    if (amountUsd) deposit.amountUsd = amountUsd;
    await deposit.save();

    if (status === CryptoDepositStatus.CONFIRMED) {
      // Credit wallet and create transaction
      const wallet = await this.walletModel.findOne({ userId: deposit.userId });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const previousBalance = wallet.mainBalance;
      const creditAmount = amountUsd || deposit.amountUsd;
      if (!creditAmount || creditAmount <= 0) {
        throw new BadRequestException('Invalid credit amount');
      }

      wallet.mainBalance += creditAmount;
      await wallet.save();

      await this.transactionModel.create({
        userId: deposit.userId,
        transactionRef: generateReference('TXN'),
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        amount: creditAmount,
        amount_usd: creditAmount,
        description: `Crypto deposit confirmed - ${deposit.currency}`,
        balanceBefore: previousBalance,
        balanceAfter: wallet.mainBalance,
        processedBy: new Types.ObjectId(adminId),
      });
    }

    return {
      success: true,
      message: `Crypto deposit ${status}`,
    };
  }
}
