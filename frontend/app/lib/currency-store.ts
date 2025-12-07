/**
 * ==============================================
 * VARLIXO - CURRENCY STORE (Zustand)
 * ==============================================
 * Global currency state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      ...defaultCurrency,

      setPreferredCurrency: async (code: string) => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          
          // Save to user profile if logged in
          try {
            await axios.put(`${apiUrl}/users/me`, { preferredCurrency: code });
          } catch (error) {
            console.warn('Could not save currency preference to profile');
          }

          // Update local store
          const state = get();
          
          // Fetch conversion rate
          const ratesResponse = await axios.get(`${apiUrl}/currency/rates`, {
            params: {
              base: 'USD',
              symbols: code,
            },
          });

          const rate = ratesResponse.data.rates?.[code] || 1;
          const countryRules = await axios.get(`${apiUrl}/currency/country/${code}`);

          set({
            currencyCode: code,
            currencySymbol: countryRules.data.rules.currency_symbol || '$',
            locale: countryRules.data.rules.currency_locale || 'en-US',
            conversionRate: rate,
            isAutoDetected: false,
            isFallbackRate: false,
            countryRules: countryRules.data.rules,
          });
        } catch (error) {
          console.error('Failed to set preferred currency:', error);
        }
      },

      detectCurrency: async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          
          const response = await axios.get(`${apiUrl}/currency/detect`);
          const { country, currency_code, currency_symbol, locale, conversion_rate, is_fallback } = response.data;

          set({
            country,
            currencyCode: currency_code,
            currencySymbol: currency_symbol,
            locale,
            conversionRate: conversion_rate,
            isAutoDetected: true,
            isFallbackRate: is_fallback,
            countryRules: response.data.country_rules,
          });
        } catch (error) {
          console.error('Failed to detect currency:', error);
          // Fall back to defaults
          set(defaultCurrency);
        }
      },

      updateCurrencyFromServer: async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          
          // Try to get user's preferred currency from profile
          try {
            const userResponse = await axios.get(`${apiUrl}/auth/profile`);
            if (userResponse.data.user?.preferredCurrency) {
              await get().setPreferredCurrency(userResponse.data.user.preferredCurrency);
              return;
            }
          } catch (error) {
            console.warn('Could not fetch user profile');
          }

          // Fall back to detection
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
      partialize: (state) => ({
        currencyCode: state.currencyCode,
        currencySymbol: state.currencySymbol,
        locale: state.locale,
        country: state.country,
      }),
    }
  )
);
