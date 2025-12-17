'use client';

/**
 * ==============================================
 * VARLIXO - MONEY COMPONENT
 * ==============================================
 * Reusable component for displaying formatted currency amounts
 * Converts from USD to local currency based on store
 */

import React from 'react';
import { useCurrencyStore } from '@/app/lib/currency-store';

interface MoneyProps {
  valueUsd: number | string;
  showSymbol?: boolean;
  decimals?: number;
  className?: string;
  title?: string;
  showUsdEquivalent?: boolean;
}

export const Money: React.FC<MoneyProps> = ({
  valueUsd,
  showSymbol = true,
  decimals,
  className = '',
  title,
  showUsdEquivalent = true,
}) => {
  const { currencyCode, currencySymbol, locale, conversionRate, isFallbackRate } =
    useCurrencyStore();

  const resolvedLocalDecimals = (() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits;
    } catch {
      return 2;
    }
  })();

  const decimalsToUse = typeof decimals === 'number' ? decimals : resolvedLocalDecimals;

  const numValue = typeof valueUsd === 'string' ? parseFloat(valueUsd) : valueUsd;

  if (isNaN(numValue)) {
    return <span className={className}>-</span>;
  }

  // Convert from USD to local currency
  const localValue = numValue * conversionRate;

  // Format using Intl.NumberFormat
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimalsToUse,
    maximumFractionDigits: decimalsToUse,
  });

  const formatted = formatter
    .formatToParts(localValue)
    .filter((part) => {
      if (part.type !== 'currency') return true;
      return showSymbol;
    })
    .map((part) => {
      if (part.type !== 'currency') return part.value;
      return currencySymbol || part.value;
    })
    .join('');

  const showUsd = showUsdEquivalent && currencyCode !== 'USD';
  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedUsd = usdFormatter.format(numValue);

  // Show badge if using fallback rate
  if (isFallbackRate) {
    return (
      <span className={className} title={title || 'Using fallback exchange rate'}>
        <span className="inline-flex items-center gap-1">
          {formatted}
          <span
            className="text-xs text-yellow-400 cursor-help"
            title="This conversion rate is approximate"
          >
            *
          </span>
        </span>
        {showUsd && (
          <span className="block text-xs text-gray-500 mt-0.5">{formattedUsd}</span>
        )}
      </span>
    );
  }

  return (
    <span className={className} title={title}>
      {formatted}
      {showUsd && (
        <span className="block text-xs text-gray-500 mt-0.5">{formattedUsd}</span>
      )}
    </span>
  );
};

export default Money;
