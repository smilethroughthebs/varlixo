'use client';

/**
 * ==============================================
 * VARLIXO - PROVIDERS
 * ==============================================
 * Global providers for state management and queries.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import LanguageProvider from './components/providers/LanguageProvider';
import CurrencyProvider from './components/providers/CurrencyProvider';
import LiveChat from './components/ui/LiveChat';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <CurrencyProvider>
          <LanguageProvider>
            {children}
            <LiveChat />
          </LanguageProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}



