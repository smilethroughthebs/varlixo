import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OnchainService } from './onchain.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { OnchainChain } from '../schemas/onchain-deposit.schema';

@Controller('onchain/deposits')
export class OnchainController {
  constructor(private readonly onchainService: OnchainService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMyDeposits(
    @CurrentUser('sub') userId: string,
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.onchainService.listUserDeposits(userId, paginationDto, status);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  async adminListDeposits(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
    @Query('chain') chain?: OnchainChain,
    @Query('network') network?: string,
    @Query('asset') asset?: string,
    @Query('userId') userId?: string,
  ) {
    return this.onchainService.adminListDeposits(paginationDto, { status, chain, network, asset, userId });
  }
}
