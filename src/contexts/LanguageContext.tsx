import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.docxTranslate': 'Docx Translate',
    'nav.voiceTranslate': 'Voice Translate',
    'nav.credits': 'Credits:',
    'nav.developerApi': 'Developer API',
    'nav.signIn': 'Sign In',
    'nav.logout': 'Logout',
    // We can add more hardcoded translations here
    'landing.title': 'AI Translation Pipeline',
    'landing.subtitle': 'Professional document and voice translation powered by Gemini AI',
    'landing.getStarted': 'Get Started',
  },
  th: {
    'nav.docxTranslate': 'แปลไฟล์เอกสาร (Docx)',
    'nav.voiceTranslate': 'แปลเสียง',
    'nav.credits': 'เครดิต:',
    'nav.developerApi': 'สำหรับนักพัฒนา (API)',
    'nav.signIn': 'เข้าสู่ระบบ',
    'nav.logout': 'ออกจากระบบ',
    'landing.title': 'ระบบแปลภาษาด้วย AI',
    'landing.subtitle': 'แปลเอกสารและเสียงระดับมืออาชีพ ขับเคลื่อนด้วย Gemini AI',
    'landing.getStarted': 'เริ่มต้นใช้งาน',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
