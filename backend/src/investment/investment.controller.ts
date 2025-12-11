/**
 * ==============================================
 * VARLIXO - INVESTMENT CONTROLLER
 * ==============================================
 * REST API endpoints for investment operations.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto, CalculateReturnsDto, CreatePlanDto, UpdatePlanDto } from './dto/investment.dto';
import { StartRecurringPlanDto } from './dto/recurring-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getClientIp } from '../common/utils/helpers';

@Controller('investments')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  /**
   * Get all active investment plans
   * GET /investments/plans
   */
  @Public()
  @Get('plans')
  async getActivePlans() {
    return this.investmentService.getActivePlans();
  }

  /**
   * Get plan details by slug
   * GET /investments/plans/:slug
   */
  @Public()
  @Get('plans/:slug')
  async getPlanBySlug(@Param('slug') slug: string) {
    return this.investmentService.getPlanBySlug(slug);
  }

  /**
   * Calculate expected returns
   * POST /investments/calculate
   */
  @Public()
  @Post('calculate')
  async calculateReturns(@Body() calculateDto: CalculateReturnsDto) {
    return this.investmentService.calculateReturns(calculateDto);
  }

  // ==========================================
  // USER ENDPOINTS (Authenticated)
  // ==========================================

  /**
   * Create a new investment
   * POST /investments
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createInvestment(
    @CurrentUser('sub') userId: string,
    @Body() createDto: CreateInvestmentDto,
    @Req() req: Request,
  ) {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    return this.investmentService.createInvestment(userId, createDto, ipAddress, userAgent);
  }

  /**
   * Start a recurring investment plan
   * POST /investments/recurring/start
   */
  @UseGuards(JwtAuthGuard)
  @Post('recurring/start')
  async startRecurringPlan(
    @CurrentUser('sub') userId: string,
    @Body() startDto: StartRecurringPlanDto,
  ) {
    return this.investmentService.startRecurringPlan(userId, startDto);
  }

  /**
   * Get user's investments
   * GET /investments/my
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getUserInvestments(
    @CurrentUser('sub') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.investmentService.getUserInvestments(userId, paginationDto);
  }

  /**
   * Get user's recurring investment plans
   * GET /investments/recurring/my
   */
  @UseGuards(JwtAuthGuard)
  @Get('recurring/my')
  async getUserRecurringPlans(@CurrentUser('sub') userId: string) {
    return this.investmentService.getUserRecurringPlans(userId);
  }

  /**
   * Pay a monthly installment for a recurring plan
   * POST /investments/recurring/:id/pay
   */
  @UseGuards(JwtAuthGuard)
  @Post('recurring/:id/pay')
  async payRecurringInstallment(
    @CurrentUser('sub') userId: string,
    @Param('id') planId: string,
    @Req() req: Request,
  ) {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    return this.investmentService.payRecurringInstallment(userId, planId, ipAddress, userAgent);
  }

  /**
   * Get user's investment summary
   * GET /investments/summary
   */
  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getInvestmentSummary(@CurrentUser('sub') userId: string) {
    return this.investmentService.getInvestmentSummary(userId);
  }

  /**
   * Get investment details
   * GET /investments/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getInvestmentDetails(
    @CurrentUser('sub') userId: string,
    @Param('id') investmentId: string,
  ) {
    return this.investmentService.getInvestmentDetails(userId, investmentId);
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  /**
   * Admin: Get all user investments (for admin dashboard)
   * GET /investments/admin/all
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async getAllInvestments(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.investmentService.getAllUserInvestments(paginationDto, status);
  }

  /**
   * Admin: Get all recurring investment plans
   * GET /investments/admin/recurring
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/recurring')
  async getAllRecurringPlans(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.investmentService.getAllRecurringPlans(paginationDto, status);
  }

  /**
   * Admin: Get all plans
   * GET /investments/admin/plans
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/plans')
  async getAllPlans(@Query() paginationDto: PaginationDto) {
    return this.investmentService.getAllPlans(paginationDto);
  }

  /**
   * Admin: Create a new plan
   * POST /investments/admin/plans
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/plans')
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.investmentService.createPlan(createPlanDto);
  }

  /**
   * Admin: Update a plan
   * PUT /investments/admin/plans/:id
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/plans/:id')
  async updatePlan(
    @Param('id') planId: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.investmentService.updatePlan(planId, updatePlanDto);
  }

  /**
   * Admin: Delete/deactivate a plan
   * DELETE /investments/admin/plans/:id
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/plans/:id')
  async deletePlan(@Param('id') planId: string) {
    return this.investmentService.deletePlan(planId);
  }

  /**
   * Admin: Manually trigger profit processing
   * POST /investments/admin/process-profits
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/process-profits')
  async processProfits() {
    return this.investmentService.processDailyProfits();
  }
}



