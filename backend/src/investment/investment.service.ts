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
import { RecurringPlan, RecurringPlanDocument, RecurringPlanStatus } from '../schemas/recurring-plan.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import { User, UserDocument, KycStatus } from '../schemas/user.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from '../schemas/transaction.schema';
import { Referral, ReferralDocument, ReferralStatus } from '../schemas/referral.schema';
import { CreateInvestmentDto, CalculateReturnsDto, CreatePlanDto, UpdatePlanDto } from './dto/investment.dto';
import { StartRecurringPlanDto } from './dto/recurring-plan.dto';
import { generateReference, roundTo, addDays, calculatePercentage } from '../common/utils/helpers';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';
import { EmailService } from '../email/email.service';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(InvestmentPlan.name) private planModel: Model<InvestmentPlanDocument>,
    @InjectModel(Investment.name) private investmentModel: Model<InvestmentDocument>,
    @InjectModel(RecurringPlan.name) private recurringPlanModel: Model<RecurringPlanDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private emailService: EmailService,
    private currencyService: CurrencyService,
  ) {}

  // ==========================================
  // PUBLIC: Investment Plans
  // ==========================================

  /**
   * Get all active investment plans with country-specific limits
   */
  async getActivePlans(country?: string) {
    const plans = await this.planModel
      .find({ status: PlanStatus.ACTIVE })
      .sort({ sortOrder: 1, minInvestment: 1 });

    // Apply country-specific limits if country is provided
    const plansWithCountryLimits = plans.map(plan => {
      const planObj = plan.toObject();
      
      if (country && planObj.countryLimits && planObj.countryLimits.length > 0) {
        const countryLimit = planObj.countryLimits.find(
          (limit: any) => limit.country === country
        );
        
        if (countryLimit) {
          planObj.minInvestment = countryLimit.minInvestment;
          planObj.maxInvestment = countryLimit.maxInvestment;
          planObj.hasCountrySpecificLimits = true;
        }
      }
      
      return planObj;
    });

    return {
      success: true,
      plans: plansWithCountryLimits,
    };
  }

  // ==========================================
  // RECURRING PLANS
  // ==========================================

  /**
   * Start a new recurring investment plan (6-month or 12-month)
   */
  async startRecurringPlan(userId: string, dto: StartRecurringPlanDto) {
    const { planType, monthlyContribution } = dto;

    // Map planType to monthsRequired
    let monthsRequired: number;
    if (planType === '6-month') {
      monthsRequired = 6;
    } else if (planType === '12-month') {
      monthsRequired = 12;
    } else {
      throw new BadRequestException('Invalid recurring plan type');
    }

    if (monthlyContribution <= 0) {
      throw new BadRequestException('Monthly contribution must be greater than 0');
    }

    const now = new Date();
    const startDate = now;

    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + monthsRequired);

    const recurringPlan = new this.recurringPlanModel({
      userId: new Types.ObjectId(userId),
      planType,
      monthlyContribution,
      startDate,
      nextPaymentDate,
      maturityDate,
      monthsCompleted: 0,
      monthsRequired,
      totalContributed: 0,
      portfolioValue: 0,
      status: RecurringPlanStatus.ACTIVE,
      withdrawalRequested: false,
      withdrawalApproved: false,
    });

    await recurringPlan.save();

    return {
      success: true,
      message: 'Recurring plan started successfully',
      plan: {
        id: recurringPlan._id,
        planType: recurringPlan.planType,
        monthlyContribution: recurringPlan.monthlyContribution,
        startDate: recurringPlan.startDate,
        nextPaymentDate: recurringPlan.nextPaymentDate,
        maturityDate: recurringPlan.maturityDate,
        monthsCompleted: recurringPlan.monthsCompleted,
        monthsRequired: recurringPlan.monthsRequired,
        totalContributed: recurringPlan.totalContributed,
        portfolioValue: recurringPlan.portfolioValue,
        status: recurringPlan.status,
      },
    };
  }

  /**
   * Get all recurring plans for a user
   */
  async getUserRecurringPlans(userId: string) {
    const plans = await this.recurringPlanModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    const mapped = plans.map((plan) => {
      const progress = plan.monthsRequired > 0
        ? Math.round((plan.monthsCompleted / plan.monthsRequired) * 100)
        : 0;

      const monthsRemaining = Math.max(plan.monthsRequired - plan.monthsCompleted, 0);

      return {
        id: plan._id,
        planType: plan.planType,
        monthlyContribution: plan.monthlyContribution,
        startDate: plan.startDate,
        nextPaymentDate: plan.nextPaymentDate,
        maturityDate: plan.maturityDate,
        monthsCompleted: plan.monthsCompleted,
        monthsRequired: plan.monthsRequired,
        monthsRemaining,
        totalContributed: plan.totalContributed,
        portfolioValue: plan.portfolioValue,
        status: plan.status,
        progress,
      };
    });

    return {
      success: true,
      plans: mapped,
    };
  }

  /**
   * Pay a monthly installment for a recurring plan
   */
  async payRecurringInstallment(userId: string, planId: string, ipAddress?: string, userAgent?: string) {
    const plan = await this.recurringPlanModel.findOne({
      _id: new Types.ObjectId(planId),
      userId: new Types.ObjectId(userId),
    });

    if (!plan) {
      throw new NotFoundException('Recurring plan not found');
    }

    if (plan.status !== RecurringPlanStatus.ACTIVE) {
      throw new BadRequestException('Only active recurring plans can receive payments');
    }

    if (plan.monthsCompleted >= plan.monthsRequired) {
      throw new BadRequestException('This recurring plan is already fully funded');
    }

    const amount = plan.monthlyContribution;
    if (amount <= 0) {
      throw new BadRequestException('Invalid monthly contribution amount');
    }

    // Get wallet and ensure sufficient balance
    const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!wallet || wallet.mainBalance < amount) {
      throw new BadRequestException('Insufficient balance to pay monthly installment');
    }

    // Deduct from wallet and move to locked balance
    const balanceBefore = wallet.mainBalance;
    wallet.mainBalance -= amount;
    wallet.lockedBalance += amount;
    await wallet.save();

    // Update recurring plan progress
    plan.monthsCompleted += 1;
    plan.totalContributed += amount;
    plan.portfolioValue += amount; // Simple placeholder until a profit engine is added

    // Update next payment date
    const nextPayment = plan.nextPaymentDate ? new Date(plan.nextPaymentDate) : new Date();
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    plan.nextPaymentDate = nextPayment;

    // Push payment history record
    plan.paymentHistory = plan.paymentHistory || [];
    plan.paymentHistory.push({
      monthNumber: plan.monthsCompleted,
      amount,
      datePaid: new Date(),
      status: 'paid',
    } as any);

    // If user has completed all months, mark as matured
    if (plan.monthsCompleted >= plan.monthsRequired) {
      plan.status = RecurringPlanStatus.MATURED;
    }

    await plan.save();

    // Create transaction record
    const currencyFields = await this.currencyService.buildTransactionCurrencyFields({
      amountUsd: amount,
      ipAddress,
    });

    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      transactionRef: generateReference('TXN'),
      type: TransactionType.INVESTMENT,
      status: TransactionStatus.COMPLETED,
      amount,
      description: `Monthly contribution to recurring plan (${plan.planType})`,
      balanceBefore,
      balanceAfter: wallet.mainBalance,
      ipAddress,
      userAgent,
      ...currencyFields,
    });

    const progress = plan.monthsRequired > 0
      ? Math.round((plan.monthsCompleted / plan.monthsRequired) * 100)
      : 0;

    return {
      success: true,
      message: 'Monthly installment paid successfully',
      plan: {
        id: plan._id,
        planType: plan.planType,
        monthlyContribution: plan.monthlyContribution,
        startDate: plan.startDate,
        nextPaymentDate: plan.nextPaymentDate,
        maturityDate: plan.maturityDate,
        monthsCompleted: plan.monthsCompleted,
        monthsRequired: plan.monthsRequired,
        totalContributed: plan.totalContributed,
        portfolioValue: plan.portfolioValue,
        status: plan.status,
        progress,
      },
      transactionId: transaction._id,
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
    const currencyFields = await this.currencyService.buildTransactionCurrencyFields({
      amountUsd: amount,
      ipAddress,
    });

    await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      transactionRef: generateReference('TXN'),
      type: TransactionType.INVESTMENT,
      status: TransactionStatus.COMPLETED,
      amount,
      description: `Investment in ${plan.name}`,
      investmentId: investment._id,
      balanceBefore: wallet.mainBalance + amount,
      balanceAfter: wallet.mainBalance,
      ipAddress,
      userAgent,
      ...currencyFields,
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
    const currencyFields = await this.currencyService.buildTransactionCurrencyFields({
      amountUsd: bonusAmount,
    });

    await this.transactionModel.create({
      userId: referrerId,
      transactionRef: generateReference('TXN'),
      type: TransactionType.REFERRAL_BONUS,
      status: TransactionStatus.COMPLETED,
      amount: bonusAmount,
      description: `Referral bonus from investment`,
      referredUserId: new Types.ObjectId(referredUserId),
      investmentId,
      ...currencyFields,
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
   * Get all recurring plans (admin)
   */
  async getAllRecurringPlans(paginationDto: PaginationDto, status?: string) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const [plans, total] = await Promise.all([
      this.recurringPlanModel
        .find(filter)
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.recurringPlanModel.countDocuments(filter),
    ]);

    return {
      success: true,
      plans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
\hould I provide the exact old_string and new_string to update the languages array and add all missing translations in one go?
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

