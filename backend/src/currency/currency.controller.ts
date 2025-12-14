/**
 * ==============================================
 * VARLIXO - CURRENCY CONTROLLER
 * ==============================================
 * REST API endpoints for currency operations
 */

import { Controller, Get, Put, Body, Param, Query, UseGuards, Header } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { getClientIp } from '../common/utils/helpers';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  /**
   * List supported currencies from the FX provider response
   * GET /currency/supported
   */
  @Public()
  @Get('supported')
  async supportedCurrencies() {
    return this.currencyService.getSupportedCurrencies();
  }

  /**
   * Detect currency based on visitor location
   * GET /currency/detect
   */
  @Public()
  @Get('detect')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async detectCurrency(@Req() req: Request) {
    const ipAddress = getClientIp(req);
    const countryCode = await this.currencyService.detectCountryFromIp(ipAddress);
    const countryRules = await this.currencyService.getCountryRulesOrDefault(countryCode);

    const fxRate = await this.currencyService.getExchangeRate('USD', countryRules.currency);

    return {
      success: true,
      country: countryCode,
      country_rules: countryRules,
      currency_code: countryRules.currency,
      currency_symbol: countryRules.currency_symbol,
      locale: countryRules.currency_locale || 'en-US',
      conversion_rate: fxRate.rate,
      is_fallback: fxRate.isFallback,
    };
  }

  /**
   * Get exchange rates
   * GET /currency/rates?base=USD&symbols=BRL,NGN,EUR
   */
  @Public()
  @Get('rates')
  async getExchangeRates(
    @Query('base') base: string = 'USD',
    @Query('symbols') symbols: string = '',
  ) {
    const targetCurrencies = symbols
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s);

    if (targetCurrencies.length === 0) {
      return {
        success: false,
        message: 'No target currencies specified',
      };
    }

    const rates = await this.currencyService.getMultipleRates(base, targetCurrencies);

    return {
      success: true,
      base,
      rates,
      timestamp: Date.now(),
    };
  }

  /**
   * Get country-specific rules
   * GET /currency/country/:code
   */
  @Public()
  @Get('country/:code')
  async getCountryRules(@Param('code') countryCode: string) {
    const rules = await this.currencyService.getCountryRulesOrDefault(countryCode);

    return {
      success: true,
      country_code: countryCode,
      rules,
    };
  }

  /**
   * Admin: Update country rules
   * PUT /currency/admin/country/:code
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/country/:code')
  async updateCountryRules(
    @Param('code') countryCode: string,
    @Body() updateData: any,
    @CurrentUser('sub') adminId: string,
  ) {
    // Implementation would update rules in database
    return {
      success: true,
      message: 'Country rules updated',
      country_code: countryCode,
    };
  }

  /**
   * Admin: Get FX cache stats
   * GET /currency/admin/cache-stats
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/cache-stats')
  async getCacheStats() {
    const stats = this.currencyService.getCacheStats();
    return {
      success: true,
      cache_stats: stats,
    };
  }

  /**
   * Admin: Clear FX cache
   * POST /currency/admin/clear-cache
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/clear-cache')
  async clearCache() {
    this.currencyService.clearCache();
    return {
      success: true,
      message: 'FX cache cleared',
    };
  }
}
