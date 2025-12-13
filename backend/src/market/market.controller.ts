/**
 * ==============================================
 * VARLIXO - MARKET DATA CONTROLLER
 * ==============================================
 * REST API endpoints for market data.
 */

import { Controller, Get, Query, Param } from '@nestjs/common';
import { MarketService } from './market.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  /**
   * Get top cryptocurrencies
   * GET /market/cryptos
   */
  @Public()
  @Get('cryptos')
  async getTopCryptos(@Query('limit') limit?: number) {
    const cryptos = await this.marketService.getTopCryptos(limit || 10);
    return { success: true, data: cryptos };
  }

  /**
   * Get specific crypto price
   * GET /market/cryptos/:id
   */
  @Public()
  @Get('cryptos/:id')
  async getCryptoPrice(@Param('id') coinId: string) {
    const price = await this.marketService.getCryptoPrice(coinId);
    return { success: true, data: price };
  }

  @Public()
  @Get('price/:id')
  async getSpotPrice(@Param('id') coinId: string) {
    const price = await this.marketService.getCryptoPrice(coinId);
    return {
      success: true,
      data: price
        ? {
            id: price.id,
            symbol: price.symbol,
            priceUsd: price.current_price,
            timestamp: Date.now(),
          }
        : null,
    };
  }

  /**
   * Get global market stats
   * GET /market/global
   */
  @Public()
  @Get('global')
  async getGlobalStats() {
    const stats = await this.marketService.getGlobalStats();
    return { success: true, data: stats };
  }

  /**
   * Get trending coins
   * GET /market/trending
   */
  @Public()
  @Get('trending')
  async getTrendingCoins() {
    const trending = await this.marketService.getTrendingCoins();
    return { success: true, data: trending };
  }

  /**
   * Get price history for charts
   * GET /market/history/:id
   */
  @Public()
  @Get('history/:id')
  async getPriceHistory(
    @Param('id') coinId: string,
    @Query('days') days?: number,
  ) {
    const history = await this.marketService.getPriceHistory(coinId, days || 7);
    return { success: true, data: history };
  }

  /**
   * Convert between currencies
   * GET /market/convert
   */
  @Public()
  @Get('convert')
  async convertCurrency(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: number,
  ) {
    const result = await this.marketService.convertCurrency(from, to, amount);
    return { success: true, data: result };
  }
}



