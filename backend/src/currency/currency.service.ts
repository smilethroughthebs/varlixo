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
import { RedisService } from '../redis/redis.service';

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
  private readonly fxRedisTtlSeconds: number;
  private readonly primaryProvider: string;
  private readonly fallbackProvider: string;
  private readonly autoCurrency: boolean;
  private readonly defaultCurrency: string;

  constructor(
    @InjectModel(CountryRules.name) private countryRulesModel: Model<CountryRulesDocument>,
    private configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.fxTtl = parseInt(this.configService.get<string>('FX_TTL_SECONDS') || '3600', 10);
    this.fxRedisTtlSeconds = parseInt(this.configService.get<string>('FX_REDIS_TTL_SECONDS') || '21600', 10);
    this.primaryProvider =
      this.configService.get<string>('FX_PROVIDER_PRIMARY') ||
      'https://api.exchangerate.host';
    this.fallbackProvider =
      this.configService.get<string>('FX_PROVIDER_FALLBACK') ||
      'https://open.er-api.com/v6';
    this.autoCurrency = this.configService.get<string>('AUTO_CURRENCY') !== 'false';
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY') || 'USD';
  }

  private getUsdRatesCacheKey(): string {
    return 'fx:rates:USD';
  }

  private getUsdRatesLastKnownKey(): string {
    return 'fx:rates:last:USD';
  }

  private async getUsdRatesTable(): Promise<{ rates: Record<string, number>; timestamp: number; provider: string; isFallback: boolean } | null> {
    const cached = await this.redisService.getJson<{ rates: Record<string, number>; timestamp: number; provider: string; isFallback: boolean }>(
      this.getUsdRatesCacheKey(),
    );
    if (cached?.rates && typeof cached.timestamp === 'number') return cached;

    // in-memory fallback (short TTL)
    const mem = this.fxCache.get('USD:RATES');
    if (mem && Date.now() - mem.timestamp < this.fxTtl * 1000) {
      return { rates: { USD: 1 }, timestamp: mem.timestamp, provider: mem.provider, isFallback: mem.isFallback };
    }

    // Fetch full table from providers
    try {
      const response = await axios.get(`${this.primaryProvider}/latest`, {
        params: { base: 'USD' },
        timeout: 2500,
      });
      const rates: Record<string, number> = response.data?.rates || {};
      const result = {
        rates: { ...rates, USD: 1 },
        timestamp: Date.now(),
        provider: 'primary',
        isFallback: false,
      };
      await this.redisService.setJson(this.getUsdRatesCacheKey(), result, this.fxRedisTtlSeconds);
      await this.redisService.setJson(this.getUsdRatesLastKnownKey(), result);
      this.fxCache.set('USD:RATES', { rate: 1, timestamp: result.timestamp, provider: 'primary', isFallback: false });
      return result;
    } catch {
      this.logger.warn(`Primary FX provider failed for USD rates table, trying fallback...`);
    }

    try {
      // open.er-api.com/v6/latest/USD
      const response = await axios.get(`${this.fallbackProvider}/latest/USD`, { timeout: 2500 });
      const rates: Record<string, number> = response.data?.rates || {};
      const result = {
        rates: { ...rates, USD: 1 },
        timestamp: Date.now(),
        provider: 'fallback',
        isFallback: false,
      };
      await this.redisService.setJson(this.getUsdRatesCacheKey(), result, this.fxRedisTtlSeconds);
      await this.redisService.setJson(this.getUsdRatesLastKnownKey(), result);
      this.fxCache.set('USD:RATES', { rate: 1, timestamp: result.timestamp, provider: 'fallback', isFallback: false });
      return result;
    } catch {
      this.logger.warn(`Fallback FX provider failed for USD rates table`);
    }

    const lastKnown = await this.redisService.getJson<{ rates: Record<string, number>; timestamp: number; provider: string; isFallback: boolean }>(
      this.getUsdRatesLastKnownKey(),
    );
    if (lastKnown?.rates) {
      return { ...lastKnown, isFallback: true };
    }

    return null;
  }

  async getSupportedCurrencies(): Promise<{ success: true; base: string; currencies: string[]; timestamp: number; isFallback: boolean }> {
    const table = await this.getUsdRatesTable();
    const rates = table?.rates || { USD: 1 };
    const currencies = Object.keys(rates)
      .map((c) => String(c).trim().toUpperCase())
      .filter((c) => /^[A-Z]{3}$/.test(c));
    currencies.sort();

    return {
      success: true,
      base: 'USD',
      currencies,
      timestamp: table?.timestamp || Date.now(),
      isFallback: !!table?.isFallback,
    };
  }

  /**
   * Get exchange rate with caching
   */
  async getExchangeRate(from: string = 'USD', to: string = 'USD'): Promise<FxRate> {
    if (from === to) {
      return { rate: 1, timestamp: Date.now(), provider: 'local', isFallback: false };
    }

    const fromUpper = String(from).trim().toUpperCase();
    const toUpper = String(to).trim().toUpperCase();

    // Prefer a cached USD rates table to support many currencies efficiently
    const usdTable = await this.getUsdRatesTable();
    if (usdTable?.rates) {
      const usdToFrom = usdTable.rates[fromUpper];
      const usdToTo = usdTable.rates[toUpper];

      if (typeof usdToTo === 'number' && fromUpper === 'USD') {
        return {
          rate: usdToTo,
          timestamp: usdTable.timestamp,
          provider: usdTable.provider,
          isFallback: usdTable.isFallback,
        };
      }

      // Cross-rate via USD: from->to = (USD->to) / (USD->from)
      if (typeof usdToFrom === 'number' && typeof usdToTo === 'number' && usdToFrom !== 0) {
        return {
          rate: usdToTo / usdToFrom,
          timestamp: usdTable.timestamp,
          provider: usdTable.provider,
          isFallback: usdTable.isFallback,
        };
      }
    }

    const cacheKey = `${fromUpper}:${toUpper}`;
    const cached = this.fxCache.get(cacheKey);

    // Return cached if not expired
    if (cached && Date.now() - cached.timestamp < this.fxTtl * 1000) {
      return cached;
    }

    // Try to fetch from primary provider
    try {
      const rate = await this.fetchFromPrimary(fromUpper, toUpper);
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
      const rate = await this.fetchFromFallback(fromUpper, toUpper);
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
        timeout: 2500,
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
        timeout: 2500,
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
    const readyState = (this.countryRulesModel as any)?.db?.readyState;
    if (readyState !== 1) {
      return null;
    }
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
   * Build multi-currency transaction fields from a USD amount.
   * Always sets amount_usd. When AUTO_CURRENCY is enabled, it also
   * attempts to detect country and apply country rules and FX conversion
   * to populate local currency fields.
   */
  async buildTransactionCurrencyFields(params: {
    amountUsd: number;
    ipAddress?: string;
    countryCodeOverride?: string;
    currencyCodeOverride?: string;
  }): Promise<{
    amount_usd: number;
    amount_local: number;
    currency_code: string;
    conversion_rate: number;
    country_code: string;
    tax_estimate_local: number;
    is_fallback_rate: boolean;
  }> {
    const { amountUsd, ipAddress, countryCodeOverride, currencyCodeOverride } = params;

    const baseResult = {
      amount_usd: amountUsd,
      amount_local: amountUsd,
      currency_code: this.defaultCurrency || 'USD',
      conversion_rate: 1,
      country_code: 'US',
      tax_estimate_local: 0,
      is_fallback_rate: false,
    } as const;

    // If auto-currency is disabled, keep everything in default currency (USD)
    if (!this.autoCurrency) {
      return baseResult;
    }

    try {
      const countryCode =
        countryCodeOverride || (ipAddress ? await this.detectCountryFromIp(ipAddress) : 'US');

      const rules = await this.getCountryRulesOrDefault(countryCode);
      const currencyCode = (currencyCodeOverride || rules.currency || this.defaultCurrency || 'USD').toUpperCase();

      const { amount_local, conversion_rate, is_fallback } = await this.convertUsdToLocal(
        amountUsd,
        currencyCode,
      );

      let tax_estimate_local = 0;
      if (rules.tax_enabled && rules.tax_rate_percent) {
        tax_estimate_local = Math.round(amount_local * (rules.tax_rate_percent / 100) * 100) / 100;
      }

      return {
        amount_usd: amountUsd,
        amount_local,
        currency_code: currencyCode,
        conversion_rate,
        country_code: countryCode,
        tax_estimate_local,
        is_fallback_rate: is_fallback,
      };
    } catch (error) {
      this.logger.warn(`Failed to build transaction currency fields, falling back to base currency`, error as any);
      return baseResult;
    }
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
          timeout: 1200,
        });
        return response.data.country_code || 'US';
      } catch {
        // Fallback to ipwho.is
        const response = await axios.get(`https://ipwho.is?ip=${ipAddress}`, {
          timeout: 1200,
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
