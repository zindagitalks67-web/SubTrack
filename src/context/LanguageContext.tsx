import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LanguageCode } from '@/utils/translations';

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageCode>('english');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as LanguageCode | null;
    // ✅ Use `as any` to prevent strict TypeScript errors
    if (savedLang && (translations as any)[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  const changeLang = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  // ✅ Safe t function with fallback (using `as any` for flexible indexing)
  const t = (key: string) => {
    try {
      return (translations as any)[lang]?.[key] || (translations as any).english[key] || key;
    } catch (e) {
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};