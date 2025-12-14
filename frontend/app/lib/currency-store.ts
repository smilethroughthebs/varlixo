/**
 * ==============================================
 * VARLIXO - CURRENCY STORE (Zustand)
 * ==============================================
 * Global currency state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, authAPI } from './api';

export interface CurrencyState {
  // Currency info
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  conversionRate: number;
  isAutoDetected: boolean;
  isFallbackRate: boolean;

  // Country info
  country: string;
  countryRules: any;

  // Actions
  setPreferredCurrency: (code: string) => Promise<void>;
  detectCurrency: () => Promise<void>;
  updateCurrencyFromServer: () => Promise<void>;
  reset: () => void;
}

const defaultCurrency = {
  currencyCode: 'USD',
  currencySymbol: '$',
  locale: 'en-US',
  conversionRate: 1,
  isAutoDetected: false,
  isFallbackRate: false,
  country: 'US',
  countryRules: null,
};

const getCurrencySymbol = (currencyCode: string, locale: string) => {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);

    const symbol = parts.find((p) => p.type === 'currency')?.value;
    return symbol || currencyCode;
  } catch {
    return currencyCode;
  }
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      ...defaultCurrency,

      setPreferredCurrency: async (code: string) => {
        const normalized = String(code).trim().toUpperCase();

        const applyCurrency = async (currencyCode: string, persistToProfile: boolean) => {
          const state = get();
          const locale = state.locale || 'en-US';
          const currencySymbol = getCurrencySymbol(currencyCode, locale);

          set({
            currencyCode,
            currencySymbol,
            locale,
            isAutoDetected: false,
          });

          if (persistToProfile) {
            try {
              await api.put('/auth/profile', { preferredCurrency: currencyCode });
            } catch {
              // ignore (not logged in)
            }
          }

          const ratesResponse = await api.get('/currency/rates', {
            params: {
              base: 'USD',
              symbols: currencyCode,
            },
          });

          const payload = ratesResponse.data?.data || ratesResponse.data;
          const inner = payload?.data || payload;
          const rates = inner?.rates;
          const rate = rates?.[currencyCode] || 1;

          set({
            currencyCode,
            currencySymbol,
            locale,
            conversionRate: rate,
            isAutoDetected: false,
            isFallbackRate: false,
          });
        };

        try {
          await applyCurrency(normalized, true);
        } catch (error) {
          console.error('Failed to set preferred currency:', error);
        }
      },

      detectCurrency: async () => {
        try {
          const response = await api.get('/currency/detect');
          const payload = response.data?.data || response.data;
          const inner = payload?.data || payload;
          const { country, currency_code, currency_symbol, locale, conversion_rate, is_fallback } = inner;

          set({
            country,
            currencyCode: currency_code,
            currencySymbol: currency_symbol,
            locale,
            conversionRate: conversion_rate,
            isAutoDetected: true,
            isFallbackRate: is_fallback,
            countryRules: inner.country_rules,
          });
        } catch (error) {
          console.error('Failed to detect currency:', error);
          // Fall back to defaults
          set(defaultCurrency);
        }
      },

      updateCurrencyFromServer: async () => {
        try {
          const applyCurrencyNoPersist = async (currencyCode: string) => {
            const normalized = String(currencyCode).trim().toUpperCase();
            const state = get();
            const locale = state.locale || 'en-US';
            const currencySymbol = getCurrencySymbol(normalized, locale);

            set({
              currencyCode: normalized,
              currencySymbol,
              locale,
              isAutoDetected: false,
            });

            const ratesResponse = await api.get('/currency/rates', {
              params: {
                base: 'USD',
                symbols: normalized,
              },
            });

            const payload = ratesResponse.data?.data || ratesResponse.data;
            const inner = payload?.data || payload;
            const rates = inner?.rates;
            const rate = rates?.[normalized] || 1;

            set({
              currencyCode: normalized,
              currencySymbol,
              locale,
              conversionRate: rate,
              isAutoDetected: false,
              isFallbackRate: false,
            });
          };

          // Try profile preference first
          try {
            const userResponse = await authAPI.getProfile();
            const profile = userResponse.data?.data;
            const preferred = profile?.user?.preferredCurrency;
            if (preferred) {
              await applyCurrencyNoPersist(preferred);
              return;
            }
          } catch {
            // ignore
          }

          // If we already have a persisted currencyCode (store persistence) AND it was manually selected,
          // just refresh its rate.
          const existing = get().currencyCode;
          const existingWasAuto = get().isAutoDetected;
          if (existing && existing !== 'USD' && !existingWasAuto) {
            await applyCurrencyNoPersist(existing);
            return;
          }

          // Fall back to IP detection
          await get().detectCurrency();
        } catch (error) {
          console.error('Failed to update currency from server:', error);
        }
      },

      reset: () => {
        set(defaultCurrency);
      },
    }),
    {
      name: 'currency-store',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Previous versions didn't persist isAutoDetected. Those values were almost always
        // the result of auto-detection, so default them to true to allow VPN/IP changes
        // to re-trigger detection.
        if (version === 0 && persistedState && typeof persistedState === 'object') {
          if (persistedState.isAutoDetected === undefined) {
            return { ...persistedState, isAutoDetected: true };
          }
        }
        return persistedState;
      },
      partialize: (state) => ({
        currencyCode: state.currencyCode,
        currencySymbol: state.currencySymbol,
        locale: state.locale,
        country: state.country,
        isAutoDetected: state.isAutoDetected,
      }),
    }
  )
);
