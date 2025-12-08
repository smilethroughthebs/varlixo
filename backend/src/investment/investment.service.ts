/**
 * ==============================================
 * VARLIXO - INVESTMENT SERVICE
 * ==============================================
 * Handles investment plan management, activation,
 * profit tracking, and maturity processing.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InvestmentPlan, InvestmentPlanDocument, PlanStatus } from '../schemas/investment-plan.schema';
import { Investment, InvestmentDocument, InvestmentStatus } from '../schemas/investment.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import { User, UserDocument, KycStatus } from '../schemas/user.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from '../schemas/transaction.schema';
import { Referral, ReferralDocument, ReferralStatus } from '../schemas/referral.schema';
import { CreateInvestmentDto, CalculateReturnsDto, CreatePlanDto, UpdatePlanDto } from './dto/investment.dto';
import { generateReference, roundTo, addDays, calculatePercentage } from '../common/utils/helpers';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(InvestmentPlan.name) private planModel: Model<InvestmentPlanDocument>,
    @InjectModel(Investment.name) private investmentModel: Model<InvestmentDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private emailService: EmailService,
  ) {}

  // ==========================================
  // PUBLIC: Investment Plans
  // ==========================================

  /**
   * Get all active investment plans
   */
  async getActivePlans() {
    const plans = await this.planModel
      .find({ status: PlanStatus.ACTIVE })
      .sort({ sortOrder: 1, minInvestment: 1 });

    return {
      success: true,
      plans,
    };
  }

  /**
   * Get plan details by slug
   */
  async getPlanBySlug(slug: string) {
    const plan = await this.planModel.findOne({ slug, status: PlanStatus.ACTIVE });

    if (!plan) {
      throw new NotFoundException('Investment plan not found');
    }

    return {
      success: true,
      plan,
    };
  }

  /**
   * Calculate expected returns for a plan
   */
  async calculateReturns(calculateDto: CalculateReturnsDto) {
    const { planId, amount } = calculateDto;

    const plan = await this.planModel.findById(planId);
    if (!plan) {
      throw new NotFoundException('Investment plan not found');
    }

    if (amount < plan.minInvestment || amount > plan.maxInvestment) {
      throw new BadRequestException(
        `Investment amount must be between $${plan.minInvestment} and $${plan.maxInvestment}`,
      );
    }

    const dailyProfit = roundTo(calculatePercentage(amount, plan.dailyReturnRate), 2);
    const totalProfit = roundTo(calculatePercentage(amount, plan.totalReturnRate), 2);
    const totalReturn = plan.principalReturn ? amount + totalProfit : totalProfit;

    return {
      success: true,
      calculation: {
        investmentAmount: amount,
        planName: plan.name,
        dailyReturnRate: plan.dailyReturnRate,
        dailyProfit,
        durationDays: plan.durationDays,
        totalReturnRate: plan.totalReturnRate,
        totalProfit,
        principalReturn: plan.principalReturn,
        totalReturn,
        maturityDate: addDays(new Date(), plan.durationDays),
      },
    };
  }

  // ==========================================
  // USER: Investment Operations
  // ==========================================

  /**
   * Create a new investment
   */
  async createInvestment(
    userId: string,
    createDto: CreateInvestmentDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { planId, amount, autoCompound } = createDto;

    // Get user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check KYC status for larger investments
    if (amount >= 1000 && user.kycStatus !== KycStatus.APPROVED) {
      throw new ForbiddenException('KYC verification required for investments of $1,000 or more');
    }

    // Get plan
    const plan = await this.planModel.findById(planId);
    if (!plan || plan.status !== PlanStatus.ACTIVE) {
      throw new NotFoundException('Investment plan not found or not available');
    }

    // Validate amount
    if (amount < plan.minInvestment) {
      throw new BadRequestException(`Minimum investment for this plan is $${plan.minInvestment}`);
    }
    if (amount > plan.maxInvestment) {
      throw new BadRequestException(`Maximum investment for this plan is $${plan.maxInvestment}`);
    }

    // Check available slots
    if (plan.totalSlots && plan.usedSlots >= plan.totalSlots) {
      throw new BadRequestException('This plan has reached maximum capacity');
    }

    // Get wallet and check balance
    const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!wallet || wallet.mainBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate expected profits
    const dailyProfitAmount = roundTo(calculatePercentage(amount, plan.dailyReturnRate), 2);
    const expectedTotalProfit = roundTo(calculatePercentage(amount, plan.totalReturnRate), 2);
    const maturityDate = addDays(new Date(), plan.durationDays);

    // Generate investment reference
    const investmentRef = generateReference('INV');

    // Create investment
    const investment = new this.investmentModel({
      userId: new Types.ObjectId(userId),
      planId: plan._id,
      investmentRef,
      planName: plan.name,
      dailyReturnRate: plan.dailyReturnRate,
      totalReturnRate: plan.totalReturnRate,
      durationDays: plan.durationDays,
      principalReturn: plan.principalReturn,
      amount,
      status: InvestmentStatus.ACTIVE,
      activatedAt: new Date(),
      maturityDate,
      expectedTotalProfit,
      dailyProfitAmount,
      autoCompound: autoCompound || false,
      referrerId: user.referredBy,
      ipAddress,
      userAgent,
    });

    await investment.save();

    // Deduct from wallet
    wallet.mainBalance -= amount;
    wallet.lockedBalance += amount;
    await wallet.save();

    // Create transaction
    await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      transactionRef: generateReference('TXN'),
      type: TransactionType.INVESTMENT,
      status: TransactionStatus.COMPLETED,
      amount,
      amount_usd: amount, // Set USD amount
      description: `Investment in ${plan.name}`,
      investmentId: investment._id,
      balanceBefore: wallet.mainBalance + amount,
      balanceAfter: wallet.mainBalance,
      ipAddress,
      userAgent,
    });

    // Update plan statistics
    await this.planModel.findByIdAndUpdate(plan._id, {
      $inc: { totalInvestors: 1, totalInvested: amount, usedSlots: 1 },
    });

    // Process referral bonus if applicable
    if (user.referredBy) {
      await this.processReferralBonus(user.referredBy, userId, investment._id, amount, plan.referralBonusPercent);
    }

    // Send email notification
    await this.emailService.sendInvestmentActivatedEmail(
      user.email,
      user.firstName,
      plan.name,
      amount,
      'USD',
      plan.dailyReturnRate,
      maturityDate,
    );

    return {
      success: true,
      message: 'Investment activated successfully',
      investment: {
        id: investment._id,
        investmentRef: investment.investmentRef,
        planName: investment.planName,
        amount: investment.amount,
        dailyProfit: dailyProfitAmount,
        expectedTotalProfit,
        maturityDate,
        status: investment.status,
      },
    };
  }

  /**
   * Process referral bonus for investment
   */
  private async processReferralBonus(
    referrerId: Types.ObjectId,
    referredUserId: string,
    investmentId: Types.ObjectId,
    investmentAmount: number,
    bonusPercent: number,
  ) {
    const bonusAmount = roundTo(calculatePercentage(investmentAmount, bonusPercent), 2);

    // Update referral record
    await this.referralModel.findOneAndUpdate(
      { referrerId, referredId: new Types.ObjectId(referredUserId) },
      {
        $inc: { totalEarnings: bonusAmount },
        $push: {
          bonuses: {
            amount: bonusAmount,
            type: 'investment',
            status: 'paid',
            investmentId,
            paidAt: new Date(),
            createdAt: new Date(),
          },
        },
        status: ReferralStatus.ACTIVE,
      },
    );

    // Credit referrer's wallet
    await this.walletModel.findOneAndUpdate(
      { userId: referrerId },
      {
        $inc: { mainBalance: bonusAmount, referralEarnings: bonusAmount },
      },
    );

    // Update referrer's user record
    await this.userModel.findByIdAndUpdate(referrerId, {
      $inc: { referralEarnings: bonusAmount },
    });

    // Create transaction for referrer
    await this.transactionModel.create({
      userId: referrerId,
      transactionRef: generateReference('TXN'),
      type: TransactionType.REFERRAL_BONUS,
      status: TransactionStatus.COMPLETED,
      amount: bonusAmount,
      description: `Referral bonus from investment`,
      referredUserId: new Types.ObjectId(referredUserId),
      investmentId,
    });
  }

  /**
   * Get user's investments
   */
  async getUserInvestments(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const [investments, total] = await Promise.all([
      this.investmentModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.investmentModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return createPaginatedResponse(investments, total, page, limit);
  }

  /**
   * Get investment details
   */
  async getInvestmentDetails(userId: string, investmentId: string) {
    const investment = await this.investmentModel.findOne({
      _id: new Types.ObjectId(investmentId),
      userId: new Types.ObjectId(userId),
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    return {
      success: true,
      investment,
    };
  }

  /**
   * Get user's investment summary
   */
  async getInvestmentSummary(userId: string) {
    const investments = await this.investmentModel.find({
      userId: new Types.ObjectId(userId),
    });

    const summary = {
      totalInvested: 0,
      activeInvestments: 0,
      completedInvestments: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      activeInvestmentsList: [] as any[],
    };

    investments.forEach((inv) => {
      if (inv.status === InvestmentStatus.ACTIVE) {
        summary.activeInvestments++;
        summary.totalInvested += inv.amount;
        summary.pendingEarnings += inv.expectedTotalProfit - inv.paidOutProfit;
        summary.activeInvestmentsList.push({
          id: inv._id,
          planName: inv.planName,
          amount: inv.amount,
          dailyProfit: inv.dailyProfitAmount,
          progress: Math.round((inv.daysCompleted / inv.durationDays) * 100),
          maturityDate: inv.maturityDate,
        });
      } else if (inv.status === InvestmentStatus.COMPLETED || inv.status === InvestmentStatus.MATURED) {
        summary.completedInvestments++;
        summary.totalEarnings += inv.paidOutProfit;
      }
    });

    return {
      success: true,
      summary,
    };
  }

  // ==========================================
  // ADMIN: Plan Management
  // ==========================================

  /**
   * Create a new investment plan
   */
  async createPlan(createPlanDto: CreatePlanDto) {
    // Generate slug from name
    const slug = createPlanDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existing = await this.planModel.findOne({ slug });
    if (existing) {
      throw new BadRequestException('A plan with this name already exists');
    }

    const plan = new this.planModel({
      ...createPlanDto,
      slug,
    });

    await plan.save();

    return {
      success: true,
      message: 'Investment plan created successfully',
      plan,
    };
  }

  /**
   * Update an investment plan
   */
  async updatePlan(planId: string, updatePlanDto: UpdatePlanDto) {
    const plan = await this.planModel.findByIdAndUpdate(
      planId,
      { $set: updatePlanDto },
      { new: true },
    );

    if (!plan) {
      throw new NotFoundException('Investment plan not found');
    }

    return {
      success: true,
      message: 'Investment plan updated successfully',
      plan,
    };
  }

  /**
   * Get all plans (admin)
   */
  async getAllPlans(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, sortOrder = 'asc' } = paginationDto;
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      this.planModel
        .find()
        .sort({ sortOrder: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      this.planModel.countDocuments(),
    ]);

    return createPaginatedResponse(plans, total, page, limit);
  }

  /**
   * Get all user investments (admin)
   */
  async getAllUserInvestments(paginationDto: PaginationDto, status?: string) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const [investments, total] = await Promise.all([
      this.investmentModel
        .find(filter)
        .populate('userId', 'email firstName lastName')
        .populate('planId', 'name dailyReturnRate durationDays')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.investmentModel.countDocuments(filter),
    ]);

    return {
      success: true,
      investments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete/deactivate a plan
   */
  async deletePlan(planId: string) {
    // Check if plan has active investments
    const activeInvestments = await this.investmentModel.countDocuments({
      planId: new Types.ObjectId(planId),
      status: InvestmentStatus.ACTIVE,
    });

    if (activeInvestments > 0) {
      // Soft delete - just deactivate
      await this.planModel.findByIdAndUpdate(planId, {
        status: PlanStatus.DISCONTINUED,
      });

      return {
        success: true,
        message: 'Plan deactivated (has active investments)',
      };
    }

    // Hard delete if no active investments
    await this.planModel.findByIdAndDelete(planId);

    return {
      success: true,
      message: 'Investment plan deleted successfully',
    };
  }

  // ==========================================
  // CRON: Profit Processing
  // ==========================================

  /**
   * Process daily profits for all active investments
   * Called by cron job
   */
  async processDailyProfits() {
    const activeInvestments = await this.investmentModel.find({
      status: InvestmentStatus.ACTIVE,
      maturityDate: { $gt: new Date() },
    });

    let processed = 0;
    let totalProfitDistributed = 0;

    for (const investment of activeInvestments) {
      // Check if profit already processed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (investment.lastProfitDate && investment.lastProfitDate >= today) {
        continue; // Already processed today
      }

      // Calculate and credit daily profit
      const dailyProfit = investment.dailyProfitAmount;

      // Update investment
      investment.accumulatedProfit += dailyProfit;
      investment.daysCompleted += 1;
      investment.lastProfitDate = new Date();
      investment.profitHistory.push({
        date: new Date(),
        amount: dailyProfit,
        status: 'credited',
      });

      // Credit to wallet
      if (investment.autoCompound) {
        // Add to locked balance (reinvested)
        await this.walletModel.findOneAndUpdate(
          { userId: investment.userId },
          { $inc: { lockedBalance: dailyProfit } },
        );
        investment.compoundedAmount += dailyProfit;
      } else {
        // Add to main balance
        await this.walletModel.findOneAndUpdate(
          { userId: investment.userId },
          { $inc: { mainBalance: dailyProfit, totalEarnings: dailyProfit } },
        );
        investment.paidOutProfit += dailyProfit;

        // Create profit transaction
        await this.transactionModel.create({
          userId: investment.userId,
          transactionRef: generateReference('TXN'),
          type: TransactionType.PROFIT,
          status: TransactionStatus.COMPLETED,
          amount: dailyProfit,
          description: `Daily profit from ${investment.planName}`,
          investmentId: investment._id,
        });
      }

      await investment.save();
      processed++;
      totalProfitDistributed += dailyProfit;
    }

    // Check for matured investments
    await this.processMaturedInvestments();

    return {
      processed,
      totalProfitDistributed,
      timestamp: new Date(),
    };
  }

  /**
   * Process matured investments
   */
  async processMaturedInvestments() {
    const maturedInvestments = await this.investmentModel.find({
      status: InvestmentStatus.ACTIVE,
      maturityDate: { $lte: new Date() },
    });

    for (const investment of maturedInvestments) {
      // Mark as matured
      investment.status = InvestmentStatus.MATURED;
      investment.completedAt = new Date();

      // Return principal if applicable
      if (investment.principalReturn) {
        const returnAmount = investment.amount + investment.compoundedAmount;

        await this.walletModel.findOneAndUpdate(
          { userId: investment.userId },
          {
            $inc: { mainBalance: returnAmount, lockedBalance: -returnAmount },
          },
        );

        // Create transaction for principal return
        await this.transactionModel.create({
          userId: investment.userId,
          transactionRef: generateReference('TXN'),
          type: TransactionType.PROFIT,
          status: TransactionStatus.COMPLETED,
          amount: returnAmount,
          description: `Principal return from ${investment.planName}`,
          investmentId: investment._id,
        });
      } else {
        // Just unlock the initial investment (it's already been used)
        await this.walletModel.findOneAndUpdate(
          { userId: investment.userId },
          { $inc: { lockedBalance: -investment.amount } },
        );
      }

      await investment.save();

      // Update plan statistics
      await this.planModel.findByIdAndUpdate(investment.planId, {
        $inc: { totalPaidOut: investment.paidOutProfit + (investment.principalReturn ? investment.amount : 0) },
      });

      // Send email notification
      const user = await this.userModel.findById(investment.userId);
      if (user) {
        // You can add a maturity email method to EmailService
      }
    }

    return maturedInvestments.length;
  }
}

