import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
} from "react";
import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import enCommon from "../locales/en/common.json";
import amCommon from "../locales/am/common.json";

export type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

if (!i18next.isInitialized) {
  const initialLanguage =
    (localStorage.getItem("language") as Language | null) || "en";

  i18next.use(initReactI18next).init({
    resources: {
      en: { translation: enCommon },
      am: { translation: amCommon },
    },
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t: i18nTranslate, i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(
    (i18n.language as Language) || "en",
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    void i18n.changeLanguage(lang);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string) => i18nTranslate(key),
    }),
    [language, i18nTranslate],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
