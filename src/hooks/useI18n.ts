import { useState, useEffect } from 'react';
import i18n from '../i18n/config';

/**
 * Hook personalizado para usar traducciones de i18next en componentes React
 */
export function useI18n() {
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    // Actualizar idioma inicial
    setLanguage(i18n.language || 'en');
    loadTranslations();

    // Escuchar cambios de idioma
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng);
      loadTranslations();
    };

    window.addEventListener('languageChanged', () => {
      handleLanguageChange(i18n.language);
    });

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', () => {});
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const loadTranslations = () => {
    setTranslations(i18n.store.data[i18n.language]?.translation || {});
  };

  const t = (key: string): string => {
    return i18n.t(key);
  };

  return {
    language,
    isEnglish: language === 'en',
    t,
    translations
  };
}
