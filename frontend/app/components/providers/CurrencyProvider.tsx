'use client';

import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/app/lib/currency-store';

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export default function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { updateCurrencyFromServer, currencyMode } = useCurrencyStore();
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

  useEffect(() => {
    if (currencyMode !== 'auto') return;

    const refresh = () => {
      updateCurrencyFromServer();
    };

    const onVisibility = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [currencyMode, updateCurrencyFromServer]);

  if (!initialized) return null;

  return <>{children}</>;
}
