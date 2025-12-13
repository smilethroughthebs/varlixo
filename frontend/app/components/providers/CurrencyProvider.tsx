'use client';

import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/app/lib/currency-store';

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export default function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { updateCurrencyFromServer } = useCurrencyStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await updateCurrencyFromServer();
      } finally {
        if (mounted) setInitialized(true);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [updateCurrencyFromServer]);

  if (!initialized) return null;

  return <>{children}</>;
}
