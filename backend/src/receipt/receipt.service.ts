/**
 * ==============================================
 * VARLIXO - RECEIPT SERVICE
 * ==============================================
 * Generates and manages transaction receipts.
 * Provides official documentation for completed transactions.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receipt, ReceiptDocument, ReceiptStatus } from '../schemas/receipt.schema';
import { Transaction, TransactionDocument, TransactionStatus } from '../schemas/transaction.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate receipt for a completed transaction
   */
  async generateReceipt(transactionId: string, issuedBy?: string): Promise<ReceiptDocument> {
    // Find the transaction
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Only generate receipts for completed transactions
    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('Receipts can only be generated for completed transactions');
    }

    // Check if receipt already exists
    const existingReceipt = await this.receiptModel.findOne({ transactionId: transaction._id });
    if (existingReceipt) {
      return existingReceipt;
    }

    // Get user details
    const user = await this.userModel.findById(transaction.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate receipt number
    const receiptNumber = this.generateReceiptNumber();

    // Create receipt
    const receipt = new this.receiptModel({
      transactionId: transaction._id,
      userId: transaction.userId,
      receiptNumber,
      status: ReceiptStatus.GENERATED,
      issuedAt: new Date(),
      issuedBy: issuedBy || 'System',
      transactionType: transaction.type,
      paymentMethod: transaction.paymentMethod,
      amount: transaction.amount,
      currency: transaction.currency,
      fee: transaction.fee,
      netAmount: transaction.netAmount,
      description: transaction.description,
      transactionRef: transaction.transactionRef,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      txHash: transaction.txHash,
      bankName: transaction.bankName,
      accountNumber: transaction.accountNumber,
      accountName: transaction.accountName,
      adminNote: transaction.adminNote,
      ipAddress: transaction.ipAddress,
      userAgent: transaction.userAgent,
    });

    await receipt.save();

    // Send receipt email
    await this.emailService.sendReceiptEmail(user.email, user.firstName, receiptNumber, transaction);

    return receipt;
  }

  /**
   * Get user receipts
   */
  async getUserReceipts(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [receipts, total] = await Promise.all([
      this.receiptModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('transactionId'),
      this.receiptModel.countDocuments({ userId }),
    ]);

    return {
      receipts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get receipt by ID
   */
  async getReceiptById(receiptId: string): Promise<ReceiptDocument> {
    const receipt = await this.receiptModel
      .findById(receiptId)
      .populate('transactionId');
    
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  /**
   * Download receipt (mark as downloaded)
   */
  async downloadReceipt(receiptId: string, userId: string): Promise<ReceiptDocument> {
    const receipt = await this.receiptModel.findById(receiptId);
    
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (receipt.userId.toString() !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Mark as downloaded
    receipt.status = ReceiptStatus.DOWNLOADED;
    await receipt.save();

    return receipt;
  }

  /**
   * Generate unique receipt number
   */
  private generateReceiptNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${timestamp}-${random}`;
  }

  /**
   * Auto-generate receipts for completed transactions
   */
  async autoGenerateReceipts(): Promise<void> {
    // Find completed transactions without receipts
    const transactionsWithoutReceipts = await this.transactionModel
      .find({ 
        status: TransactionStatus.COMPLETED,
      })
      .populate({
        path: 'userId',
        select: 'email firstName lastName',
      });

    for (const transaction of transactionsWithoutReceipts) {
      // Check if receipt already exists
      const existingReceipt = await this.receiptModel.findOne({ 
        transactionId: transaction._id 
      });

      if (!existingReceipt) {
        await this.generateReceipt(transaction._id.toString(), 'System');
      }
    }
  }

  /**
   * Get receipt data for PDF generation
   */
  async getReceiptData(receiptId: string): Promise<any> {
    const receipt = await this.getReceiptById(receiptId);
    
    return {
      receiptNumber: receipt.receiptNumber,
      issuedAt: receipt.issuedAt,
      issuedBy: receipt.issuedBy,
      transactionType: receipt.transactionType,
      paymentMethod: receipt.paymentMethod,
      amount: receipt.amount,
      currency: receipt.currency,
      fee: receipt.fee,
      netAmount: receipt.netAmount,
      description: receipt.description,
      transactionRef: receipt.transactionRef,
      fromAddress: receipt.fromAddress,
      toAddress: receipt.toAddress,
      txHash: receipt.txHash,
      bankName: receipt.bankName,
      accountNumber: receipt.accountNumber,
      accountName: receipt.accountName,
      adminNote: receipt.adminNote,
    };
  }
}
