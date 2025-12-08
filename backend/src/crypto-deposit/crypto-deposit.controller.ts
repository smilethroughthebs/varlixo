import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CryptoDepositService } from './crypto-deposit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CryptoCurrency, CryptoDepositStatus } from '../schemas/crypto-deposit.schema';

@Controller('deposits/crypto')
export class CryptoDepositController {
  constructor(private readonly cryptoDepositService: CryptoDepositService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createDeposit(
    @CurrentUser('sub') userId: string,
    @Body() body: { currency: CryptoCurrency; amountCrypto: number; amountUsd?: number },
  ) {
    return this.cryptoDepositService.createDeposit(userId, body.currency, body.amountCrypto, body.amountUsd);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserDeposits(
    @CurrentUser('sub') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.cryptoDepositService.getUserDeposits(userId, paginationDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  async adminListDeposits(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: CryptoDepositStatus,
  ) {
    return this.cryptoDepositService.adminListDeposits(paginationDto, status);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/:id/status')
  async adminUpdateStatus(
    @CurrentUser('sub') adminId: string,
    @Param('id') depositId: string,
    @Body() body: { status: CryptoDepositStatus; txHash?: string; amountUsd?: number },
  ) {
    return this.cryptoDepositService.adminUpdateStatus(adminId, depositId, body.status, body.txHash, body.amountUsd);
  }
}
