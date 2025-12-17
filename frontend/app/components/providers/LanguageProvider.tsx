'use client';

/**
 * ==============================================
 * VARLIXO - LANGUAGE PROVIDER
 * ==============================================
 * Automatically detects and sets language based on browser settings
 */

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/app/lib/store';
import { Language, languages } from '@/app/lib/i18n';
import { useCurrencyStore } from '@/app/lib/currency-store';
import { useAuthStore } from '@/app/lib/store';
import { authAPI } from '@/app/lib/api';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const { language, setLanguage } = useLanguageStore();
  const { country, locale } = useCurrencyStore();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('varlixo-language');

    const normalizeLang = (value?: string): Language | undefined => {
      const code = String(value || '').split('-')[0].trim().toLowerCase();
      const supported = languages.find((l) => l.code === code);
      return supported?.code;
    };

    const inferFromCountry = (cc?: string): Language => {
      const upper = String(cc || '').trim().toUpperCase();

      const map: Record<string, Language> = {
        US: 'en',
        CA: 'en',
        GB: 'en',
        AU: 'en',
        NZ: 'en',

        ES: 'es',
        MX: 'es',

        FR: 'fr',

        DE: 'de',

        CN: 'zh',

        SA: 'ar',
        AE: 'ar',
        EG: 'ar',

        BR: 'pt',
        PT: 'pt',

        RU: 'ru',
      };

      return map[upper] || 'en';
    };

    const applyAndPersist = async (lang: Language) => {
      setLanguage(lang);

      if (isAuthenticated) {
        try {
          await authAPI.updateProfile({ preferredLanguage: lang });
          updateUser({ preferredLanguage: lang });
        } catch {
          // ignore
        }
      }
    };

    const init = async () => {
      // If user is logged in and has a preferredLanguage, prefer it.
      if (user?.preferredLanguage) {
        const fromProfile = normalizeLang(user.preferredLanguage);
        if (fromProfile && fromProfile !== language) {
          await applyAndPersist(fromProfile);
        }
        return;
      }

      // First visit only: auto-detect based on currency detector locale/country.
      if (!savedLanguage) {
        const fromLocale = normalizeLang(locale);
        if (fromLocale) {
          await applyAndPersist(fromLocale);
          return;
        }

        const fromCountry = inferFromCountry(country);
        await applyAndPersist(fromCountry);
      }
    };

    init();
    
    // Apply current language settings to document
    const currentLang = languages.find(l => l.code === language);
    if (currentLang) {
      document.documentElement.lang = language;
      document.documentElement.dir = currentLang.dir;
    }
    
    setInitialized(true);
  }, [country, locale, isAuthenticated, language, setLanguage, updateUser, user?.preferredLanguage]);

  // Show nothing until language is initialized to prevent flash
  if (!initialized) {
    return null;
  }

  return <>{children}</>;
}









