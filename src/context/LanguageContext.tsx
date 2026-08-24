import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LanguageCode } from '@/utils/translations';

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: keyof typeof translations.english) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageCode>('english');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as LanguageCode | null;
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  const changeLang = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key: keyof typeof translations.english) => {
    return translations[lang][key] || translations.english[key];
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