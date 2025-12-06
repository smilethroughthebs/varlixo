/**
 * ==============================================
 * VARLIXO - DATABASE SEED SERVICE
 * ==============================================
 * Creates default admin account on startup if it doesn't exist.
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole, UserStatus, KycStatus } from '../schemas/user.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.ensureWalletsExist();
  }

  /**
   * Create default admin account if it doesn't exist
   */
  async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@varlixo.com';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'Admin@123456';

    try {
      // Check if admin exists
      const existingAdmin = await this.userModel.findOne({ email: adminEmail });

      if (existingAdmin) {
        // Make sure the user has admin role
        if (existingAdmin.role !== UserRole.ADMIN && existingAdmin.role !== UserRole.SUPER_ADMIN) {
          existingAdmin.role = UserRole.SUPER_ADMIN;
          await existingAdmin.save();
          this.logger.log(`Updated ${adminEmail} to SUPER_ADMIN role`);
        } else {
          this.logger.log(`Admin account already exists: ${adminEmail}`);
        }
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const admin = await this.userModel.create({
        firstName: 'Karlos',
        lastName: 'Victor',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        kycStatus: KycStatus.APPROVED,
        referralCode: 'ADMIN001',
      });

      // Create wallet for admin
      await this.walletModel.create({
        userId: admin._id,
        mainBalance: 0,
        investmentBalance: 0,
        referralBalance: 0,
        pendingBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalEarnings: 0,
      });

      this.logger.log('='.repeat(50));
      this.logger.log('🔐 ADMIN ACCOUNT CREATED');
      this.logger.log('='.repeat(50));
      this.logger.log(`📧 Email: ${adminEmail}`);
      this.logger.log(`🔑 Password: ${adminPassword}`);
      this.logger.log('='.repeat(50));
      this.logger.warn('⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!');
      this.logger.log('='.repeat(50));

    } catch (error) {
      this.logger.error('Failed to seed admin account:', error.message);
    }
  }

  /**
   * Ensure all users have wallets (data integrity check)
   */
  async ensureWalletsExist() {
    try {
      const users = await this.userModel.find({});
      let createdCount = 0;

      for (const user of users) {
        const wallet = await this.walletModel.findOne({ userId: user._id });
        if (!wallet) {
          await this.walletModel.create({
            userId: user._id,
            mainBalance: 0,
            pendingBalance: 0,
            lockedBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalEarnings: 0,
            referralEarnings: 0,
          });
          createdCount++;
        }
      }

      if (createdCount > 0) {
        this.logger.log(`Created ${createdCount} missing wallet(s)`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure wallets exist:', error.message);
    }
  }
}

