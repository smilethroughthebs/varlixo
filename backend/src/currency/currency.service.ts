/**
 * ==============================================
 * VARLIXO - CURRENCY SERVICE
 * ==============================================
 * Handles currency detection, conversion, and country rules.
 * Provides multi-currency support with FX rate caching.
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CountryRules, CountryRulesDocument } from '../schemas/country-rules.schema';

interface FxRate {
  rate: number;
  timestamp: number;
  provider: string;
  isFallback: boolean;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private fxCache = new Map<string, FxRate>();
  private readonly fxTtl: number;
  private readonly primaryProvider: string;
  private readonly fallbackProvider: string;
  private readonly autoCurrency: boolean;

  constructor(
    @InjectModel(CountryRules.name) private countryRulesModel: Model<CountryRulesDocument>,
    private configService: ConfigService,
  ) {
    this.fxTtl = parseInt(this.configService.get<string>('FX_TTL_SECONDS') || '3600', 10);
    this.primaryProvider =
      this.configService.get<string>('FX_PROVIDER_PRIMARY') ||
      'https://api.exchangerate.host';
    this.fallbackProvider =
      this.configService.get<string>('FX_PROVIDER_FALLBACK') ||
      'https://open.er-api.com/v6';
    this.autoCurrency = this.configService.get<string>('AUTO_CURRENCY') === 'true';
  }

  /**
   * Get exchange rate with caching
   */
  async getExchangeRate(from: string = 'USD', to: string = 'USD'): Promise<FxRate> {
    if (from === to) {
      return { rate: 1, timestamp: Date.now(), provider: 'local', isFallback: false };
    }

    const cacheKey = `${from}:${to}`;
    const cached = this.fxCache.get(cacheKey);

    // Return cached if not expired
    if (cached && Date.now() - cached.timestamp < this.fxTtl * 1000) {
      return cached;
    }

    // Try to fetch from primary provider
    try {
      const rate = await this.fetchFromPrimary(from, to);
      const fxData: FxRate = {
        rate,
        timestamp: Date.now(),
        provider: 'primary',
        isFallback: false,
      };
      this.fxCache.set(cacheKey, fxData);
      return fxData;
    } catch (error) {
      this.logger.warn(`Primary FX provider failed for ${cacheKey}, trying fallback...`);
    }

    // Try fallback provider
    try {
      const rate = await this.fetchFromFallback(from, to);
      const fxData: FxRate = {
        rate,
        timestamp: Date.now(),
        provider: 'fallback',
        isFallback: false,
      };
      this.fxCache.set(cacheKey, fxData);
      return fxData;
    } catch (error) {
      this.logger.warn(`Fallback FX provider also failed for ${cacheKey}`);
    }

    // Return cached data if available (even if expired) or fallback to 1:1
    if (cached) {
      return { ...cached, isFallback: true };
    }

    return { rate: 1, timestamp: Date.now(), provider: 'fallback', isFallback: true };
  }

  /**
   * Fetch rate from primary provider (exchangerate.host)
   */
  private async fetchFromPrimary(from: string, to: string): Promise<number> {
    try {
      const response = await axios.get(`${this.primaryProvider}/latest`, {
        params: {
          base: from,
          symbols: to,
        },
        timeout: 5000,
      });

      const rate = response.data.rates?.[to];
      if (!rate) throw new Error(`No rate found for ${to}`);
      return rate;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch rate from fallback provider (open.er-api.com)
   */
  private async fetchFromFallback(from: string, to: string): Promise<number> {
    try {
      const response = await axios.get(`${this.fallbackProvider}/latest/${from}`, {
        timeout: 5000,
      });

      const rate = response.data.rates?.[to];
      if (!rate) throw new Error(`No rate found for ${to}`);
      return rate;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert amount from USD to target currency
   */
  async convertUsdToLocal(
    amountUsd: number,
    targetCurrency: string,
  ): Promise<{ amount_local: number; conversion_rate: number; is_fallback: boolean }> {
    if (targetCurrency === 'USD') {
      return { amount_local: amountUsd, conversion_rate: 1, is_fallback: false };
    }

    const fxRate = await this.getExchangeRate('USD', targetCurrency);
    return {
      amount_local: Math.round(amountUsd * fxRate.rate * 100) / 100, // Round to 2 decimals
      conversion_rate: fxRate.rate,
      is_fallback: fxRate.isFallback,
    };
  }

  /**
   * Convert amount from local currency to USD
   */
  async convertLocalToUsd(
    amountLocal: number,
    localCurrency: string,
  ): Promise<number> {
    if (localCurrency === 'USD') {
      return amountLocal;
    }

    const fxRate = await this.getExchangeRate(localCurrency, 'USD');
    return Math.round((amountLocal / fxRate.rate) * 100) / 100;
  }

  /**
   * Get country rules
   */
  async getCountryRules(countryCode: string): Promise<CountryRulesDocument | null> {
    return this.countryRulesModel.findOne({
      country_code: countryCode.toUpperCase(),
    });
  }

  /**
   * Get or create default rules for country
   */
  async getCountryRulesOrDefault(countryCode: string): Promise<CountryRulesDocument | any> {
    const rules = await this.getCountryRules(countryCode);
    if (rules) return rules;

    // Return default rules
    return {
      country_code: countryCode.toUpperCase(),
      currency: 'USD',
      currency_symbol: '$',
      kyc_level: 'basic',
      payment_hints: [],
      is_blocked: false,
      tax_enabled: false,
      tax_rate_percent: 0,
    };
  }

  /**
   * Detect country from IP address
   */
  async detectCountryFromIp(ipAddress: string): Promise<string> {
    if (!this.autoCurrency) {
      return 'US'; // Default to US if auto-currency disabled
    }

    try {
      // Try ipapi.co first
      try {
        const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`, {
          timeout: 3000,
        });
        return response.data.country_code || 'US';
      } catch {
        // Fallback to ipwho.is
        const response = await axios.get(`https://ipwho.is?ip=${ipAddress}`, {
          timeout: 3000,
        });
        return response.data.country_code || 'US';
      }
    } catch (error) {
      this.logger.warn(`Failed to detect country for IP ${ipAddress}, defaulting to US`);
      return 'US';
    }
  }

  /**
   * Get multiple exchange rates
   */
  async getMultipleRates(baseCurrency: string, targetCurrencies: string[]): Promise<Record<string, number>> {
    const rates: Record<string, number> = {};

    for (const targetCurrency of targetCurrencies) {
      try {
        const fxRate = await this.getExchangeRate(baseCurrency, targetCurrency);
        rates[targetCurrency] = fxRate.rate;
      } catch (error) {
        rates[targetCurrency] = 1; // Fallback to 1:1
      }
    }

    return rates;
  }

  /**
   * Clear FX cache
   */
  clearCache(): void {
    this.fxCache.clear();
    this.logger.log('FX cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.fxCache.size,
      entries: Array.from(this.fxCache.keys()),
    };
  }
}
