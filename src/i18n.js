import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ru from "./locales/ru.json";

function initI18n(lang) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        ru: { translation: ru },
      },
      lng: lang,
      fallbackLng: "en",
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
      },
      interpolation: {
        escapeValue: false,
      },
    });

  return i18n;
}

// Function to get saved language from chrome.storage and initialize i18n
export function initializeI18n() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["app_language"], (result) => {
      const savedLang = result.app_language || undefined; // undefined will let detector work
      const instance = initI18n(savedLang);
      resolve(instance);
    });
  });
}
