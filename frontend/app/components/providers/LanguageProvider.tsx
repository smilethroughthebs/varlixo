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

interface LanguageProviderProps {
  children: React.ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const { language, setLanguage } = useLanguageStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if this is first visit (no language saved yet)
    const savedLanguage = localStorage.getItem('varlixo-language');
    
    if (!savedLanguage) {
      // Auto-detect browser language
      const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
      const langCode = browserLang.split('-')[0].toLowerCase(); // Get 'en' from 'en-US'
      
      // Check if we support this language
      const supportedLang = languages.find(l => l.code === langCode);
      
      if (supportedLang) {
        setLanguage(supportedLang.code);
        console.log(`🌐 Auto-detected language: ${supportedLang.name} (${supportedLang.nativeName})`);
      }
    }
    
    // Apply current language settings to document
    const currentLang = languages.find(l => l.code === language);
    if (currentLang) {
      document.documentElement.lang = language;
      document.documentElement.dir = currentLang.dir;
    }
    
    setInitialized(true);
  }, [language, setLanguage]);

  // Show nothing until language is initialized to prevent flash
  if (!initialized) {
    return null;
  }

  return <>{children}</>;
}









