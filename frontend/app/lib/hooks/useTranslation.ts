'use client';

/**
 * ==============================================
 * VARLIXO - TRANSLATION HOOK
 * ==============================================
 * Custom hook for easy access to translations
 */

import { useLanguageStore } from '../store';
import { getTranslation, Language } from '../i18n';

interface UseTranslationReturn {
  t: (key: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export function useTranslation(): UseTranslationReturn {
  const { language, setLanguage } = useLanguageStore();

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return {
    t,
    language,
    setLanguage,
  };
}









