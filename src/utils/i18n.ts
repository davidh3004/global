import esTranslations from '../../public/locales/es/translation.json';
import enTranslations from '../../public/locales/en/translation.json';

const translations = {
  es: esTranslations,
  en: enTranslations
};

export function getTranslations(locale: string = 'en') {
  return translations[locale as keyof typeof translations] || translations.en;
}

export function t(key: string, locale: string = 'en'): string {
  const keys = key.split('.');
  let value: any = getTranslations(locale);

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}
