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
}

export const Money: React.FC<MoneyProps> = ({
  valueUsd,
  showSymbol = true,
  decimals = 2,
  className = '',
  title,
}) => {
  const { currencyCode, currencySymbol, locale, conversionRate, isFallbackRate } =
    useCurrencyStore();

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
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const formatted = formatter.format(localValue);

  // Show badge if using fallback rate
  if (isFallbackRate) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${className}`}
        title={title || 'Using fallback exchange rate'}
      >
        {formatted}
        <span
          className="text-xs text-yellow-400 cursor-help"
          title="This conversion rate is approximate"
        >
          *
        </span>
      </span>
    );
  }

  return (
    <span className={className} title={title}>
      {formatted}
    </span>
  );
};

export default Money;
