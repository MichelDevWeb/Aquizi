import { en } from './en';
import { vi } from './vi';

export const translations = {
  en,
  vi
};

export type Language = 'en' | 'vi';

// Create a union type of all possible translation keys
export type TranslationKey = keyof typeof en;

export const languageNames = {
  en: 'English',
  vi: 'Tiếng Việt'
};

export const defaultLanguage: Language = 'en';

export function getTranslation(lang: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  const translationObj = translations[lang] as Record<string, string>;
  let translation = translationObj[key] || (translations[defaultLanguage] as Record<string, string>)[key] || key;
  
  // Replace parameters in the translation string
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      translation = translation.replace(`{${paramKey}}`, String(paramValue));
    });
  }
  
  return translation;
} 