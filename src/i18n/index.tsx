/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { de } from './de';
import { en } from './en';

type Language = 'de' | 'en';
type Translations = typeof de;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, ...args: string[]) => string;
}

const translations: Record<Language, Translations> = { de, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'pitchtimer_language';
const SUPPORTED_LANGUAGES: Language[] = ['de', 'en'];

function readStoredLanguage(): Language | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    return saved && SUPPORTED_LANGUAGES.includes(saved) ? saved : null;
  } catch (error) {
    console.error('Failed to read language from local storage:', error);
    return null;
  }
}

function writeStoredLanguage(language: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to save language to local storage:', error);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = readStoredLanguage();
    if (saved) {
      return saved;
    }
    const browserLang = navigator.language.startsWith('de') ? 'de' : 'en';
    return browserLang;
  });

  useEffect(() => {
    writeStoredLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key: keyof Translations, ...args: string[]) => {
    let text = translations[language][key] || translations['de'][key] || key;
    args.forEach((arg, i) => {
      text = text.replace(`{${i}}`, arg);
    });
    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
