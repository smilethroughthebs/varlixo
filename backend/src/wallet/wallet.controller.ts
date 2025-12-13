/**
 * ==============================================
 * VARLIXO - WALLET CONTROLLER
 * ==============================================
 * REST API endpoints for wallet operations.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { WalletService } from './wallet.service';
import { CreateDepositDto, CreateWithdrawalDto, UploadDepositProofDto } from './dto/wallet.dto';
import { RequestLinkedWalletNonceDto, VerifyLinkedWalletDto } from './dto/linked-wallet.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getClientIp } from '../common/utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Get user wallet
   * GET /wallet
   */
  @Get()
  async getWallet(@CurrentUser('sub') userId: string) {
    return this.walletService.getWallet(userId);
  }

  /**
   * Get wallet summary with recent transactions
   * GET /wallet/summary
   */
  @Get('summary')
  async getWalletSummary(@CurrentUser('sub') userId: string) {
    return this.walletService.getWalletSummary(userId);
  }

  @Get('linked-wallets')
  async listLinkedWallets(@CurrentUser('sub') userId: string) {
    return this.walletService.listLinkedWallets(userId);
  }

  @Post('linked-wallets/nonce')
  async requestLinkedWalletNonce(
    @CurrentUser('sub') userId: string,
    @Body() dto: RequestLinkedWalletNonceDto,
  ) {
    return this.walletService.requestLinkedWalletNonce(userId, dto);
  }

  @Post('linked-wallets/verify')
  async verifyLinkedWallet(
    @CurrentUser('sub') userId: string,
    @Body() dto: VerifyLinkedWalletDto,
  ) {
    return this.walletService.verifyLinkedWallet(userId, dto);
  }

  @Delete('linked-wallets/:id')
  async removeLinkedWallet(
    @CurrentUser('sub') userId: string,
    @Param('id') linkedWalletId: string,
  ) {
    return this.walletService.removeLinkedWallet(userId, linkedWalletId);
  }

  /**
   * Create deposit request
   * POST /wallet/deposit
   */
  @Post('deposit')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  async createDeposit(
    @CurrentUser('sub') userId: string,
    @Body() createDepositDto: CreateDepositDto,
    @Req() req: Request,
  ) {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    return this.walletService.createDeposit(userId, createDepositDto, ipAddress, userAgent);
  }

  /**
   * Upload deposit proof
   * POST /wallet/deposit/proof
   */
  @Post('deposit/proof')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/deposits',
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          callback(null, `deposit-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          callback(new Error('Only image and PDF files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadDepositProof(
    @CurrentUser('sub') userId: string,
    @Body() uploadDepositProofDto: UploadDepositProofDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.walletService.uploadDepositProof(
      userId,
      uploadDepositProofDto.depositId,
      file.path,
      uploadDepositProofDto.referenceNumber,
    );
  }

  /**
   * Get user deposits
   * GET /wallet/deposits
   */
  @Get('deposits')
  async getDeposits(
    @CurrentUser('sub') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.walletService.getDeposits(userId, paginationDto);
  }

  /**
   * Create withdrawal request
   * POST /wallet/withdrawal
   */
  @Post('withdrawal')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async createWithdrawal(
    @CurrentUser('sub') userId: string,
    @Body() createWithdrawalDto: CreateWithdrawalDto,
    @Req() req: Request,
  ) {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    return this.walletService.createWithdrawal(userId, createWithdrawalDto, ipAddress, userAgent);
  }

  /**
   * Get user withdrawals
   * GET /wallet/withdrawals
   */
  @Get('withdrawals')
  async getWithdrawals(
    @CurrentUser('sub') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.walletService.getWithdrawals(userId, paginationDto);
  }

  /**
   * Cancel pending withdrawal
   * DELETE /wallet/withdrawal/:id
   */
  @Delete('withdrawal/:id')
  async cancelWithdrawal(
    @CurrentUser('sub') userId: string,
    @Param('id') withdrawalId: string,
  ) {
    return this.walletService.cancelWithdrawal(userId, withdrawalId);
  }

  /**
   * Get user transactions
   * GET /wallet/transactions
   */
  @Get('transactions')
  async getTransactions(
    @CurrentUser('sub') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.walletService.getTransactions(userId, paginationDto);
  }
}




