/**
 * ==============================================
 * VARLIXO - KYC SERVICE
 * ==============================================
 * Handles KYC document submission and verification
 * with email notifications.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Kyc, KycDocument, KycDocumentStatus, KycDocumentType } from '../schemas/kyc.schema';
import { User, UserDocument, KycStatus } from '../schemas/user.schema';
import { SubmitKycDto, AdminReviewKycDto } from './dto/kyc.dto';
import { EmailService } from '../email/email.service';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationPriority, NotificationType } from '../schemas/notification.schema';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(Kyc.name) private kycModel: Model<KycDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Submit KYC documents
   */
  async submitKyc(
    userId: string,
    submitKycDto: SubmitKycDto,
    frontImage: string,
    backImage?: string,
    selfieImage?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has pending or approved KYC
    const existingKyc = await this.kycModel.findOne({
      userId: new Types.ObjectId(userId),
      status: { $in: [KycDocumentStatus.PENDING, KycDocumentStatus.UNDER_REVIEW, KycDocumentStatus.APPROVED] },
    });

    if (existingKyc) {
      if (existingKyc.status === KycDocumentStatus.APPROVED) {
        throw new BadRequestException('Your KYC is already verified');
      }
      throw new BadRequestException('You already have a pending KYC submission');
    }

    // Create KYC document
    const kyc = new this.kycModel({
      userId: new Types.ObjectId(userId),
      documentType: submitKycDto.documentType,
      documentNumber: submitKycDto.documentNumber,
      issuingCountry: submitKycDto.issuingCountry,
      issueDate: submitKycDto.issueDate ? new Date(submitKycDto.issueDate) : undefined,
      expiryDate: submitKycDto.expiryDate ? new Date(submitKycDto.expiryDate) : undefined,
      frontImage,
      backImage,
      selfieImage,
      fullNameOnDocument: submitKycDto.fullNameOnDocument,
      dateOfBirthOnDocument: submitKycDto.dateOfBirthOnDocument 
        ? new Date(submitKycDto.dateOfBirthOnDocument) 
        : undefined,
      addressOnDocument: submitKycDto.addressOnDocument,
      ipAddress,
      userAgent,
    });

    await kyc.save();

    // Update user KYC status
    console.log('Updating user KYC status to PENDING for user:', userId);
    user.kycStatus = KycStatus.PENDING;
    user.kycSubmittedAt = new Date();
    await user.save();
    console.log('User KYC status updated to:', user.kycStatus);

    // Send confirmation email to user
    await this.emailService.sendKycSubmittedEmail(user.email, user.firstName);

    // Send admin notification
    await this.emailService.notifyAdminNewKyc(
      user.email,
      `${user.firstName} ${user.lastName}`,
      submitKycDto.documentType,
    );

    if (user.securityAlerts) {
      this.notificationsService
        .create({
          userId,
          type: NotificationType.KYC,
          priority: NotificationPriority.MEDIUM,
          title: 'KYC submitted',
          message: 'Your KYC documents were submitted and are awaiting review.',
          actionUrl: '/dashboard/kyc',
          actionText: 'View KYC',
          relatedEntity: 'kyc',
          relatedId: kyc._id.toString(),
        })
        .catch(() => undefined);
    }

    return {
      success: true,
      message: 'KYC documents submitted successfully. Verification usually takes 24-48 hours.',
      kyc: {
        id: kyc._id,
        documentType: kyc.documentType,
        status: kyc.status,
        createdAt: kyc.createdAt,
      },
    };
  }

  /**
   * Get user's KYC status
   */
  async getKycStatus(userId: string) {
    console.log('Getting KYC status for user:', userId);
    const user = await this.userModel.findById(userId).select('kycStatus kycSubmittedAt kycVerifiedAt kycRejectionReason');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('User KYC status found:', user.kycStatus);

    const kycDocuments = await this.kycModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('KYC documents found:', kycDocuments.length);

    const result = {
      success: true,
      kycStatus: user.kycStatus,
      submittedAt: user.kycSubmittedAt,
      verifiedAt: user.kycVerifiedAt,
      rejectionReason: user.kycRejectionReason,
      documents: kycDocuments.map((doc) => ({
        id: doc._id,
        documentType: doc.documentType,
        status: doc.status,
        rejectionReason: doc.rejectionReason,
        createdAt: doc.createdAt,
        reviewedAt: doc.reviewedAt,
      })),
    };

    console.log('Returning KYC status:', result);
    return result;
  }

  /**
   * Admin: Get all pending KYC submissions
   */
  async getAllPendingKyc(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const query = {
      status: { $in: [KycDocumentStatus.PENDING, KycDocumentStatus.UNDER_REVIEW] },
    };

    const [kycDocuments, total] = await Promise.all([
      this.kycModel
        .find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.kycModel.countDocuments(query),
    ]);

    return createPaginatedResponse(kycDocuments, total, page, limit);
  }

  /**
   * Admin: Review KYC submission
   */
  async reviewKyc(adminId: string, reviewDto: AdminReviewKycDto) {
    const { kycId, decision, rejectionReason, adminNote } = reviewDto;

    const kyc = await this.kycModel.findById(kycId);
    if (!kyc) {
      throw new NotFoundException('KYC submission not found');
    }

    if (kyc.status === KycDocumentStatus.APPROVED) {
      throw new BadRequestException('This KYC is already approved');
    }

    const user = await this.userModel.findById(kyc.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update KYC status
    kyc.status = decision === 'approved' 
      ? KycDocumentStatus.APPROVED 
      : KycDocumentStatus.REJECTED;
    kyc.reviewedBy = new Types.ObjectId(adminId);
    kyc.reviewedAt = new Date();
    kyc.rejectionReason = rejectionReason;
    kyc.adminNote = adminNote;
    await kyc.save();

    // Update user KYC status
    console.log('Updating user KYC status for approval. Decision:', decision);
    const oldStatus = user.kycStatus;
    user.kycStatus = decision === 'approved' ? KycStatus.APPROVED : KycStatus.REJECTED;
    console.log('User KYC status changed from', oldStatus, 'to', user.kycStatus);
    
    if (decision === 'approved') {
      user.kycVerifiedAt = new Date();
      user.kycRejectionReason = undefined;
    } else {
      user.kycRejectionReason = rejectionReason;
    }
    await user.save();
    console.log('User KYC status saved successfully');

    // Send email notification
    if (decision === 'approved') {
      await this.emailService.sendKycApprovedEmail(user.email, user.firstName);
    } else {
      await this.emailService.sendKycRejectedEmail(
        user.email,
        user.firstName,
        rejectionReason || 'Documents could not be verified',
      );
    }

    if (user.securityAlerts) {
      this.notificationsService
        .create({
          userId: user._id.toString(),
          type: NotificationType.KYC,
          priority: decision === 'approved' ? NotificationPriority.MEDIUM : NotificationPriority.HIGH,
          title: decision === 'approved' ? 'KYC approved' : 'KYC rejected',
          message:
            decision === 'approved'
              ? 'Your identity verification was approved.'
              : `Your identity verification was rejected${rejectionReason ? `: ${rejectionReason}` : '.'}`,
          actionUrl: '/dashboard/kyc',
          actionText: 'View details',
          relatedEntity: 'kyc',
          relatedId: kyc._id.toString(),
        })
        .catch(() => undefined);
    }

    return {
      success: true,
      message: `KYC ${decision === 'approved' ? 'approved' : 'rejected'} successfully`,
      kyc: {
        id: kyc._id,
        status: kyc.status,
        reviewedAt: kyc.reviewedAt,
      },
    };
  }

  /**
   * Admin: Get KYC details
   */
  async getKycDetails(kycId: string) {
    const kyc = await this.kycModel
      .findById(kycId)
      .populate('userId', 'firstName lastName email phone country createdAt');

    if (!kyc) {
      throw new NotFoundException('KYC submission not found');
    }

    return {
      success: true,
      kyc,
    };
  }
}



