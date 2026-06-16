import i18n from 'i18next';
import esTranslations from '../../public/locales/es/translation.json';
import enTranslations from '../../public/locales/en/translation.json';

// Get initial language from localStorage or default to 'en'
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

i18n.init({
  resources: {
    es: {
      translation: esTranslations
    },
    en: {
      translation: enTranslations
    }
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export default i18n;
