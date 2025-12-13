/**
 * ==============================================
 * VARLIXO - CRON SERVICE
 * ==============================================
 * Scheduled tasks for automatic operations like
 * daily profit distribution and cleanup.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Investment, InvestmentDocument, InvestmentStatus } from '../schemas/investment.schema';
import { RecurringPlan, RecurringPlanDocument, RecurringPlanStatus } from '../schemas/recurring-plan.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from '../schemas/transaction.schema';
import { InvestmentPlan, InvestmentPlanDocument } from '../schemas/investment-plan.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { generateReference, roundTo, calculatePercentage } from '../common/utils/helpers';
import { CurrencyService } from '../currency/currency.service';
import { EmailService } from '../email/email.service';
import { MarketService } from '../market/market.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectModel(Investment.name) private investmentModel: Model<InvestmentDocument>,
    @InjectModel(RecurringPlan.name) private recurringPlanModel: Model<RecurringPlanDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(InvestmentPlan.name) private planModel: Model<InvestmentPlanDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private currencyService: CurrencyService,
    private emailService: EmailService,
    private marketService: MarketService,
  ) {}

  /**
   * Check recurring plans (daily):
   * - send payment reminders
   * - mark missed payments
   * - notify on maturity
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'recurring-plan-check',
    timeZone: 'UTC',
  })
  async handleRecurringPlanCheck() {
    this.logger.log('🗓️ Running recurring plan check...');
    const startTime = Date.now();

    try {
      const result = await this.processRecurringPlans();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Recurring plan check complete (reminders=${result.remindersSent}, missed=${result.markedMissed}, maturedNotified=${result.maturedNotified}) in ${duration}s`,
      );
    } catch (error) {
      this.logger.error('❌ Recurring plan check failed:', error);
    }
  }

  private async processRecurringPlans() {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const reminderWindowStart = new Date(today);
    reminderWindowStart.setDate(reminderWindowStart.getDate() - 1);

    const reminderWindowEnd = new Date(today);
    reminderWindowEnd.setDate(reminderWindowEnd.getDate() + 3);

    const [dueSoonPlans, overduePlans, maturedPlans] = await Promise.all([
      this.recurringPlanModel.find({
        status: RecurringPlanStatus.ACTIVE,
        $expr: { $lt: ['$monthsCompleted', '$monthsRequired'] } as any,
        nextPaymentDate: { $gte: reminderWindowStart, $lte: reminderWindowEnd },
      }),
      this.recurringPlanModel.find({
        status: RecurringPlanStatus.ACTIVE,
        nextPaymentDate: { $lt: today },
      }),
      this.recurringPlanModel.find({
        status: RecurringPlanStatus.MATURED,
        maturityDate: { $lte: now },
      }),
    ]);

    let remindersSent = 0;
    let markedMissed = 0;
    let maturedNotified = 0;

    for (const plan of dueSoonPlans) {
      try {
        if (plan.lastPaymentReminderSentAt) {
          const last = new Date(plan.lastPaymentReminderSentAt);
          last.setHours(0, 0, 0, 0);
          if (last.getTime() === today.getTime()) {
            continue;
          }
        }

        const user = await this.userModel.findById(plan.userId);
        if (!user || !user.emailNotifications) {
          continue;
        }

        await this.emailService.sendRecurringPaymentDueEmail(
          user.email,
          user.firstName,
          plan.planType,
          plan.monthlyContribution,
          plan.nextPaymentDate,
        );

        plan.lastPaymentReminderSentAt = now;
        await plan.save();
        remindersSent++;
      } catch (error) {
        this.logger.error(`Error sending recurring reminder for plan ${plan._id}:`, error);
      }
    }

    for (const plan of overduePlans) {
      try {
        if (plan.monthsCompleted >= plan.monthsRequired) {
          continue;
        }

        plan.status = RecurringPlanStatus.MISSED;

        const shouldNotify = !plan.lastMissedNotifiedAt;
        if (shouldNotify) {
          const user = await this.userModel.findById(plan.userId);
          if (user && user.emailNotifications) {
            await this.emailService.sendRecurringMissedPaymentEmail(
              user.email,
              user.firstName,
              plan.planType,
              plan.monthlyContribution,
              plan.nextPaymentDate,
            );
            plan.lastMissedNotifiedAt = now;
          }
        }

        await plan.save();
        markedMissed++;
      } catch (error) {
        this.logger.error(`Error marking recurring plan missed ${plan._id}:`, error);
      }
    }

    for (const plan of maturedPlans) {
      try {
        if (plan.lastMaturityNotifiedAt) {
          continue;
        }

        const user = await this.userModel.findById(plan.userId);
        if (!user || !user.emailNotifications) {
          continue;
        }

        await this.emailService.sendRecurringPlanMaturedEmail(
          user.email,
          user.firstName,
          plan.planType,
          plan.totalContributed,
          plan.maturityDate,
        );

        plan.lastMaturityNotifiedAt = now;
        await plan.save();
        maturedNotified++;
      } catch (error) {
        this.logger.error(`Error notifying recurring plan maturity ${plan._id}:`, error);
      }
    }

    return { remindersSent, markedMissed, maturedNotified };
  }

  /**
   * Process daily profits every day at midnight UTC
   * Runs at 00:05 to avoid midnight edge cases
   */
  @Cron('5 0 * * *', {
    name: 'daily-profit-distribution',
    timeZone: 'UTC',
  })
  async handleDailyProfitDistribution() {
    this.logger.log('🚀 Starting daily profit distribution...');
    const startTime = Date.now();

    try {
      const result = await this.processDailyProfits();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      this.logger.log(`
╔═══════════════════════════════════════════════════════════╗
║           DAILY PROFIT DISTRIBUTION COMPLETE              ║
╠═══════════════════════════════════════════════════════════╣
║  Investments Processed: ${String(result.processed).padEnd(31)}║
║  Total Profit Distributed: $${String(result.totalProfitDistributed.toFixed(2)).padEnd(27)}║
║  Matured Investments: ${String(result.matured).padEnd(33)}║
║  Duration: ${String(duration + 's').padEnd(44)}║
╚═══════════════════════════════════════════════════════════╝
      `);
    } catch (error) {
      this.logger.error('❌ Daily profit distribution failed:', error);
    }
  }

  /**
   * Process daily profits for all active investments
   */
  async processDailyProfits() {
    const activeInvestments = await this.investmentModel.find({
      status: InvestmentStatus.ACTIVE,
      maturityDate: { $gt: new Date() },
    });

    let processed = 0;
    let totalProfitDistributed = 0;

    for (const investment of activeInvestments) {
      try {
        // Check if profit already processed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (investment.lastProfitDate) {
          const lastProfit = new Date(investment.lastProfitDate);
          lastProfit.setHours(0, 0, 0, 0);
          if (lastProfit.getTime() === today.getTime()) {
            continue; // Already processed today
          }
        }

        // Calculate daily profit
        let dailyProfit = investment.dailyProfitAmount;
        if (investment.marketLinked && investment.marketAssetId) {
          const price = await this.marketService.getCryptoPrice(investment.marketAssetId);
          const currentPrice = price?.current_price;

          const baseRate =
            typeof investment.marketBaseDailyRate === 'number'
              ? investment.marketBaseDailyRate
              : investment.dailyReturnRate;

          let computedRate = baseRate;
          if (
            typeof currentPrice === 'number' &&
            typeof investment.marketLastPrice === 'number' &&
            investment.marketLastPrice > 0
          ) {
            const priceChangePct = ((currentPrice - investment.marketLastPrice) / investment.marketLastPrice) * 100;
            const alpha = typeof investment.marketAlpha === 'number' ? investment.marketAlpha : 0;
            computedRate = baseRate + alpha * priceChangePct;
          }

          if (typeof investment.marketMinDailyRate === 'number') {
            computedRate = Math.max(computedRate, investment.marketMinDailyRate);
          }
          if (typeof investment.marketMaxDailyRate === 'number') {
            computedRate = Math.min(computedRate, investment.marketMaxDailyRate);
          }

          if (!Number.isFinite(computedRate) || computedRate < 0) {
            computedRate = Math.max(baseRate, 0);
          }

          dailyProfit = roundTo(calculatePercentage(investment.amount, computedRate), 2);
          if (typeof currentPrice === 'number') {
            investment.marketLastPrice = currentPrice;
          }
        }

        // Update investment record
        investment.accumulatedProfit = roundTo(investment.accumulatedProfit + dailyProfit, 2);
        investment.daysCompleted += 1;
        investment.lastProfitDate = new Date();
        investment.profitHistory.push({
          date: new Date(),
          amount: dailyProfit,
          status: 'credited',
        });

        // Credit to wallet based on auto-compound setting
        const wallet = await this.walletModel.findOne({ userId: investment.userId });
        if (!wallet) continue;

        if (investment.autoCompound) {
          // Add to locked balance (reinvested)
          wallet.lockedBalance = roundTo(wallet.lockedBalance + dailyProfit, 2);
          investment.compoundedAmount = roundTo(investment.compoundedAmount + dailyProfit, 2);
        } else {
          // Add to main balance
          wallet.mainBalance = roundTo(wallet.mainBalance + dailyProfit, 2);
          wallet.totalEarnings = roundTo(wallet.totalEarnings + dailyProfit, 2);
          investment.paidOutProfit = roundTo(investment.paidOutProfit + dailyProfit, 2);

          // Create profit transaction
          const currencyFields = await this.currencyService.buildTransactionCurrencyFields({
            amountUsd: dailyProfit,
          });

          await this.transactionModel.create({
            userId: investment.userId,
            transactionRef: generateReference('TXN'),
            type: TransactionType.PROFIT,
            status: TransactionStatus.COMPLETED,
            amount: dailyProfit,
            description: `Daily profit from ${investment.planName}`,
            investmentId: investment._id,
            ...currencyFields,
          });
        }

        await wallet.save();
        await investment.save();

        processed++;
        totalProfitDistributed += dailyProfit;
      } catch (error) {
        this.logger.error(`Error processing investment ${investment._id}:`, error);
      }
    }

    // Process matured investments
    const matured = await this.processMaturedInvestments();

    return {
      processed,
      totalProfitDistributed: roundTo(totalProfitDistributed, 2),
      matured,
      timestamp: new Date(),
    };
  }

  /**
   * Process matured investments
   */
  async processMaturedInvestments(): Promise<number> {
    const maturedInvestments = await this.investmentModel.find({
      status: InvestmentStatus.ACTIVE,
      maturityDate: { $lte: new Date() },
    });

    for (const investment of maturedInvestments) {
      try {
        // Mark as matured
        investment.status = InvestmentStatus.MATURED;
        investment.completedAt = new Date();

        const wallet = await this.walletModel.findOne({ userId: investment.userId });
        if (!wallet) continue;

        // Return principal if applicable
        if (investment.principalReturn) {
          const returnAmount = roundTo(investment.amount + investment.compoundedAmount, 2);

          wallet.mainBalance = roundTo(wallet.mainBalance + returnAmount, 2);
          wallet.lockedBalance = roundTo(wallet.lockedBalance - (investment.amount + investment.compoundedAmount), 2);

          // Create transaction for principal return
          const currencyFields = await this.currencyService.buildTransactionCurrencyFields({
            amountUsd: returnAmount,
          });

          await this.transactionModel.create({
            userId: investment.userId,
            transactionRef: generateReference('TXN'),
            type: TransactionType.PROFIT,
            status: TransactionStatus.COMPLETED,
            amount: returnAmount,
            description: `Principal + compound return from ${investment.planName}`,
            investmentId: investment._id,
            ...currencyFields,
          });
        } else {
          // Just release locked amount
          wallet.lockedBalance = roundTo(wallet.lockedBalance - investment.amount, 2);
        }

        await wallet.save();
        await investment.save();

        // Update plan statistics
        await this.planModel.findByIdAndUpdate(investment.planId, {
          $inc: {
            totalPaidOut: investment.paidOutProfit + (investment.principalReturn ? investment.amount : 0),
          },
        });

        this.logger.log(`✅ Investment ${investment.investmentRef} matured and processed`);
      } catch (error) {
        this.logger.error(`Error processing matured investment ${investment._id}:`, error);
      }
    }

    return maturedInvestments.length;
  }

  /**
   * Cleanup expired deposits (every hour)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredDeposits() {
    // This would mark expired deposit requests as cancelled
    this.logger.debug('Checking for expired deposits...');
  }

  /**
   * Update user activity status (every 30 minutes)
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleInactiveUsers() {
    // This would track user activity and update last active timestamps
    this.logger.debug('Checking user activity...');
  }

  /**
   * Generate daily statistics report (every day at 1 AM)
   */
  @Cron('0 1 * * *')
  async handleDailyReport() {
    this.logger.log('📊 Generating daily statistics report...');
    
    // Calculate daily stats
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [newUsers, newDeposits, newWithdrawals, newInvestments] = await Promise.all([
      this.userModel.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      }),
      this.transactionModel.aggregate([
        {
          $match: {
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.COMPLETED,
            createdAt: { $gte: yesterday, $lt: today },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.transactionModel.aggregate([
        {
          $match: {
            type: TransactionType.WITHDRAWAL,
            status: TransactionStatus.COMPLETED,
            createdAt: { $gte: yesterday, $lt: today },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.investmentModel.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      }),
    ]);

    this.logger.log(`
╔═══════════════════════════════════════════════════════════╗
║                 DAILY REPORT - ${yesterday.toDateString().padEnd(20)}║
╠═══════════════════════════════════════════════════════════╣
║  New Users: ${String(newUsers).padEnd(44)}║
║  Deposits: ${String((newDeposits[0]?.count || 0) + ' ($' + (newDeposits[0]?.total || 0) + ')').padEnd(45)}║
║  Withdrawals: ${String((newWithdrawals[0]?.count || 0) + ' ($' + (newWithdrawals[0]?.total || 0) + ')').padEnd(42)}║
║  New Investments: ${String(newInvestments).padEnd(38)}║
╚═══════════════════════════════════════════════════════════╝
    `);
  }
}



