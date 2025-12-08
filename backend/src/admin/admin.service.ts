/**
 * ==============================================
 * VARLIXO - ADMIN SERVICE
 * ==============================================
 * Handles all administrative operations including
 * user management, transaction approvals, and system monitoring.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole, UserStatus, KycStatus } from '../schemas/user.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import { Deposit, DepositDocument } from '../schemas/deposit.schema';
import { Withdrawal, WithdrawalDocument } from '../schemas/withdrawal.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from '../schemas/transaction.schema';
import { Investment, InvestmentDocument } from '../schemas/investment.schema';
import { AdminLog, AdminLogDocument, AdminActionType } from '../schemas/admin-log.schema';
import { generateReference, roundTo } from '../common/utils/helpers';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Deposit.name) private depositModel: Model<DepositDocument>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Investment.name) private investmentModel: Model<InvestmentDocument>,
    @InjectModel(AdminLog.name) private adminLogModel: Model<AdminLogDocument>,
    private emailService: EmailService,
  ) {}

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      pendingKyc,
      pendingDeposits,
      pendingWithdrawals,
      totalDeposits,
      totalWithdrawals,
      activeInvestments,
      walletAggregates,
    ] = await Promise.all([
      // Count all users (including admins) for dashboard totals
      this.userModel.countDocuments({}),
      this.userModel.countDocuments({ status: UserStatus.ACTIVE }),
      this.userModel.countDocuments({ kycStatus: KycStatus.PENDING }),
      this.depositModel.countDocuments({ status: TransactionStatus.PENDING }),
      this.withdrawalModel.countDocuments({ status: TransactionStatus.PENDING }),
      this.depositModel.aggregate([
        { $match: { status: TransactionStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.withdrawalModel.aggregate([
        { $match: { status: TransactionStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.investmentModel.countDocuments({ status: 'active' }),
      this.walletModel.aggregate([
        {
          $group: {
            _id: null,
            totalBalance: { $sum: '$mainBalance' },
            totalPending: { $sum: '$pendingBalance' },
            totalLocked: { $sum: '$lockedBalance' },
            totalEarnings: { $sum: '$totalEarnings' },
            totalReferralEarnings: { $sum: '$referralEarnings' },
          },
        },
      ]),
    ]);

    const walletStats = walletAggregates?.[0] || {
      totalBalance: 0,
      totalPending: 0,
      totalLocked: 0,
      totalEarnings: 0,
      totalReferralEarnings: 0,
    };

    // Recent activity
    const recentDeposits = await this.depositModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName email');

    const recentWithdrawals = await this.withdrawalModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName email');

    return {
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pendingKyc,
        },
        transactions: {
          pendingDeposits,
          pendingWithdrawals,
          totalDeposited: totalDeposits[0]?.total || 0,
          totalWithdrawn: totalWithdrawals[0]?.total || 0,
        },
        investments: {
          active: activeInvestments,
        },
        wallets: {
          totalBalance: walletStats.totalBalance || 0,
          available: walletStats.totalBalance || 0,
          pending: walletStats.totalPending || 0,
          locked: walletStats.totalLocked || 0,
          totalEarnings: walletStats.totalEarnings || 0,
          referralEarnings: walletStats.totalReferralEarnings || 0,
        },
      },
      recentActivity: {
        deposits: recentDeposits,
        withdrawals: recentWithdrawals,
      },
    };
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  /**
   * Get all users
   */
  async getUsers(paginationDto: PaginationDto, filters?: { status?: string; kycStatus?: string }) {
    const { page = 1, limit = 20, sortOrder = 'desc', search } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = { role: UserRole.USER };

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.kycStatus) {
      query.kycStatus = filters.kycStatus;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password -twoFactorSecret -twoFactorBackupCodes')
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments(query),
    ]);

    // Attach wallet balances so admin UI can display real balances
    const userIds = users.map((u) => u._id);
    const wallets = await this.walletModel.find({ userId: { $in: userIds } });
    const walletMap = new Map<string, WalletDocument>();
    wallets.forEach((w) => {
      walletMap.set(w.userId.toString(), w);
    });

    const usersWithWallet = users.map((user) => {
      const wallet = walletMap.get(user._id.toString());

      return {
        ...user.toObject(),
        // Flatten wallet balances for admin frontend convenience
        mainBalance: wallet?.mainBalance ?? 0,
        pendingBalance: wallet?.pendingBalance ?? 0,
        lockedBalance: wallet?.lockedBalance ?? 0,
        totalEarnings: wallet?.totalEarnings ?? 0,
        referralEarnings: wallet?.referralEarnings ?? 0,
      };
    });

    return createPaginatedResponse(usersWithWallet, total, page, limit);
  }

  /**
   * Get user details with wallet and investments
   */
  async getUserDetails(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password -twoFactorSecret -twoFactorBackupCodes');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [wallet, investments, deposits, withdrawals] = await Promise.all([
      this.walletModel.findOne({ userId: new Types.ObjectId(userId) }),
      this.investmentModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(10),
      this.depositModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(10),
      this.withdrawalModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(10),
    ]);

    return {
      success: true,
      user,
      wallet,
      investments,
      deposits,
      withdrawals,
    };
  }

  /**
   * Update user status
   */
  async updateUserStatus(adminId: string, userId: string, status: UserStatus, reason?: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    // Log admin action
    await this.logAdminAction(adminId, AdminActionType.USER_STATUS_CHANGE, {
      targetType: 'user',
      targetId: new Types.ObjectId(userId),
      description: `Changed user status from ${previousStatus} to ${status}`,
      previousValue: { status: previousStatus },
      newValue: { status, reason },
    });

    return {
      success: true,
      message: `User status updated to ${status}`,
    };
  }

  /**
   * Adjust user balance
   */
  async adjustUserBalance(
    adminId: string,
    userId: string,
    amount: number,
    type: 'add' | 'subtract',
    reason: string,
  ) {
    const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const previousBalance = wallet.mainBalance;
    
    if (type === 'subtract' && wallet.mainBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.mainBalance = type === 'add' 
      ? wallet.mainBalance + amount 
      : wallet.mainBalance - amount;
    await wallet.save();

    // Create transaction record
    await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      transactionRef: generateReference('TXN'),
      type: type === 'add' ? TransactionType.BONUS : TransactionType.FEE,
      status: TransactionStatus.COMPLETED,
      amount,
      amount_usd: amount,
      description: `Admin adjustment: ${reason}`,
      balanceBefore: previousBalance,
      balanceAfter: wallet.mainBalance,
      processedBy: new Types.ObjectId(adminId),
    });

    // Log admin action
    await this.logAdminAction(adminId, AdminActionType.USER_BALANCE_ADJUST, {
      targetType: 'wallet',
      targetId: wallet._id,
      description: `${type === 'add' ? 'Added' : 'Subtracted'} $${amount} - ${reason}`,
      previousValue: { balance: previousBalance },
      newValue: { balance: wallet.mainBalance },
    });

    return {
      success: true,
      message: `Balance ${type === 'add' ? 'added' : 'subtracted'} successfully`,
      newBalance: wallet.mainBalance,
    };
  }

  // ==========================================
  // DEPOSIT MANAGEMENT
  // ==========================================

  /**
   * Get all deposits
   */
  async getDeposits(paginationDto: PaginationDto, status?: string) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [deposits, total] = await Promise.all([
      this.depositModel
        .find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.depositModel.countDocuments(query),
    ]);

    return createPaginatedResponse(deposits, total, page, limit);
  }

  /**
   * Approve deposit
   */
  async approveDeposit(adminId: string, depositId: string, adminNote?: string) {
    const deposit = await this.depositModel.findById(depositId);
    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    if (deposit.status !== TransactionStatus.PENDING && deposit.status !== TransactionStatus.PROCESSING) {
      throw new BadRequestException('Deposit already processed');
    }

    // Update deposit
    deposit.status = TransactionStatus.COMPLETED;
    deposit.approvedBy = new Types.ObjectId(adminId);
    deposit.approvedAt = new Date();
    deposit.adminNote = adminNote;
    await deposit.save();

    // Credit user wallet
    const wallet = await this.walletModel.findOne({ userId: deposit.userId });
    const previousBalance = wallet.mainBalance;
    wallet.mainBalance += deposit.amount;
    await wallet.save();

    // Create transaction
    await this.transactionModel.create({
      userId: deposit.userId,
      transactionRef: generateReference('TXN'),
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount: deposit.amount,
      paymentMethod: deposit.paymentMethod,
      description: `Deposit approved - ${deposit.depositRef}`,
      balanceBefore: previousBalance,
      balanceAfter: wallet.mainBalance,
      processedBy: new Types.ObjectId(adminId),
    });

    // Send email notification
    const user = await this.userModel.findById(deposit.userId);
    if (user) {
      await this.emailService.sendDepositConfirmedEmail(
        user.email,
        user.firstName,
        deposit.amount,
        'USD',
        deposit.depositRef,
        wallet.mainBalance,
      );
    }

    // Log admin action
    await this.logAdminAction(adminId, AdminActionType.DEPOSIT_APPROVE, {
      targetType: 'deposit',
      targetId: deposit._id,
      description: `Approved deposit ${deposit.depositRef} for $${deposit.amount}`,
    });

    return {
      success: true,
      message: 'Deposit approved successfully',
    };
  }

  /**
   * Reject deposit
   */
  async rejectDeposit(adminId: string, depositId: string, reason: string) {
    const deposit = await this.depositModel.findById(depositId);
    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    if (deposit.status !== TransactionStatus.PENDING && deposit.status !== TransactionStatus.PROCESSING) {
      throw new BadRequestException('Deposit already processed');
    }

    deposit.status = TransactionStatus.REJECTED;
    deposit.rejectedBy = new Types.ObjectId(adminId);
    deposit.rejectedAt = new Date();
    deposit.rejectionReason = reason;
    await deposit.save();

    // Log admin action
    await this.logAdminAction(adminId, AdminActionType.DEPOSIT_REJECT, {
      targetType: 'deposit',
      targetId: deposit._id,
      description: `Rejected deposit ${deposit.depositRef} - ${reason}`,
    });

    return {
      success: true,
      message: 'Deposit rejected',
    };
  }

  // ==========================================
  // WITHDRAWAL MANAGEMENT
  // ==========================================

  /**
   * Get all withdrawals
   */
  async getWithdrawals(paginationDto: PaginationDto, status?: string) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [withdrawals, total] = await Promise.all([
      this.withdrawalModel
        .find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.withdrawalModel.countDocuments(query),
    ]);

    return createPaginatedResponse(withdrawals, total, page, limit);
  }

  /**
   * Approve withdrawal
   */
  async approveWithdrawal(adminId: string, withdrawalId: string, txHash?: string, adminNote?: string) {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Withdrawal already processed');
    }

    // Update withdrawal
    withdrawal.status = TransactionStatus.COMPLETED;
    withdrawal.approvedBy = new Types.ObjectId(adminId);
    withdrawal.approvedAt = new Date();
    withdrawal.processedBy = new Types.ObjectId(adminId);
    withdrawal.processedAt = new Date();
    withdrawal.txHash = txHash;
    withdrawal.adminNote = adminNote;
    await withdrawal.save();

    // Move from pending to completed in wallet
    const wallet = await this.walletModel.findOne({ userId: withdrawal.userId });
    wallet.pendingBalance -= withdrawal.amount;
    await wallet.save();

    // Send email notification
    const user = await this.userModel.findById(withdrawal.userId);
    if (user) {
      await this.emailService.sendWithdrawalCompletedEmail(
        user.email,
        user.firstName,
        withdrawal.netAmount,
        'USD',
        txHash,
      );
    }

    // Log admin action
    await this.logAdminAction(adminId, AdminActionType.WITHDRAWAL_APPROVE, {
      targetType: 'withdrawal',
      targetId: withdrawal._id,
      description: `Approved withdrawal ${withdrawal.withdrawalRef} for $${withdrawal.amount}`,
    });

    return {
      success: true,
      message: 'Withdrawal approved and processed',
    };
  }

  /**
   * Reject withdrawal
   */
  async rejectWithdrawal(adminId: string, withdrawalId: string, reason: string) {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Withdrawal already processed');
    }

    withdrawal.status = TransactionStatus.REJECTED;
    withdrawal.rejectedBy = new Types.ObjectId(adminId);
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectionReason = reason;
    await withdrawal.save();

    // Refund to user's wallet
    const wallet = await this.walletModel.findOne({ userId: withdrawal.userId });
    wallet.pendingBalance -= withdrawal.amount;
    wallet.mainBalance += withdrawal.amount;
    await wallet.save();

    // Create refund transaction
    await this.transactionModel.create({
      userId: withdrawal.userId,
      transactionRef: generateReference('TXN'),
      type: TransactionType.REFUND,
      status: TransactionStatus.COMPLETED,
      amount: withdrawal.amount,
      description: `Withdrawal rejected - ${reason}`,
    });

    // Send email notification
    const user = await this.userModel.findById(withdrawal.userId);
    if (user) {
      await this.emailService.sendWithdrawalRejectedEmail(
        user.email,
        user.firstName,
        withdrawal.amount,
        'USD',
        reason,
      );
    }

    // Log admin action
    await this.logAdminAction(adminId, AdminActionType.WITHDRAWAL_REJECT, {
      targetType: 'withdrawal',
      targetId: withdrawal._id,
      description: `Rejected withdrawal ${withdrawal.withdrawalRef} - ${reason}`,
    });

    return {
      success: true,
      message: 'Withdrawal rejected and funds returned to user',
    };
  }

  // ==========================================
  // ADMIN LOGGING
  // ==========================================

  /**
   * Log admin action
   */
  private async logAdminAction(
    adminId: string,
    action: AdminActionType,
    details: {
      targetType?: string;
      targetId?: Types.ObjectId;
      description: string;
      previousValue?: Record<string, any>;
      newValue?: Record<string, any>;
      ipAddress?: string;
    },
  ) {
    await this.adminLogModel.create({
      adminId: new Types.ObjectId(adminId),
      action,
      ...details,
    });
  }

  /**
   * Get admin logs
   */
  async getAdminLogs(paginationDto: PaginationDto) {
    const { page = 1, limit = 50, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.adminLogModel
        .find()
        .populate('adminId', 'firstName lastName email')
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.adminLogModel.countDocuments(),
    ]);

    return createPaginatedResponse(logs, total, page, limit);
  }

  // ==========================================
  // DATA MANAGEMENT
  // ==========================================

  /**
   * Clear all test data (keeps admin accounts)
   */
  async clearTestData(adminId: string) {
    // Get all non-admin user IDs
    const nonAdminUsers = await this.userModel.find({ 
      role: UserRole.USER 
    }).select('_id');
    
    const userIds = nonAdminUsers.map(u => u._id);

    // Delete all related data
    const [
      deletedDeposits,
      deletedWithdrawals,
      deletedTransactions,
      deletedInvestments,
      deletedWallets,
      deletedUsers,
    ] = await Promise.all([
      this.depositModel.deleteMany({ userId: { $in: userIds } }),
      this.withdrawalModel.deleteMany({ userId: { $in: userIds } }),
      this.transactionModel.deleteMany({ userId: { $in: userIds } }),
      this.investmentModel.deleteMany({ userId: { $in: userIds } }),
      this.walletModel.deleteMany({ userId: { $in: userIds } }),
      this.userModel.deleteMany({ role: UserRole.USER }),
    ]);

    // Log admin action
    await this.logAdminAction(adminId, AdminActionType.OTHER, {
      description: `Cleared all test data: ${deletedUsers.deletedCount} users, ${deletedDeposits.deletedCount} deposits, ${deletedWithdrawals.deletedCount} withdrawals, ${deletedTransactions.deletedCount} transactions, ${deletedInvestments.deletedCount} investments`,
    });

    return {
      success: true,
      message: 'Test data cleared successfully',
      deleted: {
        users: deletedUsers.deletedCount,
        deposits: deletedDeposits.deletedCount,
        withdrawals: deletedWithdrawals.deletedCount,
        transactions: deletedTransactions.deletedCount,
        investments: deletedInvestments.deletedCount,
        wallets: deletedWallets.deletedCount,
      },
    };
  }
}



