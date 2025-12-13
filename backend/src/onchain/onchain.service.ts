import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ethers } from 'ethers';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';

import {
  OnchainDeposit,
  OnchainDepositDocument,
  OnchainDepositStatus,
  OnchainChain,
} from '../schemas/onchain-deposit.schema';
import { OnchainIndexerState, OnchainIndexerStateDocument } from '../schemas/onchain-indexer-state.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus, PaymentMethod } from '../schemas/transaction.schema';
import { LinkedWallet, LinkedWalletChain, LinkedWalletDocument } from '../schemas/linked-wallet.schema';
import { CurrencyService } from '../currency/currency.service';
import { MarketService } from '../market/market.service';
import { generateReference, roundTo } from '../common/utils/helpers';

const ERC20_TRANSFER_TOPIC = ethers.utils.id('Transfer(address,address,uint256)');

@Injectable()
export class OnchainService {
  private readonly logger = new Logger(OnchainService.name);

  constructor(
    @InjectModel(OnchainDeposit.name) private onchainDepositModel: Model<OnchainDepositDocument>,
    @InjectModel(OnchainIndexerState.name) private indexerStateModel: Model<OnchainIndexerStateDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(LinkedWallet.name) private linkedWalletModel: Model<LinkedWalletDocument>,
    private configService: ConfigService,
    private currencyService: CurrencyService,
    private marketService: MarketService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'onchain-deposit-poller' })
  async poll() {
    await this.pollEvm();
    await this.pollSolana();
    await this.creditConfirmedDeposits();
  }

  private mapPublicStatus(status: OnchainDepositStatus): 'received' | 'processing' | 'processed' | 'failed' {
    if (status === OnchainDepositStatus.FAILED) return 'failed';
    if (status === OnchainDepositStatus.SETTLED) return 'processed';
    if (status === OnchainDepositStatus.DETECTED) return 'received';
    return 'processing';
  }

  private normalizeStatusFilter(status?: string): OnchainDepositStatus[] | undefined {
    if (!status) return undefined;
    const s = String(status).trim().toLowerCase();
    if (s === 'received') return [OnchainDepositStatus.DETECTED];
    if (s === 'processing') return [OnchainDepositStatus.CONFIRMED, OnchainDepositStatus.SETTLING];
    if (s === 'processed') return [OnchainDepositStatus.SETTLED];
    if (s === 'failed') return [OnchainDepositStatus.FAILED];

    // Allow filtering with internal values too
    const internal = s as OnchainDepositStatus;
    return [internal];
  }

  async listUserDeposits(userId: string, paginationDto: PaginationDto, status?: string) {
    const { page = 1, limit = 10, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = { userId: new Types.ObjectId(userId) };
    const statuses = this.normalizeStatusFilter(status);
    if (statuses && statuses.length > 0) {
      query.status = { $in: statuses };
    }

    const [deposits, total] = await Promise.all([
      this.onchainDepositModel
        .find(query)
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.onchainDepositModel.countDocuments(query),
    ]);

    const mapped = deposits.map((d: any) => {
      const obj = typeof d?.toObject === 'function' ? d.toObject() : d;
      return { ...obj, displayStatus: this.mapPublicStatus(obj.status) };
    });

    return createPaginatedResponse(mapped, total, page, limit);
  }

  async adminListDeposits(
    paginationDto: PaginationDto,
    filters?: {
      status?: string;
      chain?: OnchainChain;
      network?: string;
      asset?: string;
      userId?: string;
    },
  ) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = {};
    const statuses = this.normalizeStatusFilter(filters?.status);
    if (statuses && statuses.length > 0) query.status = { $in: statuses };
    if (filters?.chain) query.chain = filters.chain;
    if (filters?.network) query.network = filters.network;
    if (filters?.asset) query.asset = filters.asset;
    if (filters?.userId) query.userId = new Types.ObjectId(filters.userId);

    const [deposits, total] = await Promise.all([
      this.onchainDepositModel
        .find(query)
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.onchainDepositModel.countDocuments(query),
    ]);

    const mapped = deposits.map((d: any) => {
      const obj = typeof d?.toObject === 'function' ? d.toObject() : d;
      return { ...obj, displayStatus: this.mapPublicStatus(obj.status) };
    });

    return createPaginatedResponse(mapped, total, page, limit);
  }

  private getEnabledEvmNetworks(): string[] {
    const raw = this.configService.get<string>('onchain.evmNetworks') || process.env.ONCHAIN_EVM_NETWORKS;
    if (!raw) return [];
    return String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private getEvmRpcUrl(network: string): string {
    const key = `ONCHAIN_EVM_RPC_${network.toUpperCase()}`;
    return this.configService.get<string>(key) || process.env[key] || '';
  }

  private getEvmConfirmations(network: string): number {
    const key = `ONCHAIN_EVM_CONFIRMATIONS_${network.toUpperCase()}`;
    const v = this.configService.get<string>(key) || process.env[key];
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 12;
  }

  private getEvmDepositAddress(network: string, asset: string): string {
    const key = `ONCHAIN_EVM_DEPOSIT_${network.toUpperCase()}_${asset.toUpperCase()}`;
    const v = this.configService.get<string>(key) || process.env[key];
    return v ? ethers.utils.getAddress(String(v)) : '';
  }

  private getEvmTokenAddress(network: string, asset: string): string {
    const key = `ONCHAIN_EVM_TOKEN_${network.toUpperCase()}_${asset.toUpperCase()}`;
    const v = this.configService.get<string>(key) || process.env[key];
    return v ? ethers.utils.getAddress(String(v)) : '';
  }

  private async pollEvm() {
    const networks = this.getEnabledEvmNetworks();
    for (const network of networks) {
      const rpcUrl = this.getEvmRpcUrl(network);
      if (!rpcUrl) {
        continue;
      }

      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const latest = await provider.getBlockNumber();

        const stateKey = `evm:${network}`;
        const state = await this.indexerStateModel.findOne({ key: stateKey });
        const fromBlock = Math.max(0, (state?.lastProcessedBlock ?? latest) - 5);
        const toBlock = latest;

        await this.scanEvmNativeTransfers(provider, network, fromBlock, toBlock);
        await this.scanEvmErc20Transfers(provider, network, fromBlock, toBlock);

        await this.indexerStateModel.updateOne(
          { key: stateKey },
          { $set: { lastProcessedBlock: toBlock } },
          { upsert: true },
        );
      } catch (e) {
        this.logger.error(`EVM poll failed for ${network}`, e as any);
      }
    }
  }

  private async scanEvmNativeTransfers(
    provider: ethers.providers.JsonRpcProvider,
    network: string,
    fromBlock: number,
    toBlock: number,
  ) {
    const depositAddress = this.getEvmDepositAddress(network, 'NATIVE');
    if (!depositAddress) return;

    for (let b = fromBlock; b <= toBlock; b++) {
      const block = await provider.getBlockWithTransactions(b);
      for (const tx of block.transactions) {
        if (!tx.to) continue;
        if (ethers.utils.getAddress(tx.to) !== depositAddress) continue;
        if (tx.value.isZero()) continue;

        const receipt = await provider.getTransactionReceipt(tx.hash);
        const confirmations = receipt.confirmations || 0;
        const requiredConfirmations = this.getEvmConfirmations(network);

        await this.upsertOnchainDeposit({
          chain: OnchainChain.EVM,
          network,
          asset: 'NATIVE',
          txHash: tx.hash,
          logIndex: -1,
          fromAddress: tx.from,
          toAddress: tx.to,
          amount: Number(ethers.utils.formatEther(tx.value)),
          confirmations,
          requiredConfirmations,
        });
      }
    }
  }

  private async scanEvmErc20Transfers(
    provider: ethers.providers.JsonRpcProvider,
    network: string,
    fromBlock: number,
    toBlock: number,
  ) {
    const tokenAssetsRaw = this.configService.get<string>('onchain.evmTokenAssets') || process.env.ONCHAIN_EVM_TOKEN_ASSETS;
    const tokenAssets = tokenAssetsRaw
      ? String(tokenAssetsRaw)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    for (const asset of tokenAssets) {
      const depositAddress = this.getEvmDepositAddress(network, asset);
      const tokenAddress = this.getEvmTokenAddress(network, asset);
      if (!depositAddress || !tokenAddress) continue;

      const toTopic = ethers.utils.hexZeroPad(depositAddress, 32);
      const logs = await provider.getLogs({
        address: tokenAddress,
        fromBlock,
        toBlock,
        topics: [ERC20_TRANSFER_TOPIC, null, toTopic],
      });

      const erc20 = new ethers.Contract(
        tokenAddress,
        ['function decimals() view returns (uint8)'],
        provider,
      );

      let decimals = 18;
      try {
        decimals = await erc20.decimals();
      } catch {
        decimals = 18;
      }

      for (const log of logs) {
        const parsed = ethers.utils.defaultAbiCoder.decode(['uint256'], log.data);
        const rawAmount: ethers.BigNumber = parsed[0];
        const amount = Number(ethers.utils.formatUnits(rawAmount, decimals));
        if (!Number.isFinite(amount) || amount <= 0) continue;

        const tx = await provider.getTransaction(log.transactionHash);
        const receipt = await provider.getTransactionReceipt(log.transactionHash);
        const confirmations = receipt.confirmations || 0;
        const requiredConfirmations = this.getEvmConfirmations(network);

        await this.upsertOnchainDeposit({
          chain: OnchainChain.EVM,
          network,
          asset,
          txHash: log.transactionHash,
          logIndex: log.logIndex,
          fromAddress: tx.from,
          toAddress: depositAddress,
          amount,
          confirmations,
          requiredConfirmations,
        });
      }
    }
  }

  private async pollSolana() {
    const rpcUrl = this.configService.get<string>('onchain.solanaRpc') || process.env.ONCHAIN_SOLANA_RPC;
    const depositAddress = (this.configService.get<string>('onchain.solanaDeposit') || process.env.ONCHAIN_SOLANA_DEPOSIT || '').trim();
    if (!rpcUrl || !depositAddress) return;

    const requiredConfirmationsRaw =
      this.configService.get<string>('onchain.solanaConfirmations') || process.env.ONCHAIN_SOLANA_CONFIRMATIONS;
    const requiredConfirmations = requiredConfirmationsRaw ? Number(requiredConfirmationsRaw) : 32;

    try {
      const stateKey = 'solana:mainnet';
      const state = await this.indexerStateModel.findOne({ key: stateKey });

      const signaturesRes = await axios.post(rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [depositAddress, { limit: 20 }],
      });

      const signatures: Array<{ signature: string; slot: number; err: any }>
        = signaturesRes.data?.result || [];

      for (const s of signatures) {
        if (s.err) continue;
        if (state?.lastProcessedSignature && s.signature === state.lastProcessedSignature) {
          break;
        }

        const txRes = await axios.post(rpcUrl, {
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [s.signature, { encoding: 'jsonParsed' }],
        });

        const tx = txRes.data?.result;
        if (!tx) continue;

        const meta = tx.meta;
        const transaction = tx.transaction;
        const message = transaction?.message;

        const accountKeys = message?.accountKeys || [];
        const fromAddress = accountKeys?.[0]?.pubkey || accountKeys?.[0] || undefined;

        const confirmations = typeof tx.confirmations === 'number' ? tx.confirmations : 0;

        let amountSol = 0;
        try {
          const preBalances: number[] = meta?.preBalances || [];
          const postBalances: number[] = meta?.postBalances || [];
          const idx = accountKeys.findIndex((k: any) => (k.pubkey || k) === depositAddress);
          if (idx >= 0 && preBalances[idx] != null && postBalances[idx] != null) {
            const deltaLamports = postBalances[idx] - preBalances[idx];
            amountSol = deltaLamports / 1_000_000_000;
          }
        } catch {
          amountSol = 0;
        }

        if (amountSol > 0) {
          await this.upsertOnchainDeposit({
            chain: OnchainChain.SOLANA,
            network: 'mainnet',
            asset: 'SOL',
            signature: s.signature,
            fromAddress,
            toAddress: depositAddress,
            amount: amountSol,
            confirmations,
            requiredConfirmations: Number.isFinite(requiredConfirmations) && requiredConfirmations > 0 ? requiredConfirmations : 32,
          });
        }

        await this.scanSolanaSplTokens({
          signature: s.signature,
          transaction: tx,
          fromAddress,
          confirmations,
          requiredConfirmations:
            Number.isFinite(requiredConfirmations) && requiredConfirmations > 0 ? requiredConfirmations : 32,
        });
      }

      if (signatures.length > 0) {
        await this.indexerStateModel.updateOne(
          { key: stateKey },
          { $set: { lastProcessedSignature: signatures[0].signature } },
          { upsert: true },
        );
      }
    } catch (e) {
      this.logger.error('Solana poll failed', e as any);
    }
  }

  private async scanSolanaSplTokens(input: {
    signature: string;
    transaction: any;
    fromAddress?: string;
    confirmations: number;
    requiredConfirmations: number;
  }) {
    const tokenAssetsRaw = this.configService.get<string>('onchain.solanaTokenAssets') || process.env.ONCHAIN_SOLANA_TOKEN_ASSETS;
    const tokenAssets = tokenAssetsRaw
      ? String(tokenAssetsRaw)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (tokenAssets.length === 0) return;

    // We avoid adding heavy Solana deps; instead we read token balance deltas from getTransaction(jsonParsed)
    // and match against configured token accounts (ATA) for the platform.
    const meta = input.transaction?.meta;
    const preTokenBalances: any[] = meta?.preTokenBalances || [];
    const postTokenBalances: any[] = meta?.postTokenBalances || [];
    const message = input.transaction?.transaction?.message;
    const accountKeys = message?.accountKeys || [];

    for (const asset of tokenAssets) {
      const key = `ONCHAIN_SOLANA_DEPOSIT_${asset.toUpperCase()}`;
      const depositTokenAccount =
        (this.configService.get<string>(key) || process.env[key] || '').trim();
      if (!depositTokenAccount) continue;

      // Prefer mapping configured token account pubkey to an accountIndex in the message
      let targetIndex = -1;
      for (let i = 0; i < accountKeys.length; i++) {
        const k = accountKeys[i];
        const pubkey = k?.pubkey || k;
        if (pubkey === depositTokenAccount) {
          targetIndex = i;
          break;
        }
      }

      const pre = targetIndex >= 0 ? preTokenBalances.find((b) => b.accountIndex === targetIndex) : undefined;
      const post = targetIndex >= 0 ? postTokenBalances.find((b) => b.accountIndex === targetIndex) : undefined;

      let preUi = 0;
      let postUi = 0;
      if (pre?.uiTokenAmount?.uiAmount != null) preUi = Number(pre.uiTokenAmount.uiAmount);
      if (post?.uiTokenAmount?.uiAmount != null) postUi = Number(post.uiTokenAmount.uiAmount);

      const delta = postUi - preUi;
      if (!Number.isFinite(delta) || delta <= 0) continue;

      await this.upsertOnchainDeposit({
        chain: OnchainChain.SOLANA,
        network: 'mainnet',
        asset: asset.toUpperCase(),
        signature: input.signature,
        fromAddress: input.fromAddress,
        toAddress: depositTokenAccount,
        amount: delta,
        confirmations: input.confirmations,
        requiredConfirmations: input.requiredConfirmations,
      });
    }
  }

  private async upsertOnchainDeposit(input: {
    chain: OnchainChain;
    network: string;
    asset: string;
    txHash?: string;
    signature?: string;
    logIndex?: number;
    fromAddress?: string;
    toAddress?: string;
    amount: number;
    confirmations: number;
    requiredConfirmations: number;
  }) {
    const selector: any = {
      chain: input.chain,
      network: input.network,
    };

    if (input.chain === OnchainChain.EVM) {
      selector.txHash = input.txHash;
      selector.logIndex = input.logIndex;
    } else {
      selector.signature = input.signature;
      selector.asset = input.asset;
      selector.toAddress = input.toAddress ? String(input.toAddress).trim() : undefined;
    }

    const fromAddressNormalized = input.fromAddress
      ? (input.chain === OnchainChain.EVM
          ? ethers.utils.getAddress(input.fromAddress)
          : String(input.fromAddress).trim())
      : undefined;

    const toAddressNormalized = input.toAddress
      ? (input.chain === OnchainChain.EVM
          ? ethers.utils.getAddress(input.toAddress)
          : String(input.toAddress).trim())
      : undefined;

    const linked = fromAddressNormalized
      ? await this.linkedWalletModel.findOne({
          chain: input.chain === OnchainChain.EVM ? LinkedWalletChain.EVM : LinkedWalletChain.SOLANA,
          address: fromAddressNormalized,
          verified: true,
        })
      : null;

    const status = input.confirmations >= input.requiredConfirmations ? OnchainDepositStatus.CONFIRMED : OnchainDepositStatus.DETECTED;

    await this.onchainDepositModel.updateOne(
      selector,
      {
        $setOnInsert: {
          chain: input.chain,
          network: input.network,
          asset: input.asset,
          txHash: input.txHash,
          signature: input.signature,
          logIndex: input.logIndex,
          amount: input.amount,
          credited: false,
        },
        $set: {
          fromAddress: fromAddressNormalized,
          toAddress: toAddressNormalized,
          confirmations: input.confirmations,
          requiredConfirmations: input.requiredConfirmations,
          status,
          userId: linked?.userId,
        },
      },
      { upsert: true },
    );
  }

  private async creditConfirmedDeposits() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const deposits = await this.onchainDepositModel
      .find({
        credited: false,
        $or: [
          { status: OnchainDepositStatus.CONFIRMED },
          { status: OnchainDepositStatus.SETTLING, updatedAt: { $lt: tenMinutesAgo } },
        ],
      })
      .limit(50);

    for (const dep of deposits) {
      try {
        // Acquire a simple lock to avoid double-credit if two pollers overlap.
        // Only proceed if we successfully flip CONFIRMED -> SETTLING.
        const locked = await this.onchainDepositModel.findOneAndUpdate(
          {
            _id: dep._id,
            credited: false,
            status: { $in: [OnchainDepositStatus.CONFIRMED, OnchainDepositStatus.SETTLING] },
          },
          { $set: { status: OnchainDepositStatus.SETTLING } },
          { new: true },
        );

        if (!locked) {
          continue;
        }

        // Reload the doc reference we will use from here on
        const current = locked;

        if (!current.userId) {
          await this.onchainDepositModel.updateOne(
            { _id: current._id },
            { $set: { status: OnchainDepositStatus.CONFIRMED } },
          );
          continue;
        }

        const wallet = await this.walletModel.findOne({ userId: current.userId });
        if (!wallet) {
          await this.onchainDepositModel.updateOne(
            { _id: current._id },
            { $set: { status: OnchainDepositStatus.CONFIRMED } },
          );
          continue;
        }

        const onchainRef = current.txHash || current.signature;
        if (!onchainRef) {
          await this.onchainDepositModel.updateOne(
            { _id: current._id },
            { $set: { status: OnchainDepositStatus.CONFIRMED } },
          );
          continue;
        }

        const paymentDetailsKey = `onchain:${current.chain}:${current.network}:${current.asset}:${
          typeof current.logIndex === 'number' ? current.logIndex : ''
        }:${current.toAddress || ''}`;

        // Ensure idempotency at the transaction layer too.
        const existingTxn = await this.transactionModel.findOne({
          type: TransactionType.DEPOSIT,
          txHash: onchainRef,
          paymentDetails: paymentDetailsKey,
        });
        if (existingTxn) {
          await this.onchainDepositModel.updateOne(
            { _id: current._id },
            { $set: { credited: true, creditedAt: new Date(), status: OnchainDepositStatus.SETTLED } },
          );
          continue;
        }

        const amountUsd = await this.estimateUsd(current.asset, current.amount);
        const creditUsd = roundTo(amountUsd, 2);
        if (!Number.isFinite(creditUsd) || creditUsd <= 0) {
          await this.onchainDepositModel.updateOne(
            { _id: current._id },
            { $set: { status: OnchainDepositStatus.FAILED, errorMessage: 'invalid_usd_amount', credited: false } },
          );
          continue;
        }

        const previousBalance = wallet.mainBalance;
        wallet.mainBalance = roundTo(wallet.mainBalance + creditUsd, 2);
        await wallet.save();

        const currencyFields = await this.currencyService.buildTransactionCurrencyFields({
          amountUsd: creditUsd,
        });

        await this.transactionModel.create({
          userId: current.userId,
          transactionRef: generateReference('TXN'),
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          amount: creditUsd,
          description: `On-chain deposit confirmed - ${current.asset} (${current.network})`,
          paymentMethod: this.mapPaymentMethod(current.asset),
          txHash: onchainRef,
          fromAddress: current.fromAddress,
          toAddress: current.toAddress,
          confirmations: current.confirmations,
          paymentDetails: paymentDetailsKey,
          balanceBefore: previousBalance,
          balanceAfter: wallet.mainBalance,
          ...currencyFields,
        });

        current.amountUsd = creditUsd;
        current.credited = true;
        current.creditedAt = new Date();
        current.status = OnchainDepositStatus.SETTLED;
        await current.save();
      } catch (e: any) {
        await this.onchainDepositModel.updateOne(
          { _id: dep._id },
          {
            $set: {
              status: OnchainDepositStatus.FAILED,
              errorMessage: e?.message || 'credit_failed',
              credited: false,
            },
          },
        );
      }
    }
  }

  private mapPaymentMethod(asset: string): PaymentMethod {
    const a = String(asset).toUpperCase();
    if (a === 'SOL') return PaymentMethod.CRYPTO_SOL;
    if (a === 'USDT') return PaymentMethod.CRYPTO_USDT;
    if (a === 'USDC') return PaymentMethod.CRYPTO_USDC;
    if (a === 'BNB') return PaymentMethod.CRYPTO_BNB;
    return PaymentMethod.CRYPTO_ETH;
  }

  private async estimateUsd(asset: string, amount: number): Promise<number> {
    const a = String(asset).toUpperCase();
    if (a === 'USDT' || a === 'USDC') {
      return amount;
    }

    let id = '';
    if (a === 'ETH' || a === 'NATIVE') id = 'ethereum';
    if (a === 'BNB') id = 'binancecoin';
    if (a === 'SOL') id = 'solana';

    if (!id) {
      return amount;
    }

    const price = await this.marketService.getCryptoPrice(id);
    const p = price?.current_price;
    if (typeof p !== 'number' || !Number.isFinite(p) || p <= 0) {
      return amount;
    }

    return amount * p;
  }
}
