import { LANGUAGE_KEY } from '@/constants';
import { activateLocale } from '@/i18n';
import { useEffect } from 'react';

/**
 * Hook to initialize and handle language changes
 */
export const useLanguageInit = (): void => {
  useEffect(() => {
    const language = localStorage.getItem(LANGUAGE_KEY);

    if (language) {
      const cleanLanguage = language.replaceAll('"', '');
      activateLocale(cleanLanguage);
    }
  }, []);
};
