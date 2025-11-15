import React, { createContext, useContext, useState, useMemo } from 'react';
import translations from '../lib/translations.js';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const handleSetLanguage = (lang) => {
    if (['en', 'ar'].includes(lang)) {
      setLanguage(lang);
    }
  };

  const value = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t: translations[language],
    dir: language === 'ar' ? 'rtl' : 'ltr',
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};