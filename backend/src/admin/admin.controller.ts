/**
 * ==============================================
 * VARLIXO - ADMIN CONTROLLER
 * ==============================================
 * REST API endpoints for administrative operations.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserStatus } from '../schemas/user.schema';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // DASHBOARD
  // ==========================================

  /**
   * Get dashboard statistics
   * GET /admin/dashboard
   */
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Get dashboard statistics (alias for frontend)
   * GET /admin/stats
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  // ==========================================
  // SETTINGS
  // ==========================================

  @Get('settings')
  async getSettings() {
    return this.adminService.getAppSettings();
  }

  @Put('settings')
  async updateSettings(
    @CurrentUser('sub') adminId: string,
    @Body() body: UpdateAppSettingsDto,
  ) {
    return this.adminService.updateAppSettings(adminId, body);
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  /**
   * Get all users
   * GET /admin/users
   */
  @Get('users')
  async getUsers(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
    @Query('kycStatus') kycStatus?: string,
  ) {
    // Filter out empty string values
    const filters = {
      status: status && status.trim() ? status.trim() : undefined,
      kycStatus: kycStatus && kycStatus.trim() ? kycStatus.trim() : undefined,
    };
    return this.adminService.getUsers(paginationDto, filters);
  }

  /**
   * Get user details
   * GET /admin/users/:id
   */
  @Get('users/:id')
  async getUserDetails(@Param('id') userId: string) {
    return this.adminService.getUserDetails(userId);
  }

  /**
   * Update user status
   * PUT /admin/users/:id/status
   */
  @Put('users/:id/status')
  async updateUserStatus(
    @CurrentUser('sub') adminId: string,
    @Param('id') userId: string,
    @Body() body: { status: UserStatus; reason?: string },
  ) {
    return this.adminService.updateUserStatus(adminId, userId, body.status, body.reason);
  }

  /**
   * Adjust user balance
   * POST /admin/users/:id/balance
   */
  @Post('users/:id/balance')
  async adjustUserBalance(
    @CurrentUser('sub') adminId: string,
    @Param('id') userId: string,
    @Body() body: { amount: number; type: 'add' | 'subtract'; reason: string },
  ) {
    return this.adminService.adjustUserBalance(adminId, userId, body.amount, body.type, body.reason);
  }

  @Post('users/:id/email')
  async sendUserEmail(
    @CurrentUser('sub') adminId: string,
    @Param('id') userId: string,
    @Body() body: { subject: string; body: string },
  ) {
    return this.adminService.sendUserEmail(adminId, userId, body?.subject, body?.body);
  }

  // ==========================================
  // DEPOSIT MANAGEMENT
  // ==========================================

  /**
   * Get all deposits
   * GET /admin/deposits
   */
  @Get('deposits')
  async getDeposits(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.adminService.getDeposits(paginationDto, status);
  }

  /**
   * Approve deposit
   * POST /admin/deposits/:id/approve
   */
  @Post('deposits/:id/approve')
  async approveDeposit(
    @CurrentUser('sub') adminId: string,
    @Param('id') depositId: string,
    @Body() body: { adminNote?: string },
  ) {
    return this.adminService.approveDeposit(adminId, depositId, body.adminNote);
  }

  /**
   * Reject deposit
   * POST /admin/deposits/:id/reject
   */
  @Post('deposits/:id/reject')
  async rejectDeposit(
    @CurrentUser('sub') adminId: string,
    @Param('id') depositId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectDeposit(adminId, depositId, body.reason);
  }

  // ==========================================
  // WITHDRAWAL MANAGEMENT
  // ==========================================

  /**
   * Get all withdrawals
   * GET /admin/withdrawals
   */
  @Get('withdrawals')
  async getWithdrawals(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.adminService.getWithdrawals(paginationDto, status);
  }

  /**
   * Approve withdrawal
   * POST /admin/withdrawals/:id/approve
   */
  @Post('withdrawals/:id/approve')
  async approveWithdrawal(
    @CurrentUser('sub') adminId: string,
    @Param('id') withdrawalId: string,
    @Body() body: { txHash?: string; adminNote?: string },
  ) {
    return this.adminService.approveWithdrawal(adminId, withdrawalId, body.txHash, body.adminNote);
  }

  /**
   * Reject withdrawal
   * POST /admin/withdrawals/:id/reject
   */
  @Post('withdrawals/:id/reject')
  async rejectWithdrawal(
    @CurrentUser('sub') adminId: string,
    @Param('id') withdrawalId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectWithdrawal(adminId, withdrawalId, body.reason);
  }

  // ==========================================
  // ADMIN LOGS
  // ==========================================

  /**
   * Get admin action logs
   * GET /admin/logs
   */
  @Get('logs')
  async getAdminLogs(@Query() paginationDto: PaginationDto) {
    return this.adminService.getAdminLogs(paginationDto);
  }

  // ==========================================
  // DATA MANAGEMENT
  // ==========================================

  /**
   * Clear all test data (keeps admin accounts)
   * POST /admin/clear-test-data
   */
  @Post('clear-test-data')
  async clearTestData(@CurrentUser('sub') adminId: string) {
    return this.adminService.clearTestData(adminId);
  }
}



